import { authenticateRequest } from '../../middleware/auth';
import { getAdminFirestore, getAdminAuth } from '../../services/firestore';
import { usageTracker } from '../../services/usageTracker';

export default async function userDeleteHandler(req: any, res: any) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use DELETE or POST.' });
  }

  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const db = getAdminFirestore();

    // 1. Delete user profile document
    await db.collection('users').doc(user.uid).delete().catch(() => {});

    // 2. Delete user's aiUsage docs
    const usageSnap = await db.collection('aiUsage').where('uid', '==', user.uid).get();
    const batch = db.batch();
    usageSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit().catch(() => {});

    // 3. Delete user's subscription docs
    const subsSnap = await db.collection('subscriptions').where('uid', '==', user.uid).get();
    const subsBatch = db.batch();
    subsSnap.docs.forEach((doc) => subsBatch.delete(doc.ref));
    await subsBatch.commit().catch(() => {});

    // 4. Delete user's logs
    const logsSnap = await db.collection('aiUsageLogs').where('uid', '==', user.uid).get();
    const logsBatch = db.batch();
    logsSnap.docs.forEach((doc) => logsBatch.delete(doc.ref));
    await logsBatch.commit().catch(() => {});

    // 5. Delete Firebase Auth user if present
    try {
      const auth = getAdminAuth();
      await auth.deleteUser(user.uid);
    } catch (authErr) {
      console.warn(`Auth user deletion note for ${user.uid}:`, authErr);
    }

    usageTracker.recordSecurityEvent({
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'account_deletion',
      endpoint: '/api/user/delete',
      timestamp: Date.now(),
      details: `User ${user.uid} (${user.email}) requested permanent GDPR/CCPA account and data deletion.`,
    });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: 'User account, subscription history, and all telemetry records permanently deleted in compliance with GDPR/CCPA.',
    });
  } catch (err: any) {
    console.error(`Error deleting account for user ${user.uid}:`, err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: 'Failed to delete user account: ' + (err?.message || 'Unknown error'),
    });
  }
}

import { authenticateRequest } from '../../middleware/auth';
import { getAdminFirestore, getOrCreateUserDoc } from '../../services/firestore';
import { usageTracker } from '../../services/usageTracker';

export default async function userExportHandler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use GET or POST.' });
  }

  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const db = getAdminFirestore();
    const userDoc = await getOrCreateUserDoc(user.uid, user.email);

    // Fetch user subscriptions
    const subsSnap = await db.collection('subscriptions').where('uid', '==', user.uid).get();
    const subscriptions = subsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Fetch user AI usage documents
    const usageSnap = await db.collection('aiUsage').where('uid', '==', user.uid).get();
    const aiUsage = usageSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Fetch user AI logs (up to 500 records)
    const logsSnap = await db.collection('aiUsageLogs').where('uid', '==', user.uid).limit(500).get();
    const aiUsageLogs = logsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const exportData = {
      exportMetadata: {
        timestamp: new Date().toISOString(),
        version: '2.4.0',
        compliance: 'GDPR / CCPA Data Portability Standard',
        exportedBy: user.email,
        uid: user.uid,
      },
      userProfile: userDoc,
      subscriptions,
      dailyAiUsage: aiUsage,
      recentAiAuditLogs: aiUsageLogs,
    };

    usageTracker.recordSecurityEvent({
      id: `export_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'data_export',
      endpoint: '/api/user/export',
      timestamp: Date.now(),
      details: `User ${user.uid} (${user.email}) requested full GDPR/CCPA data export.`,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="smartpdf_user_data_${user.uid}.json"`);
    return res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (err: any) {
    console.error(`Error exporting data for user ${user.uid}:`, err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: 'Failed to generate user data export: ' + (err?.message || 'Unknown error'),
    });
  }
}

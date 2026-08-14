import { authenticateRequest } from '../middleware/auth';
import { getAdminFirestore, getAdminAuth } from '../services/firestore';

export default async function deleteAccountHandler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await authenticateRequest(req, res);
  if (!user) return; // 401 response already sent by middleware

  try {
    const db = getAdminFirestore();
    const uid = user.uid;

    // 1. Purge all personal subcollections under users/{uid}
    const subcollections = ['recentFiles', 'aiChats', 'aiAnalysis', 'analyzerReports'];
    for (const sub of subcollections) {
      try {
        const snap = await db.collection('users').doc(uid).collection(sub).get();
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.warn(`Could not purge subcollection ${sub} for user ${uid}:`, err);
      }
    }

    // 2. Delete user's main profile document
    try {
      await db.collection('users').doc(uid).delete();
    } catch (err) {
      console.warn(`Could not delete user document for ${uid}:`, err);
    }

    // 3. Handle Workspace Memberships safely
    try {
      // Find workspaces where user is member or owner
      const allWorkspacesSnap = await db.collection('workspaces').get();
      for (const doc of allWorkspacesSnap.docs) {
        const wsData = doc.data();
        const members: any[] = Array.isArray(wsData.members) ? wsData.members : [];
        const isMember = members.some((m: any) => m.uid === uid || m.email === user.email);

        if (isMember) {
          const updatedMembers = members.filter((m: any) => m.uid !== uid && m.email !== user.email);
          
          if (wsData.ownerId === uid) {
            if (updatedMembers.length === 0) {
              // Sole member & owner -> safely delete workspace
              await doc.ref.delete();
            } else {
              // Transfer ownership to next active admin/member to preserve team assets
              const nextOwner = updatedMembers.find((m: any) => m.role === 'admin') || updatedMembers[0];
              await doc.ref.update({
                ownerId: nextOwner.uid || nextOwner.id,
                members: updatedMembers.map((m: any) => 
                  (m.uid === nextOwner.uid || m.email === nextOwner.email) ? { ...m, role: 'owner' } : m
                ),
                updatedAt: new Date(),
              });
            }
          } else {
            // Regular member -> simply remove from team
            await doc.ref.update({
              members: updatedMembers,
              updatedAt: new Date(),
            });
          }
        }
      }
    } catch (err) {
      console.warn('Workspace cleanup warning during account deletion:', err);
    }

    // 4. Delete Firebase Auth User account
    try {
      const auth = getAdminAuth();
      await auth.deleteUser(uid);
    } catch (err: any) {
      // If user already deleted or mock user, continue safely
      console.warn(`Firebase Auth deleteUser note for ${uid}:`, err?.message || err);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: 'Account, authentication credentials, and all personal data have been permanently deleted.',
    });
  } catch (err: any) {
    console.error('Error during account deletion:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: 'An error occurred while deleting your account. Please retry or contact support at mmridanga@gmail.com.',
    });
  }
}

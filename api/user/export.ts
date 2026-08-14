import { authenticateRequest } from '../middleware/auth';
import { getAdminFirestore } from '../services/firestore';

export default async function exportUserDataHandler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await authenticateRequest(req, res);
  if (!user) return; // 401 response already sent by middleware

  try {
    const db = getAdminFirestore();

    // 1. Fetch user profile
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : { uid: user.uid, email: user.email };

    // Sanitize user data (exclude any internal/provider credentials if present)
    const sanitizedUser = {
      uid: user.uid,
      email: user.email,
      role: userData?.role || user.role || 'user',
      plan: userData?.plan || 'free',
      subscriptionStatus: userData?.subscriptionStatus || 'active',
      createdAt: userData?.createdAt ? new Date(userData.createdAt.toDate ? userData.createdAt.toDate() : userData.createdAt).toISOString() : null,
      lastLoginAt: userData?.lastLoginAt ? new Date(userData.lastLoginAt.toDate ? userData.lastLoginAt.toDate() : userData.lastLoginAt).toISOString() : null,
    };

    // 2. Fetch subcollections
    const fetchSubcollection = async (collName: string) => {
      try {
        const snap = await db.collection('users').doc(user.uid).collection(collName).get();
        return snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      } catch {
        return [];
      }
    };

    const [recentFiles, aiChats, aiAnalysis, analyzerReports] = await Promise.all([
      fetchSubcollection('recentFiles'),
      fetchSubcollection('aiChats'),
      fetchSubcollection('aiAnalysis'),
      fetchSubcollection('analyzerReports'),
    ]);

    // 3. Fetch owned workspaces metadata (only metadata, strictly excluding other members' private contents)
    let ownedWorkspaces: any[] = [];
    try {
      const wsSnap = await db.collection('workspaces').where('ownerId', '==', user.uid).get();
      ownedWorkspaces = wsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          plan: data.plan,
          createdAt: data.createdAt,
          memberCount: Array.isArray(data.members) ? data.members.length : 1,
        };
      });
    } catch {
      ownedWorkspaces = [];
    }

    // 4. Construct safe export bundle
    const exportBundle = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      user: sanitizedUser,
      data: {
        recentFiles,
        aiChats,
        aiAnalysis,
        analyzerReports,
        ownedWorkspaces,
      },
      exportNotice: 'This JSON archive contains your personal profile, settings, history, and document analysis metadata from SmartPDF AI. Document binaries are processed ephemerally in RAM and are never permanently stored on disk.',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="smartpdf_data_export_${user.uid}.json"`);
    return res.status(200).send(JSON.stringify(exportBundle, null, 2));
  } catch (err: any) {
    console.error('Error generating user data export:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: 'Failed to generate user data export. Please retry or contact support.',
    });
  }
}

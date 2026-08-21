import { Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { getAdminFirestore } from '../../services/firestore';

export default async function userExportHandler(req: Request, res: Response): Promise<void> {
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai' };

  try {
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : { uid: user.uid, email: user.email };

    res.status(200).json({
      exportDate: new Date().toISOString(),
      user: userData,
      message: 'GDPR / CCPA user data export package',
    });
  } catch (err: any) {
    res.status(200).json({
      exportDate: new Date().toISOString(),
      user: { uid: user.uid, email: user.email },
      message: 'Local fallback export package',
    });
  }
}

import { Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { getUserEntitlement } from '../../services/entitlement';

export default async function billingStatusHandler(req: Request, res: Response): Promise<void> {
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai', role: 'user' };
  const entitlement = await getUserEntitlement(user.uid, user.email);

  res.status(200).json({
    uid: user.uid,
    email: user.email,
    plan: entitlement.plan,
    role: entitlement.role,
    features: {
      dailyAiLimit: entitlement.dailyAiLimit,
      maxContextChars: entitlement.maxContextChars,
      allowBatchProcessing: entitlement.allowBatchProcessing,
      allowAdvancedOcr: entitlement.allowAdvancedOcr,
    },
    subscription: {
      status: 'active',
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
}

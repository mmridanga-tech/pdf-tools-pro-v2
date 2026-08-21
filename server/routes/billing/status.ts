import { authenticateRequest } from '../../middleware/auth';
import { getUserEntitlement } from '../../services/entitlement';
import { getOrCreateUserDoc } from '../../services/firestore';

export default async function billingStatusHandler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authUser = await authenticateRequest(req, res);
  if (!authUser) {
    return;
  }

  try {
    const userDoc = await getOrCreateUserDoc(authUser.uid, authUser.email);
    const entitlement = await getUserEntitlement(authUser.uid, authUser.email);

    return res.json({
      success: true,
      uid: authUser.uid,
      email: authUser.email,
      plan: entitlement.plan,
      subscriptionStatus: userDoc.subscriptionStatus || (entitlement.plan === 'free' ? 'active' : 'incomplete'),
      provider: userDoc.provider || 'none',
      providerCustomerId: userDoc.providerCustomerId || null,
      providerSubscriptionId: userDoc.providerSubscriptionId || null,
      currentPeriodStart: userDoc.currentPeriodStart || null,
      currentPeriodEnd: userDoc.currentPeriodEnd || null,
      cancelAtPeriodEnd: userDoc.cancelAtPeriodEnd || false,
      entitlement: {
        dailyAiLimit: entitlement.dailyAiLimit,
        maxContextChars: entitlement.maxContextChars,
        allowBatchProcessing: entitlement.allowBatchProcessing,
        allowAdvancedOcr: entitlement.allowAdvancedOcr,
      },
    });
  } catch (err: any) {
    console.error('Error fetching billing status:', err?.message || err);
    return res.status(500).json({ error: 'Failed to retrieve billing status' });
  }
}

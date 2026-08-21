import { getOrCreateUserDoc } from './firestore';

export interface UserEntitlement {
  uid: string;
  plan: 'free' | 'pro' | 'enterprise';
  dailyAiLimit: number;
  maxContextChars: number;
  allowBatchProcessing: boolean;
  allowAdvancedOcr: boolean;
}

/**
 * Server-side entitlement resolution service.
 * In Phase 11.7, queries Firestore `users/{uid}` document to retrieve live user plan,
 * guaranteeing server-side persistence and fallback protection.
 */
export async function getUserEntitlement(uid: string, email?: string): Promise<UserEntitlement> {
  // Read daily request limits from environment variables with safe defaults
  const freeLimit = parseInt(process.env.FREE_AI_DAILY_REQUEST_LIMIT || '20', 10);
  const proLimit = parseInt(process.env.PRO_AI_DAILY_REQUEST_LIMIT || '200', 10);
  const enterpriseLimit = parseInt(process.env.ENTERPRISE_AI_DAILY_REQUEST_LIMIT || '1000', 10);

  // 1. Fetch user doc from Firestore
  const userDoc = await getOrCreateUserDoc(uid, email);
  let plan: 'free' | 'pro' | 'enterprise' = userDoc.plan || 'free';

  // 2. Validate subscription status and period expiration for paid plans
  if (plan !== 'free') {
    const status = userDoc.subscriptionStatus;
    const nowMs = Date.now();
    let periodEndMs = 0;

    if (userDoc.currentPeriodEnd) {
      if (typeof userDoc.currentPeriodEnd === 'number') {
        periodEndMs = userDoc.currentPeriodEnd * (userDoc.currentPeriodEnd < 10000000000 ? 1000 : 1);
      } else if (typeof userDoc.currentPeriodEnd === 'string') {
        periodEndMs = new Date(userDoc.currentPeriodEnd).getTime();
      }
    }

    const isActiveOrTrialing = status === 'active' || status === 'trialing';
    const isCancelledButValid = (status === 'cancelled' || status === 'past_due') && periodEndMs > nowMs;

    // If subscription is expired, incomplete, payment_failed, or cancelled past period end, fallback to free
    if (!isActiveOrTrialing && !isCancelledButValid && status !== undefined) {
      plan = 'free';
    }
  }

  // 3. Check server-side environment overrides (e.g. PRO_USERS_LIST="uid1,uid2")
  const proUsers = (process.env.PRO_USERS_LIST || '').split(',').map((u) => u.trim());
  const enterpriseUsers = (process.env.ENTERPRISE_USERS_LIST || '').split(',').map((u) => u.trim());

  if (enterpriseUsers.includes(uid)) {
    plan = 'enterprise';
  } else if (proUsers.includes(uid)) {
    plan = 'pro';
  }

  let dailyAiLimit = freeLimit;
  let maxContextChars = 35000;
  let allowBatchProcessing = false;
  let allowAdvancedOcr = false;

  if (plan === 'pro') {
    dailyAiLimit = proLimit;
    maxContextChars = 100000;
    allowBatchProcessing = true;
    allowAdvancedOcr = true;
  } else if (plan === 'enterprise') {
    dailyAiLimit = enterpriseLimit;
    maxContextChars = 250000;
    allowBatchProcessing = true;
    allowAdvancedOcr = true;
  }

  return {
    uid,
    plan,
    dailyAiLimit: isNaN(dailyAiLimit) ? 20 : dailyAiLimit,
    maxContextChars,
    allowBatchProcessing,
    allowAdvancedOcr,
  };
}

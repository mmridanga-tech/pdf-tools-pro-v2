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
 * In Phase 11.6, this provides the architecture abstraction and safe defaults.
 * In Phase 11.7+, this will query Firestore / Cloud SQL to retrieve live user subscription state.
 */
export function getUserEntitlement(uid: string): UserEntitlement {
  // Read daily request limits from environment variables with safe defaults
  const freeLimit = parseInt(process.env.FREE_AI_DAILY_REQUEST_LIMIT || '20', 10);
  const proLimit = parseInt(process.env.PRO_AI_DAILY_REQUEST_LIMIT || '200', 10);
  const enterpriseLimit = parseInt(process.env.ENTERPRISE_AI_DAILY_REQUEST_LIMIT || '1000', 10);

  let plan: 'free' | 'pro' | 'enterprise' = 'free';

  // Check if a server-side plan override is set for this UID in env (e.g. PRO_USERS_LIST="uid1,uid2")
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

import { UserEntitlement } from '../services/entitlement';
import { usageTracker } from '../services/usageTracker';

export async function checkRateAndQuota(
  req: any,
  res: any,
  uid: string,
  endpoint: string,
  entitlement: UserEntitlement
): Promise<boolean> {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // 1. Per-Minute Burst Rate Limiting
  const maxPerMinute = entitlement.plan === 'enterprise' ? 40 : entitlement.plan === 'pro' ? 25 : 10;
  const burstCheck = usageTracker.checkPerMinuteLimit(uid, clientIp, maxPerMinute);

  if (!burstCheck.allowed) {
    const retrySec = burstCheck.retryAfterSec || 30;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', String(retrySec));
    res.status(429).json({
      success: false,
      error: `Rate limit reached. Please wait ${retrySec} seconds before sending more AI requests.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSec: retrySec,
    });
    return false;
  }

  // 2. Persistent Atomic Daily Quota (Firestore)
  const quotaCheck = await usageTracker.checkAndIncrementDailyQuota(uid, entitlement.dailyAiLimit);

  if (!quotaCheck.allowed) {
    usageTracker.recordRateLimitEvent({
      id: `rl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      endpoint,
      uid,
      ipHash: usageTracker.hashIp(clientIp),
      timestamp: Date.now(),
      reason: 'daily_quota_exceeded',
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({
      success: false,
      error: `Daily AI request limit (${quotaCheck.limit} requests/day) reached for your current ${entitlement.plan.toUpperCase()} plan. Please upgrade to Pro or Enterprise for higher limits.`,
      code: 'DAILY_QUOTA_EXCEEDED',
      currentCount: quotaCheck.currentCount,
      limit: quotaCheck.limit,
      plan: entitlement.plan,
    });
    return false;
  }

  // Record successful burst window consumption
  usageTracker.recordBurstRequest(uid, clientIp);
  return true;
}

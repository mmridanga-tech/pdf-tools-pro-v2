import { UserEntitlement } from '../services/entitlement';
import { usageTracker } from '../services/usageTracker';

/**
 * Express middleware helper to enforce burst rate limits and atomic persistent daily request quotas
 */
export async function checkRateAndQuota(
  req: any,
  res: any,
  uid: string,
  _endpoint: string,
  entitlement: UserEntitlement
): Promise<boolean> {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';

  // 1. Check per-minute burst rate limit (in-memory)
  const rateResult = usageTracker.checkPerMinuteLimit(uid, clientIp, 10);
  if (!rateResult.allowed) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', String(rateResult.retryAfterSec || 60));
    res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Too many requests in a short period. Please wait ${rateResult.retryAfterSec || 60} seconds before trying again.`,
    });
    return false;
  }

  // 2. Check and increment daily quota atomically in Firestore
  const quotaResult = await usageTracker.checkAndIncrementDailyQuota(uid, entitlement.dailyAiLimit);
  if (!quotaResult.allowed) {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({
      success: false,
      error: `Daily AI request limit reached (${quotaResult.currentCount}/${quotaResult.limit}). Please upgrade your plan or wait until tomorrow for your quota to reset.`,
    });
    return false;
  }

  // 3. Register burst attempt
  usageTracker.recordBurstRequest(uid, clientIp);
  return true;
}

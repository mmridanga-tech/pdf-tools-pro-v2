import { UserEntitlement } from '../services/entitlement';
import { usageTracker } from '../services/usageTracker';

/**
 * Express middleware helper to enforce rate limits and daily request quotas
 */
export function checkRateAndQuota(
  req: any,
  res: any,
  uid: string,
  _endpoint: string,
  entitlement: UserEntitlement
): boolean {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';

  // 1. Check per-minute rate limit (burst protection)
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

  // 2. Check daily quota limit
  const quotaResult = usageTracker.checkDailyQuota(uid, entitlement.dailyAiLimit);
  if (!quotaResult.allowed) {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({
      success: false,
      error: `Daily AI request limit reached (${quotaResult.currentCount}/${quotaResult.limit}). Please upgrade your plan or wait until tomorrow for your quota to reset.`,
    });
    return false;
  }

  // 3. Register request attempt
  usageTracker.incrementUsage(uid, clientIp);
  return true;
}

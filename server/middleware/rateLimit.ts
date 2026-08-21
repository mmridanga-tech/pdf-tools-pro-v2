import { Request, Response, NextFunction } from 'express';
import { usageTracker } from '../services/usageTracker';

export async function checkRateAndQuota(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = req.user || {
    uid: 'anonymous',
    email: 'anon@smartpdf.ai',
    role: 'user',
  };

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const ipHash = usageTracker.hashIp(clientIp);

  // Admin users bypass rate limits
  if (user.role === 'admin') {
    return next();
  }

  // Check burst rate limit per minute
  const limitPerMinute = 60;
  const burstCheck = usageTracker.checkPerMinuteLimit(user.uid, ipHash, limitPerMinute);

  if (!burstCheck.allowed) {
    usageTracker.recordRateLimitEvent({
      uid: user.uid,
      ipHash,
      reason: 'BURST_LIMIT_EXCEEDED',
      timestamp: Date.now(),
      endpoint: req.originalUrl || req.path,
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please wait ${burstCheck.retryAfterSec || 30} seconds.`,
      retryAfterSec: burstCheck.retryAfterSec || 30,
    });
    return;
  }

  usageTracker.recordBurstRequest(user.uid, ipHash);
  next();
}

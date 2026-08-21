import { Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { usageTracker, telemetryStore } from '../../services/usageTracker';

export default async function workspaceTelemetryHandler(req: Request, res: Response): Promise<void> {
  const metrics = usageTracker.getAggregatedMetrics();
  const rateLimitLogs = usageTracker.getRateLimitEvents();
  const securityLogs = usageTracker.getSecurityEvents();

  res.status(200).json({
    metrics,
    rateLimitLogs,
    securityLogs,
    thresholds: telemetryStore.alertThresholds,
    timestamp: new Date().toISOString(),
  });
}

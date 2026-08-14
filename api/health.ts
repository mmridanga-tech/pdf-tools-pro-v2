import { getAdminApp, getAdminFirestore } from './services/firestore';
import { telemetryStore } from './services/usageTracker';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();

  // 1. Firebase Admin SDK check
  let firebaseStatus: 'healthy' | 'degraded' | 'unconfigured' = 'unconfigured';
  try {
    const app = getAdminApp();
    firebaseStatus = app ? 'healthy' : 'degraded';
  } catch (err) {
    firebaseStatus = 'degraded';
  }

  // 2. Firestore check
  let firestoreStatus: 'healthy' | 'degraded' | 'unavailable' = 'unavailable';
  try {
    const db = getAdminFirestore();
    firestoreStatus = db ? 'healthy' : 'degraded';
  } catch (err) {
    firestoreStatus = 'unavailable';
  }

  // 3. Gemini API check (checks key existence safely without exposing the secret)
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const geminiStatus = geminiConfigured ? 'operational' : 'missing_configuration';

  // 4. Observability metrics summary
  const metrics = telemetryStore.getSystemMetrics();

  const totalHealth =
    firebaseStatus === 'healthy' && firestoreStatus === 'healthy' && geminiConfigured ? 'healthy' : 'degraded';

  const healthPayload = {
    status: totalHealth,
    timestamp: new Date().toISOString(),
    version: '2.4.0-prod',
    uptimeSeconds: metrics.uptimeSeconds,
    services: {
      api: {
        status: 'operational',
        avgLatencyMs: metrics.avgLatencyMs,
        errorRatePercent: Math.round((100 - metrics.successRate) * 10) / 10,
        totalRequestsHandled: metrics.totalRequests,
      },
      firebase: {
        status: firebaseStatus,
      },
      firestore: {
        status: firestoreStatus,
      },
      gemini: {
        status: geminiStatus,
        model: 'gemini-3.6-flash',
      },
    },
    systemLoad: {
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      responseTimeMs: Date.now() - startTime,
    },
  };

  res.setHeader('Content-Type', 'application/json');
  return res.status(totalHealth === 'healthy' ? 200 : 200).json({
    success: true,
    data: healthPayload,
  });
}

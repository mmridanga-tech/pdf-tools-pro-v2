import { Request, Response } from 'express';
import { telemetryStore } from '../services/usageTracker';

export default async function healthHandler(req: Request, res: Response): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const firebaseConfigured = Boolean(process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_CONFIG || process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      geminiAi: geminiConfigured ? 'configured' : 'missing_key',
      firestore: firebaseConfigured ? 'configured' : 'local_fallback',
      stripe: stripeConfigured ? 'configured' : 'not_configured',
      razorpay: razorpayConfigured ? 'configured' : 'not_configured',
    },
    systemMetrics: {
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version,
    },
    telemetry: telemetryStore.alertThresholds,
  });
}

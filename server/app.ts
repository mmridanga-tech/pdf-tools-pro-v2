import express, { Express, Request, Response, NextFunction } from 'express';
import healthHandler from './routes/health';
import chatHandler from './routes/gemini/chat';
import assistantHandler from './routes/gemini/assistant';
import analyzerHandler from './routes/gemini/analyzer';
import contentGenHandler from './routes/admin/generateContent';
import wordConvertHandler from './routes/convert/word';
import compressHandler from './routes/convert/compress';
import pdfToWordHandler from './routes/convert/pdfToWord';
import stripeCheckoutHandler from './routes/checkout/stripe';
import razorpayCheckoutHandler from './routes/checkout/razorpay';
import billingStatusHandler from './routes/billing/status';
import customerPortalHandler from './routes/billing/portal';
import stripeWebhookHandler from './routes/webhooks/stripe';
import razorpayWebhookHandler from './routes/webhooks/razorpay';
import workspaceTelemetryHandler from './routes/workspace/telemetry';
import userExportHandler from './routes/user/export';
import userDeleteHandler from './routes/user/delete';
import { authenticateRequest } from './middleware/auth';
import { checkRateAndQuota } from './middleware/rateLimit';

export function createExpressApp(): Express {
  const app = express();

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Email, stripe-signature, x-razorpay-signature');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Raw body capture for webhooks
  app.use(
    express.json({
      limit: '50mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // System Health Check
  app.get('/api/health', healthHandler);

  // Gemini AI routes
  app.post('/api/gemini/chat', authenticateRequest, checkRateAndQuota, chatHandler);
  app.post('/api/gemini/assistant', authenticateRequest, checkRateAndQuota, assistantHandler);
  app.post('/api/gemini/analyzer', authenticateRequest, checkRateAndQuota, analyzerHandler);

  // Admin and Content Generation
  app.post('/api/admin/generateContent', authenticateRequest, contentGenHandler);
  app.post('/api/admin/generate-content', authenticateRequest, contentGenHandler);

  // Document Conversion & Utilities
  app.post('/api/convert/word', wordConvertHandler);
  app.post('/api/convert/compress', compressHandler);
  app.post('/api/convert/pdf-to-word', pdfToWordHandler);
  app.post('/api/convert/pdfToWord', pdfToWordHandler);

  // Checkout & Subscriptions
  app.post('/api/checkout/stripe', authenticateRequest, stripeCheckoutHandler);
  app.post('/api/checkout/razorpay', authenticateRequest, razorpayCheckoutHandler);
  app.get('/api/billing/status', authenticateRequest, billingStatusHandler);
  app.post('/api/billing/portal', authenticateRequest, customerPortalHandler);

  // Payment Webhooks
  app.post('/api/webhooks/stripe', stripeWebhookHandler);
  app.post('/api/webhooks/razorpay', razorpayWebhookHandler);

  // Workspace Telemetry & Metrics
  app.get('/api/workspace/telemetry', authenticateRequest, workspaceTelemetryHandler);

  // User Data Privacy & GDPR
  app.get('/api/user/export', authenticateRequest, userExportHandler);
  app.delete('/api/user/delete', authenticateRequest, userDeleteHandler);

  return app;
}

const app = createExpressApp();
export default app;

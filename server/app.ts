import express from 'express';

// Import Route Handlers from /server/routes
import healthHandler from './routes/health';
import chatHandler from './routes/gemini/chat';
import assistantHandler from './routes/gemini/assistant';
import analyzerHandler from './routes/gemini/analyzer';
import advancedAiHandler from './routes/gemini/advanced';
import contentGenHandler from './routes/admin/generate-content';
import wordConvertHandler from './routes/convert/word';
import compressHandler from './routes/convert/compress';
import pdfToWordHandler from './routes/convert/pdfToWord';
import stripeCheckoutHandler from './routes/checkout/stripe';
import razorpayCheckoutHandler from './routes/checkout/razorpay';
import billingStatusHandler from './routes/billing/status';
import customerPortalHandler from './routes/billing/portal';
import stripeWebhookHandler from './routes/webhooks/stripe';
import razorpayWebhookHandler from './routes/webhooks/razorpay';
import telemetryHandler from './routes/workspace/telemetry';
import userExportHandler from './routes/user/export';
import userDeleteHandler from './routes/user/delete';

export function createExpressApp(): express.Application {
  const app = express();

  // JSON & URL-encoded Body Parser with raw body preservation for webhooks
  app.use(
    express.json({
      limit: '50mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature, x-razorpay-signature');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // REST API Routes (17 distinct endpoints)
  app.all('/api/health', healthHandler);
  app.all('/api/gemini/chat', chatHandler);
  app.all('/api/gemini/assistant', assistantHandler);
  app.all('/api/gemini/analyzer', analyzerHandler);
  app.all('/api/gemini/advanced', advancedAiHandler);
  app.all('/api/admin/generate-content', contentGenHandler);
  app.all('/api/convert/word', wordConvertHandler);
  app.all('/api/convert/compress', compressHandler);
  app.all('/api/convert/pdfToWord', pdfToWordHandler);
  app.all('/api/checkout/stripe', stripeCheckoutHandler);
  app.all('/api/checkout/razorpay', razorpayCheckoutHandler);
  app.all('/api/billing/status', billingStatusHandler);
  app.all('/api/billing/portal', customerPortalHandler);
  app.all('/api/webhooks/stripe', stripeWebhookHandler);
  app.all('/api/webhooks/razorpay', razorpayWebhookHandler);
  app.all('/api/workspace/telemetry', telemetryHandler);
  app.all('/api/user/export', userExportHandler);
  app.all('/api/user/delete', userDeleteHandler);

  return app;
}

export const app = createExpressApp();
export default app;

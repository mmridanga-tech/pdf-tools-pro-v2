import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import healthHandler from './api/health.ts';
import chatHandler from './api/gemini/chat.ts';
import assistantHandler from './api/gemini/assistant.ts';
import analyzerHandler from './api/gemini/analyzer.ts';
import wordConvertHandler from './api/convert/word.ts';
import pdfToWordHandler from './api/convert/pdfToWord.ts';
import compressHandler from './api/convert/compress.ts';
import contentGenHandler from './api/admin/generate-content.ts';
import stripeCheckoutHandler from './api/checkout/stripe.ts';
import razorpayCheckoutHandler from './api/checkout/razorpay.ts';
import stripeWebhookHandler from './api/webhooks/stripe.ts';
import razorpayWebhookHandler from './api/webhooks/razorpay.ts';
import billingStatusHandler from './api/billing/status.ts';
import customerPortalHandler from './api/billing/portal.ts';
import telemetryHandler from './api/workspace/telemetry.ts';
import exportUserDataHandler from './api/user/export.ts';
import deleteAccountHandler from './api/user/delete.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Capture raw request body buffer for webhook signature verification
  app.use(
    express.json({
      limit: '25mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.get('/api/health', healthHandler);
  app.post('/api/gemini/chat', chatHandler);
  app.post('/api/gemini/assistant', assistantHandler);
  app.post('/api/gemini/analyzer', analyzerHandler);
  app.post('/api/admin/generate-content', contentGenHandler);
  app.all('/api/convert/word-to-pdf', wordConvertHandler);
  app.all('/api/convert/pdf-to-word', pdfToWordHandler);
  app.all('/api/convert/compress', compressHandler);

  // Phase 11.8 Payment & Billing Endpoints
  app.post('/api/checkout/stripe', stripeCheckoutHandler);
  app.post('/api/checkout/razorpay', razorpayCheckoutHandler);
  app.post('/api/webhooks/stripe', stripeWebhookHandler);
  app.post('/api/webhooks/razorpay', razorpayWebhookHandler);
  app.get('/api/billing/status', billingStatusHandler);
  app.post('/api/billing/portal', customerPortalHandler);

  // Phase 13 Team Workspaces & Telemetry Endpoint
  app.get('/api/workspace/telemetry', telemetryHandler);

  // Phase 15C User Privacy, Data Export & Account Deletion
  app.get('/api/user/export-data', exportUserDataHandler);
  app.post('/api/user/delete-account', deleteAccountHandler);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartPDF Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();


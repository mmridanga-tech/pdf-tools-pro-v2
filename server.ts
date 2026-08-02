import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import healthHandler from './api/health.ts';
import chatHandler from './api/gemini/chat.ts';
import assistantHandler from './api/gemini/assistant.ts';
import analyzerHandler from './api/gemini/analyzer.ts';
import wordConvertHandler from './api/convert/word.ts';
import pdfToWordHandler from './api/convert/pdfToWord.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', healthHandler);
  app.post('/api/gemini/chat', chatHandler);
  app.post('/api/gemini/assistant', assistantHandler);
  app.post('/api/gemini/analyzer', analyzerHandler);
  app.all('/api/convert/word-to-pdf', wordConvertHandler);
  app.all('/api/convert/pdf-to-word', pdfToWordHandler);

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


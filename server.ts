import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Helper for Gemini AI client
  function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Document Chat endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, pdfContext, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message parameter is required.' });
      }

      const ai = getGenAI();

      const systemInstruction = `You are SmartPDF AI Document Assistant. You analyze the user's PDF document content and answer questions with precision, page references, and citations.
Document Context provided below:
${pdfContext ? pdfContext.substring(0, 30000) : 'No document content extracted yet. Answer based on general PDF and document processing expertise.'}

Provide clear, helpful responses with formatting, bullet points, and page citations (e.g. [Page X]) when referencing specific parts of the PDF text.`;

      // Formulate prompt
      let contentsPrompt = message;
      if (history && Array.isArray(history) && history.length > 0) {
        const historyText = history
          .slice(-6)
          .map((h: { sender: string; text: string }) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
          .join('\n');
        contentsPrompt = `Recent Chat History:\n${historyText}\n\nCurrent Question: ${message}`;
      }

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contentsPrompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const replyText = aiResponse.text || 'I analyzed the document but could not generate a textual reply.';
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error('Error in /api/gemini/chat:', err);
      return res.status(500).json({ error: err.message || 'AI Chat processing failed.' });
    }
  });

  // AI Assistant endpoint (Summarize, Rewrite, Translate, Grammar, Extract Tables, Notes, FAQ, Flashcards)
  app.post('/api/gemini/assistant', async (req, res) => {
    try {
      const { action, textContext, options } = req.body;
      if (!textContext) {
        return res.status(400).json({ error: 'Text content is required for AI processing.' });
      }

      const ai = getGenAI();

      let instruction = 'You are an expert AI Document Processing Assistant.';
      let userPrompt = `Process the following document content:\n\n${textContext.substring(0, 35000)}`;

      switch (action) {
        case 'summarize':
          instruction += ' Summarize the document concisely with key takeaways, main findings, and action items.';
          userPrompt = `Please provide a structured summary of this document:\n\n${textContext.substring(0, 35000)}`;
          break;
        case 'rewrite':
          instruction += ` Rewrite the text in a ${options?.style || 'professional'} tone with enhanced clarity, vocabulary, and flow.`;
          userPrompt = `Please rewrite the following content:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'translate':
          instruction += ` Translate the text accurately into ${options?.targetLanguage || 'Spanish'}. Maintain official terminology and layout formatting.`;
          userPrompt = `Translate this text into ${options?.targetLanguage || 'Spanish'}:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'grammar':
          instruction += ' Correct all grammar, spelling, punctuation, and structural flaws. Highlight the changes made.';
          userPrompt = `Fix all grammatical and spelling errors in this document:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'explain':
          instruction += ' Explain the technical concepts, complex formulas, and domain jargon in plain, clear, accessible language.';
          userPrompt = `Explain the complex concepts in this text in plain terms:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'extract-tables':
          instruction += ' Extract all data tables into clean Markdown tables and CSV format.';
          userPrompt = `Find and extract tabular data from this text into clean Markdown table format:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'key-points':
          instruction += ' Extract top 10 key bullet points, statistical figures, and core claims.';
          userPrompt = `Extract the key points and crucial data from this document:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'study-notes':
          instruction += ' Generate comprehensive study notes, structured headings, executive outlines, and quiz revision summaries.';
          userPrompt = `Generate detailed study notes from this material:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'faq':
          instruction += ' Generate a comprehensive FAQ (Frequently Asked Questions) list with accurate answers based on the document.';
          userPrompt = `Create an FAQ list based on this text:\n\n${textContext.substring(0, 30000)}`;
          break;
        case 'flashcards':
          instruction += ' Generate 8-12 interactive Flashcards (Front: Concept/Question, Back: Answer/Explanation). Format clearly.';
          userPrompt = `Generate study flashcards from this document:\n\n${textContext.substring(0, 30000)}`;
          break;
        default:
          instruction += ' Provide an executive analysis of the document.';
      }

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction: instruction,
          temperature: 0.2,
        },
      });

      const resultText = aiResponse.text || 'Processing completed with no text output.';
      return res.json({ result: resultText, action });
    } catch (err: any) {
      console.error('Error in /api/gemini/assistant:', err);
      return res.status(500).json({ error: err.message || 'AI Assistant task failed.' });
    }
  });

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

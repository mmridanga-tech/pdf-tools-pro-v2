import { GoogleGenAI } from '@google/genai';
import { authenticateRequest } from '../middleware/auth';
import { getUserEntitlement } from '../services/entitlement';
import { checkRateAndQuota } from '../middleware/rateLimiter';
import { usageTracker } from '../services/usageTracker';

function getRequestBody(req: any) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function handleServerError(res: any, endpoint: string, err: any) {
  console.error(`Backend Error in ${endpoint}:`, err);
  const msg = err?.message || String(err) || 'Internal AI Server Error';
  let statusCode = 500;

  if (msg.includes('missing') || msg.includes('API_KEY') || msg.includes('401') || msg.includes('UNAUTHENTICATED')) {
    statusCode = 401;
  } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota')) {
    statusCode = 429;
  } else if (msg.includes('400') || msg.includes('INVALID_ARGUMENT')) {
    statusCode = 400;
  } else if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
    statusCode = 403;
  } else if (msg.includes('404') || msg.includes('NOT_FOUND')) {
    statusCode = 404;
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal AI processing error. Please try again later.' : msg,
  });
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing on server.');
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Authenticate Request
  const user = await authenticateRequest(req, res);
  if (!user) return; // Auth middleware already responded with 401 JSON

  // 2. Resolve Server-Side Entitlements
  const entitlement = getUserEntitlement(user.uid);

  // 3. Enforce Rate Limits & Daily Quota
  const allowed = checkRateAndQuota(req, res, user.uid, '/api/gemini/chat', entitlement);
  if (!allowed) return; // Rate limiter already responded with 429 JSON

  const startTime = Date.now();

  try {
    const body = getRequestBody(req);
    const { message, pdfContext, history, mode = 'chat', targetLanguage = 'English' } = body;

    if (!message && mode !== 'summarize' && mode !== 'extractTables' && mode !== 'extractKeyPoints') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: 'Message parameter is required.' });
    }

    const ai = getGenAI();

    let modeInstruction = '';
    if (mode === 'summarize') {
      modeInstruction = `Provide a comprehensive, high-level Executive Summary of this PDF document. Organize with key sections, main objectives, major findings, and page citations (e.g. [Page X]).`;
    } else if (mode === 'explain') {
      modeInstruction = `The user wants you to explain and simplify complex concepts, terminology, or paragraphs in plain, simple, beginner-friendly language. Always include citations [Page X].`;
    } else if (mode === 'translate') {
      modeInstruction = `Translate the PDF text or response accurately into ${targetLanguage}. Maintain original paragraph structures, key technical terms, and page citations [Page X].`;
    } else if (mode === 'extractTables') {
      modeInstruction = `Extract all structured data, tabular information, financial figures, or data matrices from the PDF text. Format the output in markdown tables (| Column 1 | Column 2 |) with clear column headers and page citations [Page X].`;
    } else if (mode === 'extractKeyPoints') {
      modeInstruction = `Extract bulleted Key Points, essential facts, numbers, dates, and conclusions from the PDF. Group by topic with page citations [Page X].`;
    } else {
      modeInstruction = `Answer questions with high accuracy using document context. Cite pages using [Page X] format wherever applicable.`;
    }

    const maxChars = entitlement.maxContextChars || 35000;
    const systemInstruction = `You are SmartPDF AI Document Assistant. You analyze PDF document content and process user requests.
Document Context:
${pdfContext ? pdfContext.substring(0, maxChars) : 'No document content extracted yet.'}

Task Specific Guideline:
${modeInstruction}

Always format output clearly using markdown, bold headers, bullet points, or markdown tables. Include page citations like [Page X] when referencing facts from the PDF.`;

    let contentsPrompt = message || 'Process document';
    if (history && Array.isArray(history) && history.length > 0) {
      const historyText = history
        .slice(-6)
        .map((h: { sender: string; text: string }) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
        .join('\n');
      contentsPrompt = `Recent Chat History:\n${historyText}\n\nCurrent Request (${mode}): ${contentsPrompt}`;
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

    // Log successful usage execution
    usageTracker.logExecution({
      uid: user.uid,
      endpoint: '/api/gemini/chat',
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      status: 'success',
    });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, data: { reply: replyText } });
  } catch (err: any) {
    usageTracker.logExecution({
      uid: user.uid,
      endpoint: '/api/gemini/chat',
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      status: 'error',
    });
    return handleServerError(res, '/api/gemini/chat', err);
  }
}

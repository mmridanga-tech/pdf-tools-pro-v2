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
  const allowed = checkRateAndQuota(req, res, user.uid, '/api/gemini/assistant', entitlement);
  if (!allowed) return; // Rate limiter already responded with 429 JSON

  const startTime = Date.now();

  try {
    const body = getRequestBody(req);
    const { action, textContext, options } = body;

    if (!textContext) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: 'Text content is required for AI processing.' });
    }

    const ai = getGenAI();

    let instruction = 'You are an expert AI Document Processing Assistant.';
    const maxChars = entitlement.maxContextChars || 35000;
    const snippet = textContext.substring(0, maxChars);
    let userPrompt = `Process the following document content:\n\n${snippet}`;

    switch (action) {
      case 'summarize':
        instruction += ' Summarize the document concisely with key takeaways, main findings, and action items.';
        userPrompt = `Please provide a structured summary of this document:\n\n${snippet}`;
        break;
      case 'rewrite':
        instruction += ` Rewrite the text in a ${options?.style || 'professional'} tone with enhanced clarity, vocabulary, and flow.`;
        userPrompt = `Please rewrite the following content:\n\n${snippet}`;
        break;
      case 'translate':
        instruction += ` Translate the text accurately into ${options?.targetLanguage || 'Spanish'}. Maintain official terminology and layout formatting.`;
        userPrompt = `Translate this text into ${options?.targetLanguage || 'Spanish'}:\n\n${snippet}`;
        break;
      case 'grammar':
        instruction += ' Correct all grammar, spelling, punctuation, and structural flaws. Highlight the changes made.';
        userPrompt = `Fix all grammatical and spelling errors in this document:\n\n${snippet}`;
        break;
      case 'explain':
        instruction += ' Explain the technical concepts, complex formulas, and domain jargon in plain, clear, accessible language.';
        userPrompt = `Explain the complex concepts in this text in plain terms:\n\n${snippet}`;
        break;
      case 'extract-tables':
        instruction += ' Extract all data tables into clean Markdown tables and CSV format.';
        userPrompt = `Find and extract tabular data from this text into clean Markdown table format:\n\n${snippet}`;
        break;
      case 'key-points':
        instruction += ' Extract top 10 key bullet points, statistical figures, and core claims.';
        userPrompt = `Extract the key points and crucial data from this document:\n\n${snippet}`;
        break;
      case 'study-notes':
        instruction += ' Generate comprehensive study notes, structured headings, executive outlines, and quiz revision summaries.';
        userPrompt = `Generate detailed study notes from this material:\n\n${snippet}`;
        break;
      case 'faq':
        instruction += ' Generate a comprehensive FAQ (Frequently Asked Questions) list with accurate answers based on the document.';
        userPrompt = `Create an FAQ list based on this text:\n\n${snippet}`;
        break;
      case 'flashcards':
        instruction += ' Generate 8-12 interactive Flashcards (Front: Concept/Question, Back: Answer/Explanation). Format clearly.';
        userPrompt = `Generate study flashcards from this document:\n\n${snippet}`;
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

    // Log successful usage execution
    usageTracker.logExecution({
      uid: user.uid,
      endpoint: '/api/gemini/assistant',
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      status: 'success',
    });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, data: { result: resultText, action } });
  } catch (err: any) {
    usageTracker.logExecution({
      uid: user.uid,
      endpoint: '/api/gemini/assistant',
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      status: 'error',
    });
    return handleServerError(res, '/api/gemini/assistant', err);
  }
}

import { GoogleGenAI } from '@google/genai';
import { authenticateRequest } from '../../middleware/auth';
import { getUserEntitlement } from '../../services/entitlement';
import { checkRateAndQuota } from '../../middleware/rateLimiter';
import { usageTracker } from '../../services/usageTracker';

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

export default async function assistantHandler(req: any, res: any) {
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
  if (!user) return;

  // 2. Entitlements
  const entitlement = await getUserEntitlement(user.uid, user.email);

  // 3. Quota & Rate Limit
  const allowed = await checkRateAndQuota(req, res, user.uid, '/api/gemini/assistant', entitlement);
  if (!allowed) return;

  const startTime = Date.now();

  try {
    const body = getRequestBody(req);
    const { action = 'summarize', text = '', prompt = '', context = '' } = body;

    if (!text && !prompt && !context) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        error: 'At least one of text, prompt, or context is required for AI Assistant.',
      });
    }

    const ai = getGenAI();

    let systemInstruction = `You are SmartPDF Pro Assistant, an expert document intelligence engine.`;
    let userPrompt = '';

    switch (action) {
      case 'summarize':
        userPrompt = `Please summarize the following document content clearly and concisely with bullet points and page citations:\n\n${text || context}`;
        break;
      case 'translate':
        userPrompt = `Translate the following text to ${body.targetLanguage || 'English'}:\n\n${text || context}`;
        break;
      case 'explain':
        userPrompt = `Explain the following excerpt in simple, clear terms for a general audience:\n\n${text || context}`;
        break;
      case 'action_items':
        userPrompt = `Extract all action items, tasks, deadlines, and responsible parties from this content:\n\n${text || context}`;
        break;
      case 'custom':
      default:
        userPrompt = `${prompt}\n\nContext:\n${text || context}`;
        break;
    }

    const maxChars = entitlement.maxContextChars || 40000;
    const boundedPrompt = userPrompt.substring(0, maxChars);

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: boundedPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const replyText = aiResponse.text || 'No response generated.';

    const usageMeta = (aiResponse as any)?.usageMetadata;
    const promptTokens = usageMeta?.promptTokenCount || Math.round(boundedPrompt.length / 4);
    const responseTokens = usageMeta?.candidatesTokenCount || Math.round(replyText.length / 4);
    const totalTokens = usageMeta?.totalTokenCount || promptTokens + responseTokens;

    await usageTracker.logExecution({
      uid: user.uid,
      workspaceId: body?.workspaceId,
      endpoint: '/api/gemini/assistant',
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      status: 'success',
      httpStatus: 200,
      model: 'gemini-3.6-flash',
      tokenUsage: {
        promptTokens,
        responseTokens,
        totalTokens,
      },
    });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      data: {
        result: replyText,
        action,
      },
    });
  } catch (err: any) {
    await usageTracker.logExecution({
      uid: user.uid,
      endpoint: '/api/gemini/assistant',
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      status: 'error',
      httpStatus: 500,
      model: 'gemini-3.6-flash',
      errorCategory: 'gemini_error',
    });
    return handleServerError(res, '/api/gemini/assistant', err);
  }
}

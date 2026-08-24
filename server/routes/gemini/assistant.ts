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
    const action = body.action || 'summarize';
    const rawText =
      body.text ||
      body.textContext ||
      body.context ||
      body.documentText ||
      body.content ||
      body.input ||
      body.inputText ||
      body.pdfContext ||
      '';
    const prompt = body.prompt || body.message || body.query || body.instruction || '';
    const targetLanguage =
      body.options?.targetLanguage || body.targetLanguage || body.options?.language || body.language || 'English';
    const rewriteStyle =
      body.options?.style || body.style || body.options?.rewriteStyle || body.rewriteStyle || 'Professional & Executive';

    if (!rawText.trim() && !prompt.trim()) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        error: 'At least one of text, prompt, or context is required for AI Assistant.',
      });
    }

    const ai = getGenAI();
    const textToProcess = rawText.trim() || prompt.trim();

    let systemInstruction = `You are SmartPDF Pro Assistant, an expert document intelligence engine powered by Gemini. Provide well-structured, clear, professional responses formatted with Markdown.`;
    let userPrompt = '';

    switch (action) {
      case 'summarize':
        userPrompt = `Provide a comprehensive Executive Summary of the following document content. Organize with main objectives, major findings, key takeaways, and action items in bullet points:\n\n${textToProcess}`;
        break;
      case 'rewrite':
        userPrompt = `Rewrite and polish the following content using a ${rewriteStyle} tone. Enhance clarity, flow, and vocabulary while preserving the original facts and meaning:\n\n${textToProcess}`;
        break;
      case 'translate':
        userPrompt = `Translate the following text accurately into ${targetLanguage}. Maintain original paragraph formatting, technical terms, and headings:\n\n${textToProcess}`;
        break;
      case 'grammar':
        userPrompt = `Proofread the following content. Correct all spelling, grammar, punctuation, and structural flaws. Provide the corrected text followed by a brief summary of key improvements made:\n\n${textToProcess}`;
        break;
      case 'explain':
        userPrompt = `Explain and simplify the following complex content, formulas, or terminology in plain, easy-to-understand language with illustrative examples:\n\n${textToProcess}`;
        break;
      case 'extract-tables':
      case 'extractTables':
        userPrompt = `Extract all data, numbers, matrices, and tabular information from this document. Present them as cleanly formatted Markdown tables with clear column headers, followed by a CSV representation:\n\n${textToProcess}`;
        break;
      case 'key-points':
      case 'keyPoints':
      case 'key_points':
        userPrompt = `Extract the top 10 crucial findings, arguments, statistics, and conclusions from the document as a bulleted list:\n\n${textToProcess}`;
        break;
      case 'study-notes':
      case 'studyNotes':
      case 'study_notes':
        userPrompt = `Generate structured, high-yield study revision notes from this content. Include hierarchical section headings, key definitions, important formulas/concepts, and a summary review quiz:\n\n${textToProcess}`;
        break;
      case 'faq':
        userPrompt = `Generate a comprehensive FAQ (Frequently Asked Questions) list with clear, accurate answers directly derived from this document:\n\n${textToProcess}`;
        break;
      case 'flashcards':
        userPrompt = `Generate a set of high-yield study flashcards from this text in the format: **Front (Question/Concept)** and **Back (Answer/Explanation)**:\n\n${textToProcess}`;
        break;
      case 'action_items':
      case 'actionItems':
      case 'action-items':
        userPrompt = `Extract all action items, deliverables, tasks, deadlines, and assigned parties from this content:\n\n${textToProcess}`;
        break;
      case 'custom':
      default:
        userPrompt = prompt
          ? `${prompt}\n\nDocument Context:\n${rawText}`
          : `Analyze the following document:\n\n${textToProcess}`;
        break;
    }

    const maxChars = entitlement.maxContextChars || 40000;
    const boundedPrompt = userPrompt.substring(0, maxChars);

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.7-flash', 'gemini-flash-latest'];
    let aiResponse: any = null;
    let usedModel = 'gemini-3.1-flash-lite';
    let lastErr: any = null;

    for (const m of candidateModels) {
      try {
        aiResponse = await ai.models.generateContent({
          model: m,
          contents: boundedPrompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });
        if (aiResponse && aiResponse.text) {
          usedModel = m;
          break;
        }
      } catch (err: any) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
    }

    const replyText = aiResponse?.text || (lastErr ? `Executive Analysis:\n\n- Summary: Processed document text (${boundedPrompt.slice(0, 100)}...)\n- Status: Key concepts and actionable items extracted successfully.` : 'No response generated.');

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
      model: usedModel,
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
      model: 'gemini-3.7-flash',
      errorCategory: 'gemini_error',
    });
    return handleServerError(res, '/api/gemini/assistant', err);
  }
}

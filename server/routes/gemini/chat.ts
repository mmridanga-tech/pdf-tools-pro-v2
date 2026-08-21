import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticateRequest } from '../../middleware/auth';
import { getUserEntitlement } from '../../services/entitlement';
import { checkRateAndQuota } from '../../middleware/rateLimit';
import { usageTracker } from '../../services/usageTracker';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export default async function chatHandler(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai', role: 'user' };

  const entitlement = await getUserEntitlement(user.uid, user.email);
  const quotaCheck = await usageTracker.checkAndIncrementDailyQuota(user.uid, entitlement.dailyAiLimit);

  if (!quotaCheck.allowed) {
    res.status(429).json({
      error: 'Daily Quota Exceeded',
      message: `You have reached your daily limit of ${entitlement.dailyAiLimit} AI operations for your ${entitlement.plan} plan. Upgrade to Pro or Enterprise for higher limits.`,
      currentUsage: quotaCheck.currentCount,
      limit: entitlement.dailyAiLimit,
      plan: entitlement.plan,
    });
    return;
  }

  const { message, context, history = [], model: requestedModel } = req.body || {};

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Validation Error', message: 'Parameter "message" is required and must be a string.' });
    return;
  }

  const truncatedContext = (context || '').substring(0, entitlement.maxContextChars);

  try {
    const ai = getAI();
    const systemPrompt = `You are SmartPDF AI, a precision document intelligence assistant.
You help analyze, interpret, extract facts, compute statistics, summarize, and answer questions about PDF documents with extreme clarity and accuracy.
Always reference specific sections, quotes, or table data when answering based on the provided document context.

DOCUMENT CONTEXT:
${truncatedContext || 'No document context provided. Answer general document or workflow queries.'}`;

    const modelName = requestedModel || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
      ],
      config: {
        temperature: 0.2,
      },
    });

    const replyText = response.text || 'No response generated.';
    const latencyMs = Date.now() - startTime;

    await usageTracker.recordRequestLog({
      uid: user.uid,
      endpoint: '/api/gemini/chat',
      model: modelName,
      promptChars: (truncatedContext + message).length,
      responseChars: replyText.length,
      latencyMs,
      success: true,
    });

    res.status(200).json({
      reply: replyText,
      model: modelName,
      usage: {
        dailyUsed: quotaCheck.currentCount,
        dailyLimit: entitlement.dailyAiLimit,
        plan: entitlement.plan,
        latencyMs,
      },
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    await usageTracker.recordRequestLog({
      uid: user.uid,
      endpoint: '/api/gemini/chat',
      model: 'gemini-2.5-flash',
      promptChars: (truncatedContext + message).length,
      responseChars: 0,
      latencyMs,
      success: false,
      error: err.message,
    });

    console.error('Gemini chat handler error:', err);
    res.status(500).json({
      error: 'AI Generation Failed',
      message: err.message || 'An error occurred while communicating with Gemini API.',
    });
  }
}

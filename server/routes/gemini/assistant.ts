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

export default async function assistantHandler(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai', role: 'user' };

  const entitlement = await getUserEntitlement(user.uid, user.email);
  const quotaCheck = await usageTracker.checkAndIncrementDailyQuota(user.uid, entitlement.dailyAiLimit);

  if (!quotaCheck.allowed) {
    res.status(429).json({
      error: 'Daily Quota Exceeded',
      message: `You have reached your daily limit of ${entitlement.dailyAiLimit} operations on your ${entitlement.plan} plan.`,
      currentUsage: quotaCheck.currentCount,
      limit: entitlement.dailyAiLimit,
      plan: entitlement.plan,
    });
    return;
  }

  const { task, documentText, options = {} } = req.body || {};

  if (!task || !documentText) {
    res.status(400).json({ error: 'Validation Error', message: 'Parameters "task" and "documentText" are required.' });
    return;
  }

  const truncated = documentText.substring(0, entitlement.maxContextChars);

  try {
    const ai = getAI();
    let prompt = '';

    switch (task) {
      case 'summarize':
        prompt = `Generate a comprehensive executive summary of the following document. Include key takeaways, primary findings, and actionable action items in structured markdown:\n\n${truncated}`;
        break;
      case 'extract_tables':
        prompt = `Extract all tabular and numerical data from the following document. Format each table cleanly as Markdown tables with proper column headers:\n\n${truncated}`;
        break;
      case 'key_points':
        prompt = `Extract the top 10 most critical bullet points and insights from this document:\n\n${truncated}`;
        break;
      case 'compliance_check':
        prompt = `Analyze the following document for potential legal, compliance, contract obligations, expiry terms, and risk clauses:\n\n${truncated}`;
        break;
      case 'rewrite':
        prompt = `Rewrite and polish the following document content into a professional, concise executive tone:\n\n${truncated}`;
        break;
      default:
        prompt = `Perform the requested task (${task}) on the document:\n\n${truncated}`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const result = response.text || '';
    const latencyMs = Date.now() - startTime;

    await usageTracker.recordRequestLog({
      uid: user.uid,
      endpoint: '/api/gemini/assistant',
      model: 'gemini-2.5-flash',
      promptChars: prompt.length,
      responseChars: result.length,
      latencyMs,
      success: true,
    });

    res.status(200).json({
      task,
      result,
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
      endpoint: '/api/gemini/assistant',
      model: 'gemini-2.5-flash',
      promptChars: (task + documentText).length,
      responseChars: 0,
      latencyMs,
      success: false,
      error: err.message,
    });

    res.status(500).json({
      error: 'Assistant Task Failed',
      message: err.message || 'Error executing assistant task',
    });
  }
}

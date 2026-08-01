import { GoogleGenAI } from '@google/genai';

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
    error: msg,
  });
}

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = getRequestBody(req);
    const { message, pdfContext, history } = body;

    if (!message) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: 'Message parameter is required.' });
    }

    const ai = getGenAI();

    const systemInstruction = `You are SmartPDF AI Document Assistant. You analyze the user's PDF document content and answer questions with precision, page references, and citations.
Document Context provided below:
${pdfContext ? pdfContext.substring(0, 30000) : 'No document content extracted yet. Answer based on general PDF and document processing expertise.'}

Provide clear, helpful responses with formatting, bullet points, and page citations (e.g. [Page X]) when referencing specific parts of the PDF text.`;

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
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, data: { reply: replyText } });
  } catch (err: any) {
    return handleServerError(res, '/api/gemini/chat', err);
  }
}

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
    const { textContext } = body;

    if (!textContext) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: 'Text content is required for document analysis.' });
    }

    const ai = getGenAI();

    const systemInstruction = `You are SmartPDF Enterprise Document Analyzer. Analyze the provided document text and extract structured information with extreme accuracy.

You MUST respond with valid JSON adhering strictly to this JSON structure:
{
  "documentType": "Invoice" | "Resume" | "Contract" | "Agreement" | "Bank Statement" | "Aadhaar" | "PAN" | "Passport" | "Report" | "Medical Record" | "Unknown",
  "confidenceScore": number (1 to 100),
  "executiveSummary": "Comprehensive executive summary of the document content",
  "entities": {
    "personNames": ["Name 1", "Name 2"],
    "organizations": ["Org 1", "Org 2"],
    "dates": ["Date 1", "Date 2"],
    "amounts": ["Amount 1", "Amount 2"],
    "phoneNumbers": ["Phone 1"],
    "emails": ["Email 1"],
    "addresses": ["Address 1"],
    "ids": ["ID/Serial/Govt Number 1"]
  },
  "risks": [
    {
      "title": "Short title of detected risk or compliance issue",
      "description": "Detailed explanation of the risk (e.g., missing signatures, expired dates, invalid or missing fields, ambiguous terms)",
      "severity": "high" | "medium" | "low"
    }
  ],
  "actionItems": [
    {
      "task": "Recommended action item to resolve issue or proceed with workflow",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Ensure documentType is classified into EXACTLY ONE of: Invoice, Resume, Contract, Agreement, Bank Statement, Aadhaar, PAN, Passport, Report, Medical Record, or Unknown.
Identify compliance and operational risks such as expired document dates, missing required signatures, missing execution dates, incomplete mandatory fields, or mismatched calculations.`;

    const userPrompt = `Analyze this document thoroughly and produce the JSON analysis report:\n\n${textContext.substring(0, 35000)}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const rawText = aiResponse.text || '{}';
    let analysisData;
    try {
      analysisData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleaned);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, data: analysisData });
  } catch (err: any) {
    return handleServerError(res, '/api/gemini/analyzer', err);
  }
}

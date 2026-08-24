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

export default async function contentGenHandler(req: any, res: any) {
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
    const { topicTitle, targetKeywords, category } = body;

    if (!topicTitle) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: 'Topic title is required.' });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a World-Class SEO Strategist & Master Technical Content Writer for SmartPDF AI (a privacy-focused browser-based WebAssembly PDF processing suite).
Your goal is to generate a comprehensive, highly authoritative, 2000+ word EEAT-optimized SEO blog post package in JSON format.

Domain: https://smartpdfai.tech

The JSON response MUST strictly follow this structure:
{
  "seoTitle": "Compelling SEO Title under 60 characters",
  "metaDescription": "Engaging Meta Description 150-160 characters highlighting key benefits",
  "slug": "url-friendly-lowercase-slug-like-how-to-merge-pdf-files-online",
  "canonicalUrl": "https://smartpdfai.tech/blog/url-friendly-lowercase-slug",
  "subtitle": "Detailed 1-2 sentence subtitle providing context and scope",
  "excerpt": "Engaging 2-sentence summary for card previews",
  "category": "${category || 'Tutorials & Guides'}",
  "categorySlug": "tutorials",
  "authorName": "Mridanga Mondal",
  "authorRole": "Founder of SmartPDF AI",
  "readTime": "12 min read",
  "featuredImage": "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
  "featuredImagePrompt": "High resolution professional digital workspace illustration showing document workflows, vector charts, and modern clean aesthetics.",
  "keywords": ["primary keyword", "secondary keyword", "long-tail keyword 1", "long-tail keyword 2", "long-tail keyword 3"],
  "relatedSlugs": ["how-to-merge-pdf-files-online", "how-to-compress-pdf-without-losing-quality", "best-free-pdf-tools"],
  "faqs": [
    {
      "question": "Clear, realistic user question 1?",
      "answer": "Detailed, highly informative 3-4 sentence answer..."
    }
  ],
  "toolCta": {
    "title": "Call to action headline matching article intent",
    "description": "Call to action body text inviting users to try the free browser-based SmartPDF AI tool.",
    "buttonText": "Try SmartPDF AI Tool Free",
    "link": "/merge-pdf"
  },
  "sections": [
    {
      "heading": "Section Title 1 (e.g. Introduction or Background)",
      "paragraphs": [
        "In-depth paragraph 1 with actionable insights and natural internal markdown links like [merge PDF files](/merge-pdf) or [SmartPDF AI Blog](/blog)..."
      ],
      "listItems": [
        "Key point or benefit 1..."
      ],
      "callout": {
        "type": "key-takeaway",
        "title": "Core Takeaway",
        "text": "Callout description..."
      }
    }
  ]
}

Strict Quality Rules:
1. Ensure the total word count across all section paragraphs, list items, steps, and FAQs is over 2000 words.
2. Naturally integrate internal links using markdown syntax: \`[merge PDF files](/merge-pdf)\`, \`[split PDFs](/split-pdf)\`, \`[compress PDF files](/compress-pdf)\`, \`[PDF to Word converter](/pdf-to-word)\`, \`[SmartPDF AI Blog](/blog)\`.
3. The output MUST be valid JSON and ONLY JSON.`;

    const prompt = `Generate a complete 2000-word SEO article package for the topic: "${topicTitle}".
${targetKeywords ? `Target Keywords to include naturally: ${targetKeywords}` : ''}
${category ? `Target Category: ${category}` : ''}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const replyText = aiResponse.text || '';
    let parsedData = null;
    try {
      parsedData = JSON.parse(replyText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON response:', e);
      throw new Error('AI generated invalid JSON payload. Please try again.');
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, data: parsedData });
  } catch (err: any) {
    return handleServerError(res, '/api/admin/generate-content', err);
  }
}

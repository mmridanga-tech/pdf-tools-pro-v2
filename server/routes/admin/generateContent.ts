import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export default async function contentGenHandler(req: Request, res: Response): Promise<void> {
  const { prompt, model = 'gemini-3.7-flash', systemInstruction, temperature = 0.7 } = req.body || {};

  if (!prompt) {
    res.status(400).json({ error: 'Validation Error', message: 'Parameter "prompt" is required.' });
    return;
  }

  try {
    const ai = getAI();
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const config: any = { temperature };
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    res.status(200).json({
      text: response.text || '',
      model,
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Generation Failed',
      message: err.message,
    });
  }
}

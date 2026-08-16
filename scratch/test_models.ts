import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function findWorkingModels() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenAI({ apiKey });

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-3.7-flash',
  ];

  for (const m of candidateModels) {
    try {
      const resp = await ai.models.generateContent({
        model: m,
        contents: 'Say OK',
      });
      console.log(`[SUCCESS] Model ${m} works! Output:`, resp.text?.trim());
    } catch (err: any) {
      console.log(`[FAILED] Model ${m}:`, err.message?.slice(0, 120));
    }
  }
}

findWorkingModels();

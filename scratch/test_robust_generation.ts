import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return cleaned.trim();
}

async function callWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
  let lastErr: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} calling ${params.model}...`);
      const res = await ai.models.generateContent(params);
      return res;
    } catch (err: any) {
      lastErr = err;
      console.warn(`Attempt ${attempt} failed: ${err.message?.slice(0, 100)}`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }
  throw lastErr;
}

async function test() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Create a 3-slide training module on "Cybersécurité en télétravail" in Français for Intermediate level. Return valid JSON.`;

  try {
    const response = await callWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are EduVibe AI. Return JSON only with fields: title, tagline, description, estimatedDuration, slides, quiz.',
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    const cleaned = cleanJsonText(raw);
    const parsed = JSON.parse(cleaned);
    console.log('SUCCESS! Generated title:', parsed.title);
    console.log('Slides count:', parsed.slides?.length);
    console.log('First slide title:', parsed.slides?.[0]?.title);
    console.log('Quiz questions count:', parsed.quiz?.length);
  } catch (err: any) {
    console.error('Fatal error:', err);
  }
}

test();

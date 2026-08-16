import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function testKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing key from .env:', apiKey?.slice(0, 10) + '...');
  
  if (!apiKey) {
    console.error('No GEMINI_API_KEY in .env');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello! Respond with JSON: {"status": "ok"}',
    });
    console.log('Gemini 2.5 response:', resp.text);
  } catch (err: any) {
    console.error('Error with gemini-2.5-flash:', err.message);
  }

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: 'Hello! Respond with JSON: {"status": "ok"}',
    });
    console.log('Gemini 3.7 response:', resp.text);
  } catch (err: any) {
    console.error('Error with gemini-3.7-flash:', err.message);
  }
}

testKey();

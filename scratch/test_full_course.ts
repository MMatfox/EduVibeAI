import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return cleaned.trim();
}

async function testFullCourseGeneration() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a world-class corporate instructional designer.
Create a complete training module on: "Cybersécurité en télétravail".
Language: Français
Audience Level: Intermediate
Slide Count: 3 slides
Target Industry: Général

Generate valid JSON with: title, tagline, description, estimatedDuration, slides (array with slideNumber, title, subtitle, bullets, categoryBadge, visualConcept, trainerNotes), quiz (array of questions).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are EduVibe AI, an expert corporate course designer. Always produce high quality instructional content in Français. Return only valid JSON.`,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    console.log('Raw response preview:', raw.slice(0, 120) + '...');
    const cleaned = cleanJsonText(raw);
    const parsed = JSON.parse(cleaned);
    console.log('Successfully parsed course! Title:', parsed.title);
    console.log('Slides count:', parsed.slides?.length);
  } catch (err: any) {
    console.error('Error generating course:', err);
  }
}

testFullCourseGeneration();

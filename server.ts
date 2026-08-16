import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateSmartFallbackCourse, getCurriculumBlueprint } from './src/utils/courseGenerator';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely with optional user-provided key
const getGeminiClient = (customKey?: string) => {
  const apiKey = (customKey && customKey.trim() !== '') ? customKey.trim() : process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Healthcheck & Key validator
app.get('/api/health', (req, res) => {
  const customKey = req.headers['x-gemini-api-key'] as string;
  const activeKey = customKey || process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasApiKey: Boolean(activeKey && activeKey !== 'MY_GEMINI_API_KEY'),
    isCustomKey: Boolean(customKey),
  });
});

function cleanJsonText(raw: string): string {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return cleaned.trim();
}

async function callGeminiWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
  let lastErr: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await ai.models.generateContent(params);
      return res;
    } catch (err: any) {
      lastErr = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw lastErr;
}

// Endpoint: Validate an API Key
app.post('/api/check-api-key', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const ai = getGeminiClient(customKey);
    if (!ai) {
      return res.json({ valid: false, message: 'Aucune clé API fournie.' });
    }
    const testResp = await callGeminiWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: 'Ping',
    }, 2);
    if (testResp.text) {
      return res.json({ valid: true, message: 'Clé API valide et connectée à Google Gemini 3.7 !' });
    }
    return res.json({ valid: false, message: 'Pas de réponse du modèle.' });
  } catch (error: any) {
    return res.json({ valid: false, message: error.message || 'Échec de connexion.' });
  }
});

import { db } from './src/server/db';

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    // Return user without passwordHash
    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, title, company, avatar, skills } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    const existing = db.getUserByEmail(email);
    if (existing) {
      const { passwordHash, ...safeUser } = existing;
      return res.json({ success: true, user: safeUser, message: 'Compte existant connecté' });
    }
    const created = db.createUser(
      {
        name,
        email,
        title,
        company,
        avatar,
        skills,
      },
      password || 'password123'
    );
    const { passwordHash, ...safeUser } = created;
    return res.status(201).json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur lors de la création de compte' });
  }
});

app.put('/api/auth/profile', (req, res) => {
  try {
    const { userId, ...updates } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }
    const updated = db.updateUserProfile(userId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    const { passwordHash, ...safeUser } = updated;
    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur mise à jour profil' });
  }
});

// Group Routes
app.get('/api/groups', (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (userId) {
      return res.json({ groups: db.getGroupsForUser(userId) });
    }
    return res.json({ groups: db.getAllGroups() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups', (req, res) => {
  try {
    const { group, name, description, icon, owner } = req.body;
    if (group && group.id) {
      const saved = db.upsertGroup(group);
      return res.status(201).json({ success: true, group: saved });
    }
    if (!name || !owner?.id) {
      return res.status(400).json({ error: 'Nom du groupe et propriétaire requis' });
    }
    const newGroup = db.createGroup(owner, name, description || '', icon || '🛡️');
    return res.status(201).json({ success: true, group: newGroup });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups/join', (req, res) => {
  try {
    const { code, user } = req.body;
    if (!code || !user?.id) {
      return res.status(400).json({ error: 'Code et informations utilisateur requis' });
    }
    const result = db.joinGroup(code, user);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups/:id/leave', (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId requis' });
    const success = db.leaveGroup(groupId, userId);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/groups/:id', (req, res) => {
  try {
    const groupId = req.params.id;
    const success = db.deleteGroup(groupId);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/groups/:id/members/:userId', (req, res) => {
  try {
    const { id: groupId, userId } = req.params;
    const { role } = req.body;
    const success = db.updateMemberRole(groupId, userId, role);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/groups/:id/members/:userId', (req, res) => {
  try {
    const { id: groupId, userId } = req.params;
    const success = db.removeMember(groupId, userId);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Course Routes (DB Persistence)
app.get('/api/courses', (req, res) => {
  try {
    const courses = db.getAllCourses();
    return res.json({ courses });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', (req, res) => {
  try {
    const course = req.body.course;
    if (!course?.id) return res.status(400).json({ error: 'Course payload requis' });
    const saved = db.saveCourse(course);
    return res.json({ success: true, course: saved });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/courses/:id', (req, res) => {
  try {
    const success = db.deleteCourse(req.params.id);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// Endpoint: Generate Full Course with Gemini AI
app.post('/api/generate-course', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const {
      topic = 'Cybersécurité en télétravail',
      audienceLevel = 'Intermediate',
      slideCount = 5,
      language = 'Français',
      industry = 'Général',
      themeId = 'indigo',
      objective = 'skills',
      tone = 'interactive',
      sessionFormat = 'workshop',
      customDirectives = '',
      model = 'gemini-3.7-flash',
    } = req.body;

    const ai = getGeminiClient(customKey);

    if (!ai) {
      // Return smart generative fallback when API key is not configured
      const fallbackCourse = generateSmartFallbackCourse(
        topic,
        audienceLevel,
        slideCount,
        language,
        industry,
        themeId,
        objective,
        tone,
        sessionFormat,
        customDirectives
      );
      return res.json({
        course: fallbackCourse,
        isFallback: true,
        message: 'Course generated with offline fallback engine. Connect a Gemini API Key in Settings for customized dynamic generation.',
      });
    }

    const targetCount = Math.min(Math.max(slideCount || 5, 3), 12);
    const blueprints = getCurriculumBlueprint(topic, targetCount, industry, language);

    const blueprintInstruction = blueprints
      .map((b, idx) => `Slide ${idx + 1}: Theme = "${b.theme}" | Specific Focus = ${b.focus}`)
      .join('\n');

    const prompt = `You are a world-class executive corporate instructional designer and master trainer.
Your task is to generate a comprehensive, ultra-high-quality training module on "${topic}".

Parameters:
- Target Language: ${language}
- Audience Level: ${audienceLevel} (Beginner, Intermediate, or Advanced)
- MANDATORY Slide Count: EXACTLY ${targetCount} slides. You MUST generate all ${targetCount} slides (from slide 1 to slide ${targetCount}).
- Target Industry: ${industry}
- Pedagogical Objective: ${objective}
- Tone & Delivery: ${tone}
- Session Format: ${sessionFormat}
${customDirectives ? `- Client Custom Requirements: "${customDirectives}"` : ''}

MANDATORY CURRICULUM BLUEPRINT (You must dedicate each slide to this specific thematic angle):
${blueprintInstruction}

STRICT QUALITY RULES:
1. NO GENERIC REPETITION: Never output generic filler bullets like "Understand the basics of ${topic}" or "Apply best practices". Every bullet point must contain concrete operational actions, specific business terms, real tools, numbers, or technical steps.
2. DIVERSE VISUAL CONCEPTS: Rotate the visualConcept type across slides ('metric', 'framework', 'comparison', 'flow', 'takeaway'). For comparisons, provide realistic contrasting points. For metrics, provide realistic impact stats.
3. CHARISMATIC ORAL SCRIPT: In trainerNotes.oralScript, write a charismatic, natural, conversational spoken speech (4-6 sentences) that a senior executive trainer would say out loud to an engaged room.
4. EXACT COUNT: The "slides" array MUST contain exactly ${targetCount} elements with slideNumber 1 to ${targetCount}.
5. QUIZ: Provide 4 to 5 scenario-based practical multiple-choice questions with thorough educational explanations.

Return valid JSON adhering to the schema.`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are EduVibe AI, an expert corporate course designer. Always produce high quality instructional content in ${language}. Ensure tone is highly professional and actionable. Return valid JSON only.`,
        responseMimeType: 'application/json',
      },
    }, 3);

    const rawText = response.text || '{}';
    const cleanedText = cleanJsonText(rawText);
    const parsedData = JSON.parse(cleanedText);

    let rawSlides: any[] = Array.isArray(parsedData.slides) ? parsedData.slides : [];

    // Fallback completeness check: If Gemini returned fewer slides than requested, complete the missing ones!
    if (rawSlides.length < targetCount) {
      const fallbackCourse = generateSmartFallbackCourse(
        topic,
        audienceLevel,
        targetCount,
        language,
        industry,
        themeId,
        objective,
        tone,
        sessionFormat,
        customDirectives
      );

      const existingCount = rawSlides.length;
      for (let i = existingCount; i < targetCount; i++) {
        const fallbackSlide = fallbackCourse.slides[i];
        if (fallbackSlide) {
          rawSlides.push(fallbackSlide);
        }
      }
    }

    const fullCourse = {
      id: 'gen-' + Date.now(),
      title: parsedData.title || topic,
      tagline: parsedData.tagline || `Formation interactive sur ${topic}`,
      description: parsedData.description || `Module généré par IA (${targetCount} diapositives) pour niveau ${audienceLevel}`,
      topic,
      audienceLevel,
      language,
      industry,
      estimatedDuration: parsedData.estimatedDuration || targetCount * 8,
      themeId,
      createdAt: new Date().toISOString(),
      slides: rawSlides.slice(0, targetCount).map((s: any, idx: number) => ({
        ...s,
        id: `slide-${idx + 1}-${Date.now()}`,
        slideNumber: idx + 1,
      })),
      quiz: (parsedData.quiz && parsedData.quiz.length > 0 ? parsedData.quiz : []).map((q: any, idx: number) => ({
        ...q,
        id: `quiz-${idx + 1}-${Date.now()}`,
      })),
    };

    res.json({ course: fullCourse, isFallback: false });
  } catch (error: any) {
    console.error('Error generating course with Gemini:', error);
    const {
      topic = 'Formation',
      audienceLevel = 'Intermediate',
      slideCount = 5,
      language = 'Français',
      industry = 'Général',
      themeId = 'indigo',
      objective = 'skills',
      tone = 'interactive',
      sessionFormat = 'workshop',
      customDirectives = '',
    } = req.body;
    const fallbackCourse = generateSmartFallbackCourse(
      topic,
      audienceLevel,
      slideCount,
      language,
      industry,
      themeId,
      objective,
      tone,
      sessionFormat,
      customDirectives
    );
    res.json({
      course: fallbackCourse,
      isFallback: true,
      errorNotice: error.message || 'Gemini API call failed, switched to smart fallback engine.',
    });
  }
});

// Endpoint: Generate a Single Slide dynamically
app.post('/api/generate-single-slide', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const { courseTopic, subtopic, slideNumber = 1, language = 'Français', audienceLevel = 'Intermediate' } = req.body;
    const ai = getGeminiClient(customKey);

    if (!ai) {
      // Fallback single slide
      const newSlide = {
        id: `slide-${Date.now()}`,
        slideNumber,
        title: subtopic || 'Nouvelle Slide Thématique',
        subtitle: `Approfondissement pour la formation "${courseTopic}"`,
        categoryBadge: 'Focus Pédagogique',
        bullets: [
          `Définir clairement les objectifs opérationnels associés à ce point clé`,
          `Appliquer la méthode pas-à-pas pour sécuriser les flux de travail`,
          `Identifier les erreurs courantes et instaurer un contrôle croisé`,
          `Mesurer l'impact des bonnes pratiques sur les résultats de l'équipe`
        ],
        visualConcept: {
          type: 'framework' as const,
          title: 'Méthodologie Opérationnelle',
          badge: 'BEST PRACTICE',
          details: [
            'Cadrage initial et alignement des priorités',
            'Exécution contrôlée avec validation par étapes',
            'Retours d’expérience & amélioration continue'
          ]
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            'Souligner la simplicité de mise en œuvre immédiate',
            'Demander aux apprenants un exemple récent de blocage similaire',
            'Rappeler la règle d’or : simplicité, rigueur et traçabilité'
          ],
          oralScript: `Cette étape est cruciale pour structurer vos actions quotidiennes. Prenez le temps de valider chaque point avant de passer à la phase suivante.`,
          interactivePrompt: `Qui parmi vous a déjà rencontré une difficulté sur ce cas précis ? Partagez votre réflexe initial.`
        }
      };
      return res.json({ slide: newSlide, isFallback: true });
    }

    const prompt = `You are EduVibe AI. Create 1 single high-impact corporate training slide in ${language}.
Main Course Topic: "${courseTopic}"
Slide Sub-topic / Focus: "${subtopic || 'Key Strategy'}"
Target Level: ${audienceLevel}
Slide Number: ${slideNumber}

Return a single JSON object with:
- slideNumber (${slideNumber})
- title (max 8 words)
- subtitle
- categoryBadge (e.g. "Focus Pratique", "Étude de Cas", "Plan d'Action")
- bullets (3-4 concise points)
- visualConcept: { type ('metric'|'framework'|'comparison'|'flow'|'takeaway'|'quote'), title, badge, details (2-3 lines), metric (optional), metricLabel (optional) }
- trainerNotes: { timeMinutes, keyTalkingPoints (array of 3), oralScript (3-4 sentences), interactivePrompt }`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    }, 2);

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    const slide = {
      ...parsed,
      id: `slide-${Date.now()}`,
      slideNumber: slideNumber,
    };
    res.json({ slide, isFallback: false });
  } catch (error: any) {
    console.error('Error generating single slide:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Live AI Training Assistant Chat
app.post('/api/tutor-chat', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const { message, history = [], courseContext, language = 'Français' } = req.body;
    const ai = getGeminiClient(customKey);

    if (!ai) {
      // Dynamic simulated response if no API key
      const simulatedReply = getSimulatedTutorReply(message, courseContext);
      return res.json({ reply: simulatedReply });
    }

    const systemInstruction = `You are "EduVibe AI Coach", an expert corporate tutor assisting live learners and trainers.
Course Topic: "${courseContext?.topic || 'Corporate Training'}"
Course Title: "${courseContext?.title || ''}"
Current Slide Context: ${JSON.stringify(courseContext?.currentSlide || {})}
Language: Answer in the requested language: ${language} (or match user language).
Tone: Highly encouraging, pedagogically crisp, structured with bullet points or emojis when helpful, concise (under 150 words unless asked for a long explanation).`;

    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message: message,
    });

    res.json({ reply: response.text || 'Je suis à votre disposition pour toute question sur ce cours.' });
  } catch (error: any) {
    console.error('Error in tutor chat:', error);
    res.json({
      reply: `En tant qu'assistant de formation, je vous conseille d'appliquer la méthode par étapes : identifiez le problème clé, posez les règles de sécurité ou de gestion adaptées, et testez vos réflexes avec le quiz interactif !`,
    });
  }
});

// Endpoint: Enhance / Rewrite a Specific Slide
app.post('/api/enhance-slide', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const { slide, action = 'expand_notes', language = 'Français' } = req.body;
    const ai = getGeminiClient(customKey);

    if (!ai) {
      return res.json({
        enhancedNotes: `[Notes enrichies] Insistez sur les exemples vécus des participants. Posez la question : "Comment appliquez-vous ce principe dans vos tâches quotidiennes pour éviter tout blocage ?".`,
      });
    }

    const prompt = `Given this training slide:
Title: ${slide.title}
Bullets: ${slide.bullets?.join('; ') || ''}
Current Trainer Notes: ${JSON.stringify(slide.trainerNotes || {})}

Task: Provide an expanded, highly professional and energetic oral script and 2 additional practical role-play / discussion questions for the speaker in ${language}. Keep it natural, impactful, and conversational.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ enhancedNotes: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});



function getSimulatedTutorReply(message: string, context: any) {
  const text = message.toLowerCase();
  // Vietnamese queries
  if (text.includes('chào') || text.includes('xin chào') || text.includes('hello')) {
    return `Xin chào! Tôi là Trợ lý Huấn luyện AI của bạn cho khóa học "${context?.title || 'EduVibe'}". Bạn có thắc mắc gì về slide hiện tại hay cần giải thích khái niệm nào không?`;
  }
  if (text.includes('quiz') || text.includes('câu hỏi') || text.includes('kiểm tra')) {
    return `💡 Để làm tốt bài trắc nghiệm, bạn hãy tập trung vào các nguyên tắc cốt lõi: nhận diện rủi ro, xác thực nguồn thông tin và báo cáo kịp thời khi có sự cố nhé!`;
  }
  if (text.includes('ví dụ') || text.includes('thực tế') || text.includes('tình huống')) {
    return `🎭 **Tình huống thực tế:** Giả sử một nhân viên nhận được email khẩn cấp từ Giám đốc yêu cầu chuyển tiền gấp qua tài khoản lạ vào lúc 18h30.\n\n**Phản xạ chuẩn:** Tuyệt đối không trả lời email, gọi điện thoại trực tiếp để xác nhận và thông báo ngay cho phòng CNTT/Bảo mật.`;
  }

  // French queries
  if (text.includes('bonjour') || text.includes('salut')) {
    return `Bonjour ! Je suis votre coach IA pour la formation "${context?.title || 'EduVibe'}". Avez-vous une question sur la slide actuelle ou sur un point du quiz ?`;
  }
  if (text.includes('test') || text.includes('question')) {
    return `💡 Pour réussir le quiz, concentrez-vous sur les règles fondamentales : identification des risques, vérification systématique des sources et respect des protocoles d'alerte !`;
  }
  if (text.includes('exemple') || text.includes('cas') || text.includes('roleplay')) {
    return `🎭 **Mise en situation pratique :** Imaginez qu'un collaborateur distant reçoive un email urgent à 18h30 semblant provenir du Directeur Financier demandant un virement immédiat.\n\n**Réflexe attendu :** Ne pas répondre à l'email, contacter le DAF par un canal tiers vérifié (téléphone direct ou appel sécurisé), et avertir le support IT.`;
  }

  // English fallback
  return `Great point! For "${context?.topic || 'this topic'}", the primary goal is turning knowledge into actionable daily habits. Feel free to ask for a real-world example or concept breakdown!`;
}


// Vite middleware & production static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduVibe AI Server running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless functions / tests
export { app };
export default app;

// Start server only when running standalone (not inside Vercel serverless handler)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}


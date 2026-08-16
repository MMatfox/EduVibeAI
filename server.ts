import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

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

// Endpoint: Validate an API Key
app.post('/api/check-api-key', async (req, res) => {
  try {
    const customKey = req.body?.apiKey || (req.headers['x-gemini-api-key'] as string);
    const ai = getGeminiClient(customKey);
    if (!ai) {
      return res.json({ valid: false, message: 'No API key provided or empty key.' });
    }
    const testResp = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: 'Ping',
    });
    if (testResp.text) {
      return res.json({ valid: true, message: 'API key is valid and connected!' });
    }
    return res.json({ valid: false, message: 'No response from model.' });
  } catch (error: any) {
    return res.json({ valid: false, message: error.message || 'Failed to connect with key.' });
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
      model = 'gemini-3.7-flash',
    } = req.body;

    const ai = getGeminiClient(customKey);

    if (!ai) {
      // Return smart generative fallback when API key is not configured
      const fallbackCourse = generateSmartFallbackCourse(topic, audienceLevel, slideCount, language, industry, themeId);
      return res.json({
        course: fallbackCourse,
        isFallback: true,
        message: 'Course generated with offline fallback engine. Connect a Gemini API Key in Settings for customized dynamic generation.',
      });
    }

    const prompt = `You are a world-class corporate instructional designer and executive trainer.
Create a complete, engaging interactive training module on the topic: "${topic}".
Language: ${language}
Audience Level: ${audienceLevel} (Beginner, Intermediate, or Advanced)
Slide Count: ${slideCount} slides
Target Industry: ${industry}

Generate:
1. Title, catchy tagline, and a brief description.
2. An array of ${slideCount} detailed slides.
   Each slide MUST have:
   - slideNumber (1 to ${slideCount})
   - title (concise, impactful, max 8 words)
   - subtitle (clear, clarifying context)
   - bullets (3 to 4 strong actionable bullet points)
   - categoryBadge (e.g., "Introduction & Context", "Deep Dive", "Best Practices", "Risk Mitigation", "Action Plan")
   - visualConcept: object containing:
     - type (one of: 'metric', 'framework', 'comparison', 'flow', 'takeaway', 'quote')
     - title (title of the visual card)
     - badge (short badge text)
     - details (array of 2 to 3 concise summary lines or bullet points)
     - metric (optional, e.g. "84%", "+2.5x", "3 min", if type is 'metric')
     - metricLabel (optional, short explanation of the metric)
     - leftTitle, leftPoints, rightTitle, rightPoints (optional, if type is 'comparison')
   - trainerNotes:
     - timeMinutes (integer, 5 to 15)
     - keyTalkingPoints (array of 3 specific tips/cues for the speaker)
     - oralScript (the exact conversational speech script the trainer should say out loud, 3-5 sentences)
     - interactivePrompt (an engaging question or live activity prompt to ask the audience)
3. An array of 3 to 4 interactive multiple-choice quiz questions (quiz) to test knowledge.
   Each question must have:
   - question (string)
   - options (array of 4 distinct plausible answers)
   - correctOptionIndex (0, 1, 2, or 3)
   - explanation (educational explanation why the correct answer is right)
   - difficulty (Beginner, Intermediate, or Advanced)
   - hint (a subtle clue)

Return valid JSON adhering to the schema.`;

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are EduVibe AI, an expert corporate course designer. Always produce high quality instructional content in ${language}. Ensure tone is highly professional and actionable.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedDuration: { type: Type.INTEGER },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  categoryBadge: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  visualConcept: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: "One of 'metric', 'framework', 'comparison', 'flow', 'takeaway', 'quote'" },
                      title: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      metric: { type: Type.STRING },
                      metricLabel: { type: Type.STRING },
                      details: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      leftTitle: { type: Type.STRING },
                      leftPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rightTitle: { type: Type.STRING },
                      rightPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['type', 'title', 'details'],
                  },
                  trainerNotes: {
                    type: Type.OBJECT,
                    properties: {
                      timeMinutes: { type: Type.INTEGER },
                      keyTalkingPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      oralScript: { type: Type.STRING },
                      interactivePrompt: { type: Type.STRING },
                    },
                    required: ['timeMinutes', 'keyTalkingPoints', 'oralScript', 'interactivePrompt'],
                  },
                },
                required: ['slideNumber', 'title', 'subtitle', 'bullets', 'visualConcept', 'trainerNotes'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctOptionIndex', 'explanation', 'difficulty', 'hint'],
              },
            },
          },
          required: ['title', 'tagline', 'description', 'slides', 'quiz'],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    const fullCourse = {
      id: 'gen-' + Date.now(),
      title: parsedData.title || topic,
      tagline: parsedData.tagline || `Formation interactive sur ${topic}`,
      description: parsedData.description || `Module généré par IA pour niveau ${audienceLevel}`,
      topic,
      audienceLevel,
      language,
      industry,
      estimatedDuration: parsedData.estimatedDuration || slideCount * 8,
      themeId,
      createdAt: new Date().toISOString(),
      slides: (parsedData.slides || []).map((s: any, idx: number) => ({
        ...s,
        id: `slide-${idx + 1}-${Date.now()}`,
        slideNumber: s.slideNumber || idx + 1,
      })),
      quiz: (parsedData.quiz || []).map((q: any, idx: number) => ({
        ...q,
        id: `quiz-${idx + 1}-${Date.now()}`,
      })),
    };

    res.json({ course: fullCourse, isFallback: false });
  } catch (error: any) {
    console.error('Error generating course with Gemini:', error);
    // Fallback gracefully on API errors
    const { topic = 'Formation', audienceLevel = 'Intermediate', slideCount = 5, language = 'Français', industry = 'Général', themeId = 'indigo' } = req.body;
    const fallbackCourse = generateSmartFallbackCourse(topic, audienceLevel, slideCount, language, industry, themeId);
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
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

// Helper for Smart Fallback Course Generation
function generateSmartFallbackCourse(
  topic: string,
  audienceLevel: string,
  slideCount: number,
  language: string,
  industry: string,
  themeId: string
) {
  const langLower = (language || '').toLowerCase();
  const isVietnamese = langLower.includes('vi') || langLower.includes('tiếng việt') || langLower.includes('vietnamese');
  const isFrench = langLower.includes('fr') || langLower.includes('français') || langLower.includes('french');

  let title = `Masterclass: ${topic}`;
  let tagline = `Mastering key fundamentals, mitigating risks, and applying best practices (${audienceLevel})`;
  let description = `Intensive corporate training program designed for ${audienceLevel} level across ${industry}.`;

  if (isVietnamese) {
    title = `Chuyên Đề Đào Tạo: ${topic}`;
    tagline = `Nắm vững nguyên lý cốt lõi, phòng ngừa rủi ro và áp dụng thực tiễn (${audienceLevel})`;
    description = `Chương trình đào tạo chuyên sâu cấp độ ${audienceLevel} trong lĩnh vực ${industry}.`;
  } else if (isFrench) {
    title = `Masterclass : ${topic}`;
    tagline = `Comprendre les fondamentaux, maîtriser les pièges et déployer les meilleures pratiques (${audienceLevel})`;
    description = `Programme de formation intensif conçu pour le niveau ${audienceLevel} dans le secteur ${industry}.`;
  }

  const slides = Array.from({ length: Math.min(slideCount, 7) }, (_, idx) => {
    const sNum = idx + 1;
    if (isVietnamese) {
      return {
        id: `s-${sNum}-${Date.now()}`,
        slideNumber: sNum,
        title: sNum === 1
          ? `1. Bối Cảnh & Mục Tiêu Chiến Lược: ${topic}`
          : sNum === 2
          ? `2. Các Cơ Chế Cốt Lõi & Rủi Ro Tiềm Ẩn`
          : sNum === 3
          ? `3. Khung Phương Pháp & Quy Trình Vận Hành Chuẩn`
          : sNum === 4
          ? `4. Phân Tích Tình Huống Thực Tế & Bài Học Kinh Nghiệm`
          : sNum === 5
          ? `5. Kế Hoạch Hành Động & Checklist Triển Khai`
          : `Chuyên Đề ${sNum}: Công Cụ Mở Rộng & Tối Ưu Hóa`,
        subtitle: `Phương pháp thực chiến dành cho học viên cấp độ ${audienceLevel}`,
        categoryBadge: sNum === 1 ? 'Khởi Động' : sNum === slideCount ? 'Tổng Kết' : 'Chiến Lược',
        bullets: [
          `Xác định các yếu tố quyết định và chỉ số đo lường hiệu quả then chốt liên quan đến ${topic}.`,
          `Áp dụng các quy trình tiêu chuẩn nhằm giảm thiểu sai sót trong vận hành hàng ngày.`,
          `Nâng cao sự phối hợp liên phòng ban và tinh thần trách nhiệm trong công việc.`,
          `Thiết lập cơ chế kiểm tra và cải tiến liên tục trong quy trình làm việc số.`
        ],
        visualConcept: {
          type: sNum % 2 === 0 ? 'framework' : 'metric',
          title: `Trọng Tâm: ${topic}`,
          metric: sNum === 1 ? '85%' : sNum === 3 ? '4.2x' : undefined,
          metricLabel: sNum === 1 ? 'học viên nâng cao hiệu quả làm việc sau khi hoàn thành khóa học' : undefined,
          details: [
            'Trụ cột 1: Chủ động nhận diện và quản trị rủi ro',
            'Trụ cột 2: Chuẩn hóa quy trình và tự động hóa',
            'Trụ cột 3: Đo lường định kỳ và cải tiến chất lượng'
          ],
          badge: `Cột Mốc #${sNum}`
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            `Nhấn mạnh giá trị thực tiễn và hiệu quả ứng dụng của ${topic}.`,
            `Mời học viên chia sẻ một khó khăn thực tế mà họ đang gặp phải.`,
            `Kết nối lý thuyết với các thói quen làm việc hàng ngày.`
          ],
          oralScript: `Xin chào toàn thể anh chị. Trong slide này, chúng ta sẽ đi sâu vào ${topic}. Hãy nhớ rằng thành công bền vững bắt đầu từ những thói quen nhỏ được thực hiện nghiêm túc và đồng bộ mỗi ngày.`,
          interactivePrompt: `Câu hỏi tương tác: Thách thức lớn nhất của anh/chị khi áp dụng các quy tắc này tại bộ phận của mình là gì?`
        }
      };
    } else if (isFrench) {
      return {
        id: `s-${sNum}-${Date.now()}`,
        slideNumber: sNum,
        title: sNum === 1
          ? `1. Contexte & Enjeux Stratégiques de ${topic}`
          : sNum === 2
          ? `2. Les Mécanismes Clés & Vulnérabilités`
          : sNum === 3
          ? `3. Méthodologie Opérationnelle & Bonnes Pratiques`
          : sNum === 4
          ? `4. Analyse de Cas Concret & Scénario Réel`
          : sNum === 5
          ? `5. Plan d'Action & Checklist d'Implémentation`
          : `Module ${sNum} : Approfondissement & Outils`,
        subtitle: `Comprendre et appliquer les réflexes indispensables (${audienceLevel})`,
        categoryBadge: sNum === 1 ? 'Introduction' : sNum === slideCount ? 'Synthèse' : 'Opérationnel',
        bullets: [
          `Identifier les facteurs déterminants et les indicateurs clés de performance liés à ${topic}.`,
          `Mettre en œuvre les procédures recommandées pour limiter les erreurs opérationnelles.`,
          `Sensibiliser les parties prenantes et favoriser une culture d'amélioration continue.`,
          `Intégrer les protocoles de vérification systématique dans le flux de travail quotidien.`
        ],
        visualConcept: {
          type: sNum % 2 === 0 ? 'framework' : 'metric',
          title: `Focus Clé : ${topic}`,
          metric: sNum === 1 ? '78%' : sNum === 3 ? '3.5x' : undefined,
          metricLabel: sNum === 1 ? 'des équipes améliorent leur efficacité après cette formation' : undefined,
          details: [
            'Pilier 1 : Anticipation et analyse des risques',
            'Pilier 2 : Automatisation et respect des protocoles',
            'Pilier 3 : Feedback régulier et partage d’expérience'
          ],
          badge: `Axe Stratégique #${sNum}`
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            `Rappeler les enjeux métiers spécifiques à ${topic}.`,
            `Engager l'auditoire en demandant un retour d'expérience vécu.`,
            `Faire le lien avec les objectifs globaux de l'organisation.`
          ],
          oralScript: `Bonjour à tous. Abordons maintenant cette étape essentielle de notre module sur "${topic}". Gardez en tête que l'efficacité repose avant tout sur des habitudes simples répétées avec rigueur au quotidien.`,
          interactivePrompt: `Question pour le groupe : Quelle est votre plus grande difficulté rencontrée sur ce sujet lors du dernier trimestre ?`
        }
      };
    } else {
      return {
        id: `s-${sNum}-${Date.now()}`,
        slideNumber: sNum,
        title: sNum === 1
          ? `1. Strategic Context & Challenges of ${topic}`
          : sNum === 2
          ? `2. Core Mechanics & Key Vulnerabilities`
          : sNum === 3
          ? `3. Operational Framework & Best Practices`
          : sNum === 4
          ? `4. Real-world Case Study & Incident Analysis`
          : sNum === 5
          ? `5. Action Plan & Implementation Checklist`
          : `Module ${sNum}: In-depth Tools & Scaling`,
        subtitle: `Actionable methodologies for ${audienceLevel} professionals`,
        categoryBadge: sNum === 1 ? 'Foundations' : sNum === slideCount ? 'Summary' : 'Core Strategy',
        bullets: [
          `Identify primary risk drivers and critical indicators for ${topic}.`,
          `Deploy standardized workflows to mitigate operational pitfalls.`,
          `Empower cross-functional collaboration and accountability across remote teams.`,
          `Establish continuous feedback loops for sustainable adoption.`
        ],
        visualConcept: {
          type: sNum % 2 === 0 ? 'framework' : 'metric',
          title: `Key Paradigm: ${topic}`,
          metric: sNum === 1 ? '85%' : sNum === 3 ? '4.2x' : undefined,
          metricLabel: sNum === 1 ? 'increase in team alignment and error reduction' : undefined,
          details: [
            'Core Pillar 1: Proactive risk detection & posture',
            'Core Pillar 2: Standardized playbooks & automation',
            'Core Pillar 3: Real-time monitoring & validation'
          ],
          badge: `Milestone #${sNum}`
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            `Highlight the business ROI and risk mitigation of ${topic}.`,
            `Invite participants to share a recent friction point or challenge.`,
            `Connect theoretical concepts to immediate operational habits.`
          ],
          oralScript: `Welcome everyone to this slide. When examining ${topic}, we must bridge high-level strategy with daily pragmatic habits. Let us review the foundational pillars on screen.`,
          interactivePrompt: `Prompt the audience: What is your primary obstacle when applying these rules in your workflow?`
        }
      };
    }
  });

  let quiz: any[] = [];
  if (isVietnamese) {
    quiz = [
      {
        id: `q-1-${Date.now()}`,
        question: `Hành động quan trọng nhất cần thực hiện đầu tiên để tối ưu hóa hiệu quả của ${topic} là gì?`,
        options: [
          `Bỏ qua các cảnh báo ban đầu và đợi khi có sự cố lớn mới xử lý`,
          `Áp dụng nghiêm túc các quy trình chuẩn và kiểm tra xác thực nguồn thông tin`,
          `Ủy thác toàn bộ công việc cho người khác mà không có tài liệu hướng dẫn`,
          `Sử dụng các công cụ không được cấp phép để làm việc nhanh hơn`
        ],
        correctOptionIndex: 1,
        explanation: `Sự cẩn trọng trong phương pháp và kiểm chứng thông tin đảm bảo tính an toàn và chuẩn mực trong vận hành doanh nghiệp.`,
        difficulty: 'Beginner' as const,
        hint: `Hãy chú trọng vào việc phòng ngừa rủi ro và tuân thủ hướng dẫn chuẩn.`
      },
      {
        id: `q-2-${Date.now()}`,
        question: `Khi phát hiện dấu hiệu bất thường hoặc nguy cơ tiềm ẩn, bước xử lý chuẩn mực là gì?`,
        options: [
          `Giữ im lặng để không làm phiền đồng nghiệp xung quanh`,
          `Báo cáo ngay cho người phụ trách hoặc bộ phận chuyên trách để có hướng xử lý kịp thời`,
          `Khởi động lại máy tính với hy vọng sự cố sẽ tự biến mất`,
          `Chuyển tiếp thông tin nghi vấn cho toàn bộ công ty mà không cảnh báo`
        ],
        correctOptionIndex: 1,
        explanation: `Báo cáo sớm giúp khoanh vùng và ngăn chặn rủi ro lây lan trước khi gây thiệt hại trên diện rộng.`,
        difficulty: 'Intermediate' as const,
        hint: `Truyền thông sớm và kịp thời là chìa khóa xử lý khủng hoảng.`
      }
    ];
  } else if (isFrench) {
    quiz = [
      {
        id: `q-1-${Date.now()}`,
        question: `Quelle est la première mesure à adopter pour optimiser ${topic} au quotidien ?`,
        options: [
          `Ignorer les alertes initiales et attendre un dysfonctionnement majeur`,
          `Appliquer scrupuleusement les protocoles et vérifier les sources d'information`,
          `Déléguer l'ensemble de la responsabilité sans suivi ni documentation`,
          `Utiliser des outils non homologués pour gagner du temps`
        ],
        correctOptionIndex: 1,
        explanation: `La rigueur méthodologique et la vérification des sources garantissent la conformité et la sécurité opérationnelle.`,
        difficulty: 'Beginner' as const,
        hint: `Pensez à la prévention et au respect des consignes établies.`
      },
      {
        id: `q-2-${Date.now()}`,
        question: `En cas d'anomalie ou d'incertitude lors de l'exécution, quelle est la démarche recommandée ?`,
        options: [
          `Cacher l'incident pour ne pas perturber l'équipe`,
          `Signaler immédiatement la situation au responsable ou au support dédié`,
          `Redémarrer le poste en espérant que le problème disparaisse`,
          `Transférer le message suspect à tous ses collègues sans avertissement`
        ],
        correctOptionIndex: 1,
        explanation: `Un signalement rapide permet d'endiguer les risques avant qu'ils ne se propagent au reste de l'organisation.`,
        difficulty: 'Intermediate' as const,
        hint: `La communication précoce est toujours la clé.`
      }
    ];
  } else {
    quiz = [
      {
        id: `q-1-${Date.now()}`,
        question: `What is the most effective initial step when tackling ${topic}?`,
        options: [
          `Bypass standard procedures to finish earlier`,
          `Establish verified guidelines and follow security hygiene`,
          `Delegate all tasks without documentation`,
          `Disable monitoring logs`
        ],
        correctOptionIndex: 1,
        explanation: `Structured guidelines and proactive hygiene prevent the majority of operational breakdowns.`,
        difficulty: 'Beginner' as const,
        hint: `Focus on prevention and structured best practices.`
      },
      {
        id: `q-2-${Date.now()}`,
        question: `When detecting an anomaly or potential risk, what should you do first?`,
        options: [
          `Keep it private to avoid alarming management`,
          `Immediately isolate the system and report to the designated lead/SOC`,
          `Forward suspicious payloads to everyone on Slack`,
          `Wait 48 hours to see if it fixes itself`
        ],
        correctOptionIndex: 1,
        explanation: `Immediate reporting enables the response team to contain potential threats quickly without compounding damage.`,
        difficulty: 'Intermediate' as const,
        hint: `Early escalation is the foundation of incident management.`
      }
    ];
  }

  return {
    id: `course-${Date.now()}`,
    title,
    tagline,
    description,
    topic,
    audienceLevel: audienceLevel as any,
    language,
    industry,
    estimatedDuration: slideCount * 8,
    themeId: (themeId as any) || 'indigo',
    slides,
    quiz,
    createdAt: new Date().toISOString(),
  };
}

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

startServer();

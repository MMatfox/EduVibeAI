import { CoursePayload, Slide, VisualConcept, CourseTheme } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Clean JSON text by removing markdown code fences
 */
export function cleanJsonText(raw: string): string {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return cleaned.trim();
}

/**
 * Generate a full fallback training course with rich pedagogy, slides, visual cards, notes, and quiz.
 */
export function generateSmartFallbackCourse(
  topic: string,
  audienceLevel: string = 'Intermediate',
  slideCount: number = 5,
  language: string = 'Français',
  industry: string = 'Général',
  themeId: string = 'indigo'
): CoursePayload {
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

  const numSlides = Math.min(Math.max(slideCount, 3), 8);
  const slides: Slide[] = Array.from({ length: numSlides }, (_, idx) => {
    const sNum = idx + 1;
    if (isVietnamese) {
      return {
        id: `s-${sNum}-${Date.now()}`,
        slideNumber: sNum,
        title:
          sNum === 1
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
        categoryBadge: sNum === 1 ? 'Khởi Động' : sNum === numSlides ? 'Tổng Kết' : 'Chiến Lược',
        bullets: [
          `Xác định các yếu tố quyết định và chỉ số đo lường hiệu quả then chốt liên quan đến ${topic}.`,
          `Áp dụng các quy trình tiêu chuẩn nhằm giảm thiểu sai sót trong vận hành hàng ngày.`,
          `Nâng cao sự phối hợp liên phòng ban và tinh thần trách nhiệm trong công việc.`,
          `Thiết lập cơ chế kiểm tra và cải tiến liên tục trong quy trình làm việc số.`,
        ],
        visualConcept: {
          type: (sNum % 2 === 0 ? 'framework' : 'metric') as VisualConcept['type'],
          title: `Trọng Tâm: ${topic}`,
          metric: sNum === 1 ? '85%' : sNum === 3 ? '4.2x' : undefined,
          metricLabel: sNum === 1 ? 'học viên nâng cao hiệu quả làm việc sau khi hoàn thành khóa học' : undefined,
          details: [
            'Trụ cột 1: Chủ động nhận diện và quản trị rủi ro',
            'Trụ cột 2: Chuẩn hóa quy trình và tự động hóa',
            'Trụ cột 3: Đo lường định kỳ và cải tiến chất lượng',
          ],
          badge: `Cột Mốc #${sNum}`,
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            `Nhấn mạnh giá trị thực tiễn và hiệu quả ứng dụng của ${topic}.`,
            `Mời học viên chia sẻ một khó khăn thực tế mà họ đang gặp phải.`,
            `Kết nối lý thuyết với các thói quen làm việc hàng ngày.`,
          ],
          oralScript: `Xin chào toàn thể anh chị. Trong slide này, chúng ta sẽ đi sâu vào ${topic}. Hãy nhớ rằng thành công bền vững bắt đầu từ những thói quen nhỏ được thực hiện nghiêm túc và đồng bộ mỗi ngày.`,
          interactivePrompt: `Câu hỏi tương tác: Thách thức lớn nhất của anh/chị khi áp dụng các quy tắc này tại bộ phận của mình là gì?`,
        },
      };
    } else if (isFrench) {
      return {
        id: `s-${sNum}-${Date.now()}`,
        slideNumber: sNum,
        title:
          sNum === 1
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
        categoryBadge: sNum === 1 ? 'Introduction' : sNum === numSlides ? 'Synthèse' : 'Opérationnel',
        bullets: [
          `Identifier les facteurs déterminants et les indicateurs clés de performance liés à ${topic}.`,
          `Mettre en œuvre les procédures recommandées pour limiter les erreurs opérationnelles.`,
          `Sensibiliser les parties prenantes et favoriser une culture d'amélioration continue.`,
          `Intégrer les protocoles de vérification systématique dans le flux de travail quotidien.`,
        ],
        visualConcept: {
          type: (sNum % 2 === 0 ? 'framework' : 'metric') as VisualConcept['type'],
          title: `Focus Clé : ${topic}`,
          metric: sNum === 1 ? '78%' : sNum === 3 ? '3.5x' : undefined,
          metricLabel: sNum === 1 ? 'des équipes améliorent leur efficacité après cette formation' : undefined,
          details: [
            'Pilier 1 : Anticipation et analyse des risques',
            'Pilier 2 : Automatisation et respect des protocoles',
            'Pilier 3 : Feedback régulier et partage d’expérience',
          ],
          badge: `Axe Stratégique #${sNum}`,
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            `Rappeler les enjeux métiers spécifiques à ${topic}.`,
            `Engager l'auditoire en demandant un retour d'expérience vécu.`,
            `Faire le lien avec les objectifs globaux de l'organisation.`,
          ],
          oralScript: `Bonjour à tous. Abordons maintenant cette étape essentielle de notre module sur "${topic}". Gardez en tête que l'efficacité repose avant tout sur des habitudes simples répétées avec rigueur au quotidien.`,
          interactivePrompt: `Question pour le groupe : Quelle est votre plus grande difficulté rencontrée sur ce sujet lors du dernier trimestre ?`,
        },
      };
    } else {
      return {
        id: `s-${sNum}-${Date.now()}`,
        slideNumber: sNum,
        title:
          sNum === 1
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
        categoryBadge: sNum === 1 ? 'Foundations' : sNum === numSlides ? 'Summary' : 'Core Strategy',
        bullets: [
          `Identify primary risk drivers and critical indicators for ${topic}.`,
          `Deploy standardized workflows to mitigate operational pitfalls.`,
          `Empower cross-functional collaboration and accountability across remote teams.`,
          `Establish continuous feedback loops for sustainable adoption.`,
        ],
        visualConcept: {
          type: (sNum % 2 === 0 ? 'framework' : 'metric') as VisualConcept['type'],
          title: `Key Paradigm: ${topic}`,
          metric: sNum === 1 ? '85%' : sNum === 3 ? '4.2x' : undefined,
          metricLabel: sNum === 1 ? 'increase in team alignment and error reduction' : undefined,
          details: [
            'Core Pillar 1: Proactive risk detection & posture',
            'Core Pillar 2: Standardized playbooks & automation',
            'Core Pillar 3: Real-time monitoring & validation',
          ],
          badge: `Milestone #${sNum}`,
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            `Highlight the business ROI and risk mitigation of ${topic}.`,
            `Invite participants to share a recent friction point or challenge.`,
            `Connect theoretical concepts to immediate operational habits.`,
          ],
          oralScript: `Welcome everyone to this slide. When examining ${topic}, we must bridge high-level strategy with daily pragmatic habits. Let us review the foundational pillars on screen.`,
          interactivePrompt: `Prompt the audience: What is your primary obstacle when applying these rules in your workflow?`,
        },
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
          `Sử dụng các công cụ không được cấp phép để làm việc nhanh hơn`,
        ],
        correctOptionIndex: 1,
        explanation: `Sự cẩn trọng trong phương pháp và kiểm chứng thông tin đảm bảo tính an toàn và chuẩn mực trong vận hành doanh nghiệp.`,
        difficulty: 'Beginner' as const,
        hint: `Hãy chú trọng vào việc phòng ngừa rủi ro và tuân thủ hướng dẫn chuẩn.`,
      },
      {
        id: `q-2-${Date.now()}`,
        question: `Khi phát hiện dấu hiệu bất thường hoặc nguy cơ tiềm ẩn, bước xử lý chuẩn mực là gì?`,
        options: [
          `Giữ im lặng để không làm phiền đồng nghiệp xung quanh`,
          `Báo cáo ngay cho người phụ trách hoặc bộ phận chuyên trách để có hướng xử lý kịp thời`,
          `Khởi động lại máy tính với hy vọng sự cố sẽ tự biến mất`,
          `Chuyển tiếp thông tin nghi vấn cho toàn bộ công ty mà không cảnh báo`,
        ],
        correctOptionIndex: 1,
        explanation: `Báo cáo sớm giúp khoanh vùng và ngăn chặn rủi ro lây lan trước khi gây thiệt hại trên diện rộng.`,
        difficulty: 'Intermediate' as const,
        hint: `Truyền thông sớm và kịp thời là chìa khóa xử lý khủng hoảng.`,
      },
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
          `Utiliser des outils non homologués pour gagner du temps`,
        ],
        correctOptionIndex: 1,
        explanation: `La rigueur méthodologique et la vérification des sources garantissent la conformité et la sécurité opérationnelle.`,
        difficulty: 'Beginner' as const,
        hint: `Pensez à la prévention et au respect des consignes établies.`,
      },
      {
        id: `q-2-${Date.now()}`,
        question: `En cas d'anomalie ou d'incertitude lors de l'exécution, quelle est la démarche recommandée ?`,
        options: [
          `Cacher l'incident pour ne pas perturber l'équipe`,
          `Signaler immédiatement la situation au responsable ou au support dédié`,
          `Redémarrer le poste en espérant que le problème disparaisse`,
          `Transférer le message suspect à tous ses collègues sans avertissement`,
        ],
        correctOptionIndex: 1,
        explanation: `Un signalement rapide permet d'endiguer les risques avant qu'ils ne se propagent au reste de l'organisation.`,
        difficulty: 'Intermediate' as const,
        hint: `La communication précoce est toujours la clé.`,
      },
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
          `Disable monitoring logs`,
        ],
        correctOptionIndex: 1,
        explanation: `Structured guidelines and proactive hygiene prevent the majority of operational breakdowns.`,
        difficulty: 'Beginner' as const,
        hint: `Focus on prevention and structured best practices.`,
      },
      {
        id: `q-2-${Date.now()}`,
        question: `When detecting an anomaly or potential risk, what should you do first?`,
        options: [
          `Keep it private to avoid alarming management`,
          `Immediately isolate the system and report to the designated lead/SOC`,
          `Forward suspicious payloads to everyone on Slack`,
          `Wait 48 hours to see if it fixes itself`,
        ],
        correctOptionIndex: 1,
        explanation: `Immediate reporting enables the response team to contain potential threats quickly without compounding damage.`,
        difficulty: 'Intermediate' as const,
        hint: `Early escalation is the foundation of incident management.`,
      },
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
    estimatedDuration: numSlides * 8,
    themeId: (themeId as any) || 'indigo',
    slides,
    quiz,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate course directly with Google Gemini SDK in client/browser if apiKey is provided
 */
export async function generateCourseWithClientGemini(
  apiKey: string,
  params: {
    topic: string;
    audienceLevel?: string;
    slideCount?: number;
    language?: string;
    industry?: string;
    themeId?: string;
    model?: string;
  }
): Promise<CoursePayload> {
  const {
    topic,
    audienceLevel = 'Intermediate',
    slideCount = 5,
    language = 'Français',
    industry = 'Général',
    themeId = 'indigo',
    model = 'gemini-3.7-flash',
  } = params;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

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
      systemInstruction: `You are EduVibe AI, an expert corporate course designer. Always produce high quality instructional content in ${language}. Ensure tone is highly professional and actionable. Return valid JSON only.`,
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text || '{}';
  const cleanedText = cleanJsonText(rawText);
  const parsedData = JSON.parse(cleanedText);

  return {
    id: 'gen-' + Date.now(),
    title: parsedData.title || topic,
    tagline: parsedData.tagline || `Formation interactive sur ${topic}`,
    description: parsedData.description || `Module généré par IA pour niveau ${audienceLevel}`,
    topic,
    audienceLevel: audienceLevel as any,
    language,
    industry,
    estimatedDuration: parsedData.estimatedDuration || slideCount * 8,
    themeId: (themeId as any) || 'indigo',
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
}

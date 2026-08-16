import { CoursePayload, Slide, VisualConcept, CourseTheme, QuizQuestion } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Robust JSON parser with cleanup & automatic repair for truncated responses
 */
export function cleanJsonText(raw: string): string {
  if (!raw) return '{}';
  let cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return cleaned;
}

export function repairAndParseJson(raw: string): any {
  const cleaned = cleanJsonText(raw);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt automatic closure of truncated JSON
    let text = cleaned;
    let openBraces = (text.match(/\{/g) || []).length;
    let closeBraces = (text.match(/\}/g) || []).length;
    let openBrackets = (text.match(/\[/g) || []).length;
    let closeBrackets = (text.match(/\]/g) || []).length;

    // Cut trailing incomplete key-value
    text = text.replace(/,\s*"[^"]*":?\s*("[^"]*)?$/, '');
    text = text.replace(/,\s*$/, '');

    while (openBrackets > closeBrackets) {
      text += ']';
      closeBrackets++;
    }
    while (openBraces > closeBraces) {
      text += '}';
      closeBraces++;
    }

    try {
      return JSON.parse(text);
    } catch {
      throw err;
    }
  }
}

export interface CourseGeneratorOptions {
  topic: string;
  audienceLevel?: string;
  slideCount?: number;
  language?: string;
  industry?: string;
  themeId?: CourseTheme['id'];
  objective?: string;        // 'skills' | 'awareness' | 'leadership' | 'sales' | 'crisis'
  tone?: string;             // 'interactive' | 'executive' | 'operational' | 'educational'
  sessionFormat?: string;    // 'micro' | 'demo' | 'workshop' | 'intensive'
  customDirectives?: string; // free text specific user requirements
}

export const SLIDE_THEMATIC_IMAGES: { url: string; prompt: string }[] = [
  {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=80',
    prompt: 'Vision stratégique, cadrage exécutif et alignement des équipes dirigeantes',
  },
  {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&auto=format&fit=crop&q=80',
    prompt: 'Diagnostic des risques opérationnels, détection des pièges et cyber-bouclier',
  },
  {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=80',
    prompt: 'Architecture technique moderne et socle de systèmes interconnectés',
  },
  {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=80',
    prompt: 'Framework méthodologique standardisé et procédures SOPs opérationnelles',
  },
  {
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&auto=format&fit=crop&q=80',
    prompt: 'Checklist de validation qualité et protocole d’exécution terrain',
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop&q=80',
    prompt: 'Cellule de crise opérationnelle, gestion de l’incident et monitoring',
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80',
    prompt: 'Intelligence artificielle, automatisation des tâches et accélération technologique',
  },
  {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=80',
    prompt: 'Leadership d’influence, prise de parole inspirante et négociation',
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
    prompt: 'Tableau de bord des indicateurs KPIs et mesure du retour sur investissement (ROI)',
  },
  {
    url: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=900&auto=format&fit=crop&q=80',
    prompt: 'Plan d’action 30-60-90 jours et jalons de déploiement structurés',
  },
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80',
    prompt: 'Veille prospective, conformité réglementaire et innovation durable',
  },
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80',
    prompt: 'Validation des compétences, distinction officielle et certificat EduVibe AI',
  },
];

export function resolveThematicSlideImage(slideNumber: number): { url: string; prompt: string } {
  const index = Math.max(0, slideNumber - 1) % SLIDE_THEMATIC_IMAGES.length;
  return SLIDE_THEMATIC_IMAGES[index];
}

/**
 * Curriculum blueprint generator to give Gemini and fallback distinct themes per slide
 */
export function getCurriculumBlueprint(topic: string, count: number, industry: string, language: string = 'Français') {
  const isFrench = (language || '').toLowerCase().includes('fr');
  
  const blueprintsFR = [
    {
      theme: 'Cadrage & Enjeux Stratégiques',
      focus: `Pourquoi "${topic}" est un impératif vital pour la réussite et l'efficacité dans le secteur ${industry}.`,
    },
    {
      theme: 'Diagnostic des Risques & Pièges Courants',
      focus: `Disséquer les erreurs critiques les plus fréquentes commises sur "${topic}". Analyse des causes et solutions.`,
    },
    {
      theme: 'Concepts Fondamentaux & Architecture',
      focus: `Les principes théoriques et méthodologiques incontournables pour maîtriser "${topic}".`,
    },
    {
      theme: 'Framework Opérationnel en 3 Piliers',
      focus: `La méthode standardisée pas-à-pas (3P) pour appliquer "${topic}" avec rigueur.`,
    },
    {
      theme: 'Protocole d’Exécution & Checklist Terrain',
      focus: `Checklist quotidienne, points de validation obligatoires et réflexes clés pour "${topic}".`,
    },
    {
      theme: 'Étude de Cas Réelle & Scénario Immersif',
      focus: `Analyse détaillée d'un cas concret ou d'une situation terrain liée à "${topic}" dans le secteur ${industry}.`,
    },
    {
      theme: 'Outils Numériques, Automatisation & Accélération IA',
      focus: `Les solutions logicielles, prompts IA et méthodes modernes pour démultiplier les résultats sur "${topic}".`,
    },
    {
      theme: 'Communication d’Influence & Alignement',
      focus: `Comment valoriser ses résultats sur "${topic}", convaincre sa hiérarchie et fédérer ses pairs.`,
    },
    {
      theme: 'Indicateurs de Performance (KPIs) & Mesure du ROI',
      focus: `Tableau de bord de pilotage : métriques concrètes pour mesurer l'impact de "${topic}".`,
    },
    {
      theme: 'Plan d’Action 30-60-90 Jours & Feuille de Route',
      focus: `Jalons opérationnels pour ancrer durablement la maîtrise de "${topic}".`,
    },
    {
      theme: 'Veille Stratégique & Évolutions Futures',
      focus: `Anticiper les tendances futures et les nouvelles approches autour de "${topic}".`,
    },
    {
      theme: 'Bilan de Masterclass, Engagements & Certification',
      focus: `Synthèse exécutive, contrat d'engagement individuel et préparation à l'évaluation finale sur "${topic}".`,
    },
  ];

  const blueprintsEN = [
    {
      theme: 'Strategic Imperative & Industry Context',
      focus: `Why "${topic}" is critical to performance and growth in ${industry}.`,
    },
    {
      theme: 'Risk Diagnostic & Common Pitfalls',
      focus: `Deep analysis of the most frequent operational breakdowns associated with "${topic}".`,
    },
    {
      theme: 'Core Foundations & Architecture',
      focus: `Essential architectural principles and mechanisms required to master "${topic}".`,
    },
    {
      theme: '3-Pillar Operational Framework',
      focus: `Standardized operating procedures and step-by-step methodologies to execute "${topic}".`,
    },
    {
      theme: 'Execution Protocol & Field Checklist',
      focus: `Daily action checklist, mandatory quality gates, and best practices for "${topic}".`,
    },
    {
      theme: 'Real-World Case Study & Scenario Analysis',
      focus: `Comprehensive retrospective of a concrete case in ${industry} regarding "${topic}".`,
    },
    {
      theme: 'Tech Stack, Automation & AI Acceleration',
      focus: `Software tools, AI workflows, and automations to accelerate results on "${topic}".`,
    },
    {
      theme: 'Stakeholder Alignment & Influence Strategy',
      focus: `How to pitch and secure buy-in regarding "${topic}".`,
    },
    {
      theme: 'KPIs Dashboard & Quantitative Impact',
      focus: `Key metrics and leading indicators to track performance on "${topic}".`,
    },
    {
      theme: '30-60-90 Day Action Plan & Milestones',
      focus: `Tactical roadmap to transition learning into measurable daily habits on "${topic}".`,
    },
    {
      theme: 'Future Trends & Outlook',
      focus: `Anticipating upcoming innovations and shifts in "${topic}".`,
    },
    {
      theme: 'Mastery Synthesis & Official Certification',
      focus: `Executive summary, personal implementation commitment, and preparation for certification on "${topic}".`,
    },
  ];

  const source = isFrench ? blueprintsFR : blueprintsEN;
  return source.slice(0, count);
}

/**
 * Generate a 100% dynamic, topic-adaptive course for any user input
 */
export function generateSmartFallbackCourse(
  topic: string,
  audienceLevel: string = 'Intermediate',
  slideCount: number = 5,
  language: string = 'Français',
  industry: string = 'Général',
  themeId: string = 'indigo',
  objective: string = 'skills',
  tone: string = 'interactive',
  sessionFormat: string = 'workshop',
  customDirectives: string = ''
): CoursePayload {
  const numSlides = Math.min(Math.max(slideCount || 5, 3), 12);
  const cleanTopic = topic.trim() || 'Excellence Professionnelle';

  const slidesFR: Slide[] = [
    {
      id: `s-1-${Date.now()}`,
      slideNumber: 1,
      title: `1. Cadrage Stratégique : ${cleanTopic}`,
      subtitle: `Pourquoi maîtriser ce sujet transforme la performance dans le secteur ${industry}`,
      categoryBadge: 'Cadrage & Enjeux',
      bullets: [
        `Comprendre l'impact direct de "${cleanTopic}" sur l'efficacité collective et la réalisation des objectifs.`,
        `Identifier les signaux précurseurs d'opportunités ou de risques majeurs dans le secteur ${industry}.`,
        `Définir les critères de réussite quantitatifs et qualitatifs pour mesurer votre progression.`,
        `Aligner les pratiques individuelles avec les standards d'excellence du niveau ${audienceLevel}.`,
      ],
      visualConcept: {
        type: 'metric',
        title: `Impact Clé : ${cleanTopic}`,
        metric: '+85%',
        metricLabel: `de gain d'efficacité et d'alignement constaté chez les professionnels appliquant la méthode dès le premier mois.`,
        badge: 'Impact Mesuré',
        details: [
          `Priorité n°1 : Maîtrise des fondamentaux de ${cleanTopic}`,
          `Gain de temps moyen estimé : 4h par semaine`,
          `Sérénité d'équipe et clarté des livrables garanties`,
        ],
      },
      trainerNotes: {
        timeMinutes: 8,
        keyTalkingPoints: [
          `Accrocher l'auditoire en reliant directement "${cleanTopic}" à leurs défis quotidiens.`,
          `Demander à 2 participants d'exprimer leur attente principale sur cette formation.`,
          `Présenter la feuille de route structurée des ${numSlides} étapes.`,
        ],
        oralScript: `Bonjour à tous et bienvenue dans cette session dédiée à ${cleanTopic}. Nous allons aborder des méthodes claires, immédiatement applicables et calibrées pour votre niveau ${audienceLevel}. Vous repartirez avec des outils concrets dès aujourd'hui.`,
        interactivePrompt: `Tour de table : Quel est votre plus grand défi actuel concernant "${cleanTopic}" ?`,
      },
    },
    {
      id: `s-2-${Date.now()}`,
      slideNumber: 2,
      title: `2. Diagnostic & Pièges Courants : ${cleanTopic}`,
      subtitle: `Analyse comparative entre les mauvaises pratiques et la posture experte`,
      categoryBadge: 'Diagnostic & Pièges',
      bullets: [
        `Repérer les 3 erreurs les plus fréquentes commises par manque de méthode sur "${cleanTopic}".`,
        `Mesurer le coût caché de l'improvisation et des processus non structurés.`,
        `Remplacer les réactions d'urgence par des automatismes validés et sécurisés.`,
        `Instaurer une culture de feedback et d'amélioration continue au sein de l'équipe.`,
      ],
      visualConcept: {
        type: 'comparison',
        title: `Matrice des Pratiques : ${cleanTopic}`,
        badge: 'Comparatif',
        leftTitle: '❌ Pratiques à Risque',
        leftPoints: [
          `Improvisation sans méthode définie sur ${cleanTopic}`,
          `Manque de documentation et de traçabilité`,
          `Hypothèses non vérifiées auprès des pairs`,
        ],
        rightTitle: '✅ Posture d’Excellence',
        rightPoints: [
          `Application rigoureuse du protocole validé`,
          `Partage transparent des informations clés`,
          `Validation systématique et points de contrôle`,
        ],
        details: [`La standardisation élimine plus de 80% des erreurs récurrentes.`],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Faire réagir le groupe sur la colonne des erreurs fréquentes.`,
          `Démontrer qu'une méthode rigoureuse fait gagner du temps à tout le monde.`,
        ],
        oralScript: `Regardons les pièges classiques liés à ${cleanTopic}. Nous les avons tous observés. L'objectif est d'installer des garde-fous durables pour fiabiliser chaque action.`,
        interactivePrompt: `Question live : Lequel de ces pièges avez-vous déjà rencontré récemment ?`,
      },
    },
    {
      id: `s-3-${Date.now()}`,
      slideNumber: 3,
      title: `3. Principes Fondamentaux de ${cleanTopic}`,
      subtitle: `Le socle conceptuel indispensable pour maîtriser le sujet en profondeur`,
      categoryBadge: 'Fondamentaux',
      bullets: [
        `Assimiler les concepts clés et les mécanismes sous-jacents de "${cleanTopic}".`,
        `Cartographier les flux de travail et les interactions essentielles.`,
        `Définir les rôles, responsabilités et critères de décision pour chaque étape.`,
        `Garantir la cohérence entre la vision stratégique et l'exécution quotidienne.`,
      ],
      visualConcept: {
        type: 'framework',
        title: `Socle de Maîtrise : ${cleanTopic}`,
        badge: 'Architecture 3 Niveaux',
        details: [
          `Niveau 1 : Cadrage & Prérequis de ${cleanTopic}`,
          `Niveau 2 : Processus opérationnels & Outils`,
          `Niveau 3 : Mesure continue & Perfectionnement`,
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Expliquer la logique des 3 niveaux d'expertise.`,
          `Montrer que la théorie prend tout son sens lorsqu'elle est reliée aux outils réels.`,
        ],
        oralScript: `Pour bâtir des résultats solides, nous devons nous appuyer sur des fondations claires. Voici les 3 niveaux qui garantissent l'excellence sur ${cleanTopic}.`,
        interactivePrompt: `Sondage : Sur lequel de ces 3 niveaux vous sentez-vous le plus à l'aise aujourd'hui ?`,
      },
    },
    {
      id: `s-4-${Date.now()}`,
      slideNumber: 4,
      title: `4. Le Framework Opérationnel 3P appliqué à ${cleanTopic}`,
      subtitle: `La méthode standardisée pas-à-pas pour structurer chaque intervention`,
      categoryBadge: 'Méthodologie 3P',
      bullets: [
        `Pilier 1 - Préparation : Valider les objectifs et les ressources avant de démarrer.`,
        `Pilier 2 - Pratique : Dérouler les procédures standardisées avec points d'arrêt.`,
        `Pilier 3 - Perfectionnement : Analyser les résultats et capitaliser les acquis.`,
        `Intégrer des rituels réguliers pour maintenir un haut niveau d'exigence.`,
      ],
      visualConcept: {
        type: 'framework',
        title: `Déploiement du Modèle 3P`,
        badge: 'Framework SOP',
        details: [
          `1. Préparation : Définition des critères de succès pour ${cleanTopic}`,
          `2. Pratique : Exécution guidée avec checklist`,
          `3. Perfectionnement : Débriefing et mise à jour des standards`,
        ],
      },
      trainerNotes: {
        timeMinutes: 12,
        keyTalkingPoints: [
          `Faire mémoriser la règle des 3P à travers un exemple pratique.`,
        ],
        oralScript: `Voici la méthode clé de notre approche. Ce framework en 3 piliers est simple, mnémotechnique et garantit que rien n'est laissé au hasard sur ${cleanTopic}.`,
        interactivePrompt: `Mise en situation : Dans votre routine, quelle étape du 3P a tendance à être négligée ?`,
      },
    },
    {
      id: `s-5-${Date.now()}`,
      slideNumber: 5,
      title: `5. Protocole d’Exécution & Checklist Terrain : ${cleanTopic}`,
      subtitle: `Les points de validation obligatoires pour sécuriser chaque action`,
      categoryBadge: 'Protocole & Checklist',
      bullets: [
        `Établir une checklist chronologique pré-intervention pour "${cleanTopic}".`,
        `Formaliser les critères de validation avant de passer à l'étape suivante.`,
        `Mettre en place un système de double validation sur les étapes critiques.`,
        `Documenter les choix effectués pour faciliter la transmission aux équipes.`,
      ],
      visualConcept: {
        type: 'takeaway',
        title: `Checklist des 4 Contrôles Clés`,
        badge: 'Points de Validation',
        details: [
          `✓ Contrôle 1 : Clarté du livrable attendu sur ${cleanTopic}`,
          `✓ Contrôle 2 : Respect des standards et bonnes pratiques`,
          `✓ Contrôle 3 : Validation auprès des parties prenantes`,
          `✓ Contrôle 4 : Archivage et partage de la documentation`,
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Insister sur la puissance des checklists pour libérer la charge mentale.`,
        ],
        oralScript: `Sous la pression des délais, la checklist est votre meilleur allié. Elle garantit un niveau de qualité constant sur ${cleanTopic}.`,
        interactivePrompt: `Question : Utilisez-vous déjà une checklist formalisée dans votre équipe ?`,
      },
    },
    {
      id: `s-6-${Date.now()}`,
      slideNumber: 6,
      title: `6. Étude de Cas Réelle & Scénario Immersif : ${cleanTopic}`,
      subtitle: `Analyse détaillée d'une situation concrète dans le secteur ${industry}`,
      categoryBadge: 'Étude de Cas',
      bullets: [
        `Contexte : Une équipe confrontée à un défi opérationnel majeur sur "${cleanTopic}".`,
        `Phase 1 : Analyse rapide de la situation et cadrage des priorités.`,
        `Phase 2 : Déploiement des solutions méthodologiques et mobilisation des pairs.`,
        `Phase 3 : Résultats obtenus, mesure de l'impact et retours d'expérience partagés.`,
      ],
      visualConcept: {
        type: 'flow',
        title: `Chronologie de Résolution`,
        badge: 'Scénario Immersif',
        details: [
          `Étape 1 : Diagnostic initial & Identification des blocages`,
          `Étape 2 : Application du protocole ${cleanTopic}`,
          `Étape 3 : Mesure du succès et ancrage des acquis`,
        ],
      },
      trainerNotes: {
        timeMinutes: 15,
        keyTalkingPoints: [
          `Faire travailler les apprenants en binômes sur les choix clés à opérer.`,
        ],
        oralScript: `Analysons ce cas concret. Face à ce défi réel, comment appliqueriez-vous notre méthode pour résoudre la situation en un temps record ?`,
        interactivePrompt: `Défi collectif : Quelle aurait été votre toute première décision face à ce cas ?`,
      },
    },
    {
      id: `s-7-${Date.now()}`,
      slideNumber: 7,
      title: `7. Outils Numériques & Accélération IA : ${cleanTopic}`,
      subtitle: `Tirer parti de la technologie et de l'IA pour démultiplier vos résultats`,
      categoryBadge: 'Outils & IA',
      bullets: [
        `Identifier les tâches répétitives liées à "${cleanTopic}" éligibles à l'automatisation.`,
        `Utiliser des invites IA structurées (prompting avancé) pour générer des synthèses et analyses.`,
        `Sécuriser la confidentialité des données stratégiques de votre organisation.`,
        `Créer des modèles et gabarits partagés pour accélérer le travail de groupe.`,
      ],
      visualConcept: {
        type: 'framework',
        title: `Stack Technologique Optimisée`,
        badge: 'Accélération Tech',
        details: [
          `Outil 1 : Tableaux de bord et suivi d'activité pour ${cleanTopic}`,
          `Outil 2 : Assistants IA pour la génération de brouillons et rapports`,
          `Outil 3 : Espaces collaboratifs et partage de modèles`,
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Montrer des exemples de prompts IA concrets applicables à ${cleanTopic}.`,
        ],
        oralScript: `La technologie et l'IA sont des multiplicateurs de force formidables quand ils sont guidés par une méthode claire.`,
        interactivePrompt: `Question : Quel outil numérique vous fait gagner le plus de temps actuellement ?`,
      },
    },
    {
      id: `s-8-${Date.now()}`,
      slideNumber: 8,
      title: `8. Communication d’Influence & Alignement : ${cleanTopic}`,
      subtitle: `Savoir convaincre, valoriser ses réussites et fédérer ses collègues`,
      categoryBadge: 'Influence & Posture',
      bullets: [
        `Adapter son discours aux attentes des décideurs et des managers.`,
        `Structurer ses présentations avec la méthode "Problème - Solution - Résultats chiffrés".`,
        `Désamorcer les résistances par l'écoute active et des démonstrations concrètes.`,
        `Instaurer des points de synchronisation réguliers pour maintenir l'alignement.`,
      ],
      visualConcept: {
        type: 'comparison',
        title: `Posture de Communication`,
        badge: 'Impact Exécutif',
        leftTitle: 'Communication Classique',
        leftPoints: [`Détails trop techniques`, `Absence de lien avec les gains métier`, `Difficulté à emporter l'adhésion`],
        rightTitle: 'Communication d’Impact',
        rightPoints: [`Orientée valeur et résultats sur ${cleanTopic}`, `Mise en avant des bénéfices équipe`, `Plan d'action clair et chiffré`],
        details: [`La clarté du message conditionne 80% du succès du projet.`],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Faire un jeu de rôle flash : 'Pitcher la valeur de votre projet en 60 secondes'.`,
        ],
        oralScript: `Avoir la bonne méthode ne suffit pas : il faut savoir valoriser ses réalisations auprès de ses parties prenantes.`,
        interactivePrompt: `Exercice : Comment résumeriez-vous en une phrase l'importance de "${cleanTopic}" pour votre manager ?`,
      },
    },
    {
      id: `s-9-${Date.now()}`,
      slideNumber: 9,
      title: `9. Indicateurs KPIs & Mesure du Succès : ${cleanTopic}`,
      subtitle: `Piloter vos progrès par la donnée et démontrer la valeur créée`,
      categoryBadge: 'KPIs & Mesure',
      bullets: [
        `Sélectionner 3 à 4 métriques clés directement liées à "${cleanTopic}".`,
        `Mettre en place un tableau de bord visuel simple et mis à jour régulièrement.`,
        `Analyser les écarts chaque mois pour ajuster les priorités.`,
        `Valoriser les gains de productivité et la qualité des livrables lors des bilans.`,
      ],
      visualConcept: {
        type: 'metric',
        title: `Métriques Cibles : ${cleanTopic}`,
        metric: '+45%',
        metricLabel: `d'amélioration globale de la vélocité et de la qualité constatée chez les équipes pilotes.`,
        badge: 'ROI Mesuré',
        details: [
          `KPI 1 : Taux d'application des standards (>95%)`,
          `KPI 2 : Réduction des délais d'exécution (-40%)`,
          `KPI 3 : Satisfaction des équipes et parties prenantes (NPS > 60)`,
        ],
      },
      trainerNotes: {
        timeMinutes: 12,
        keyTalkingPoints: [
          `Rappeler la règle : 'Ce qui se mesure s'améliore'.`,
        ],
        oralScript: `Choisissons les indicateurs qui reflètent la vraie santé de vos projets sur ${cleanTopic} sans surcharger votre quotidien.`,
        interactivePrompt: `Question : Quel est le KPI prioritaire que vous voulez voir progresser ce trimestre ?`,
      },
    },
    {
      id: `s-10-${Date.now()}`,
      slideNumber: 10,
      title: `10. Plan d’Action 30-60-90 Jours : ${cleanTopic}`,
      subtitle: `Feuille de route pour ancrer durablement les compétences acquises`,
      categoryBadge: 'Plan 30-60-90',
      bullets: [
        `Jours 1 à 30 (Socle) : Audit des habitudes actuelles, adoption des checklists et premiers quick wins.`,
        `Jours 31 à 60 (Consolidation) : Ateliers d'échange, partage d'expériences et montée en compétences.`,
        `Jours 61 à 90 (Excellence) : Bilan des indicateurs KPIs, ajustements et autonomie complète sur "${cleanTopic}".`,
        `Planifier des revues trimestrielles pour maintenir le niveau d'excellence dans le temps.`,
      ],
      visualConcept: {
        type: 'flow',
        title: `Feuille de Route Trimestrielle`,
        badge: 'Jalons Clés',
        details: [
          `J+30 : Cadrage des pratiques et premières réussites`,
          `J+60 : Généralisation des protocoles sur ${cleanTopic}`,
          `J+90 : Évaluation des KPIs et certification interne`,
        ],
      },
      trainerNotes: {
        timeMinutes: 12,
        keyTalkingPoints: [
          `Engager chaque participant sur une première action concrète dès demain matin.`,
        ],
        oralScript: `Une formation prend tout son sens dans les actions menées dès votre retour au poste. Choisissez UNE priorité de ce plan à démarrer dès cette semaine.`,
        interactivePrompt: `Engagement : Quel premier changement allez-vous initier dès demain sur "${cleanTopic}" ?`,
      },
    },
    {
      id: `s-11-${Date.now()}`,
      slideNumber: 11,
      title: `11. Veille & Évolution Continue sur ${cleanTopic}`,
      subtitle: `Anticiper les ruptures et maintenir une longueur d'avance`,
      categoryBadge: 'Veille & Prospective',
      bullets: [
        `Organiser une veille active sur les nouvelles tendances et méthodologies liées à "${cleanTopic}".`,
        `Expérimenter de nouvelles approches dans un cadre sécurisé.`,
        `Partager régulièrement ses découvertes et bonnes pratiques avec ses collègues.`,
        `Actualiser ses compétences au minimum une fois par an.`,
      ],
      visualConcept: {
        type: 'takeaway',
        title: `Principes de Veille Continue`,
        badge: 'Anticipation',
        details: [
          `30 minutes par semaine dédiées à la veille sur ${cleanTopic}`,
          `Tester 1 nouvelle pratique chaque trimestre`,
          `Partager ses apprentissages avec l'ensemble de l'équipe`,
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Donner des sources fiables de veille dans le domaine.`,
        ],
        oralScript: `Le monde professionnel bouge vite. La vraie compétence durable, c'est votre capacité à apprendre et à vous adapter en continu sur ${cleanTopic}.`,
        interactivePrompt: `Question : Quelle tendance récente surveillez-vous avec le plus d'attention ?`,
      },
    },
    {
      id: `s-12-${Date.now()}`,
      slideNumber: 12,
      title: `12. Bilan de Masterclass & Certification : ${cleanTopic}`,
      subtitle: `Validation finale des acquis et remise du certificat officiel`,
      categoryBadge: 'Bilan & Certification',
      bullets: [
        `Synthèse des méthodologies clés et compétences validées tout au long de la formation.`,
        `Passage du quiz officiel d'évaluation pour décrocher le certificat accrédité EduVibe AI.`,
        `Signature de votre contrat individuel d'engagement opérationnel sur "${cleanTopic}".`,
        `Accès permanent aux guides, checklists et à la communauté d'apprenants certifiés.`,
      ],
      visualConcept: {
        type: 'metric',
        title: `Objectif de Réussite & Certification`,
        metric: '100%',
        metricLabel: `des participants certifiés disposent d'une feuille de route opérationnelle claire.`,
        badge: 'Accréditation',
        details: [
          `Certificat officiel vérifié par EduVibe AI`,
          `Checklists et playbooks téléchargeables pour ${cleanTopic}`,
          `Accompagnement continu et suivi des compétences`,
        ],
      },
      trainerNotes: {
        timeMinutes: 15,
        keyTalkingPoints: [
          `Féliciter solennellement chaque participant pour son implication.`,
          `Lancer la session de quiz final.`,
        ],
        oralScript: `Bravo à toutes et à tous pour votre investissement remarquable tout au long de cette masterclass sur ${cleanTopic}. Vous avez toutes les cartes en main. Place maintenant à l'évaluation pour décrocher votre certificat officiel !`,
        interactivePrompt: `Mot de fin : En un seul mot, comment qualifiez-vous votre état d'esprit aujourd'hui ?`,
      },
    },
  ];

  const selectedSlides: Slide[] = slidesFR.slice(0, numSlides).map((s, idx) => {
    const sNum = idx + 1;
    const img = resolveThematicSlideImage(sNum);
    return {
      ...s,
      id: `slide-${sNum}-${Date.now()}`,
      slideNumber: sNum,
      imageUrl: img.url,
      imagePrompt: img.prompt,
    };
  });

  const quiz: QuizQuestion[] = [
    {
      id: `q-1-${Date.now()}`,
      question: `Quelle est la première étape indispensable pour réussir la mise en œuvre de "${cleanTopic}" ?`,
      options: [
        `Improviser sans cadrage pour aller plus vite`,
        `Définir des objectifs clairs et appliquer un protocole standardisé dès le départ`,
        `Attendre la fin de l'année pour évaluer la situation`,
        `Déléguer l'ensemble des tâches sans suivi`,
      ],
      correctOptionIndex: 1,
      explanation: `Un cadrage rigoureux et l'application d'un protocole standardisé sont le fondement de toute réussite opérationnelle durable.`,
      difficulty: 'Intermediate',
      hint: `Pensez à l'importance de la préparation et des objectifs mesurables.`,
    },
    {
      id: `q-2-${Date.now()}`,
      question: `Pourquoi l'utilisation de checklists opérationnelles est-elle particulièrement efficace pour "${cleanTopic}" ?`,
      options: [
        `Elle sert uniquement à ajouter de la bureaucratie`,
        `Elle libère la charge mentale, élimine les oublis sous pression et garantit un standard de qualité élevé`,
        `Elle remplace complètement l'expérience humaine`,
        `Elle ralentit les projets sans apporter de valeur`,
      ],
      correctOptionIndex: 1,
      explanation: `Les checklists fiabilisent les interventions en externalisant la mémoire de travail et en éliminant les erreurs d'inattention sous stress.`,
      difficulty: 'Beginner',
      hint: `Pensez aux pilotes d'avion ou aux chirurgiens qui utilisent systématiquement des checklists.`,
    },
    {
      id: `q-3-${Date.now()}`,
      question: `Dans le cadre du Framework 3P appliqué à "${cleanTopic}", à quoi sert l'étape de Perfectionnement ?`,
      options: [
        `À classer le dossier sans analyser les résultats`,
        `À analyser les écarts, tirer des enseignements et mettre à jour les guides pour l'équipe`,
        `À blâmer publiquement les collaborateurs pour les erreurs`,
        `À recommencer tout le travail depuis le début`,
      ],
      correctOptionIndex: 1,
      explanation: `Le perfectionnement par le feedback constructif transforme l'expérience en protection et progrès collectif pour l'avenir.`,
      difficulty: 'Advanced',
      hint: `L'amélioration continue repose sur la capitalisation des enseignements.`,
    },
    {
      id: `q-4-${Date.now()}`,
      question: `Quel indicateur (KPI) reflète le mieux la progression réelle et durable sur "${cleanTopic}" ?`,
      options: [
        `Le nombre total d'emails envoyés dans la journée`,
        `Le taux d'application des bonnes pratiques, la réduction des délais et la satisfaction des équipes`,
        `Le temps passé assis devant son écran`,
        `L'absence de toute question posée`,
      ],
      correctOptionIndex: 1,
      explanation: `Les indicateurs de conformité, de rapidité et d'engagement mesurent la vraie maturité de la pratique.`,
      difficulty: 'Intermediate',
      hint: `Recherchez les indicateurs mesurant la qualité réelle et l'impact opérationnel.`,
    },
  ];

  return {
    id: `course-${Date.now()}`,
    title: `Masterclass : ${cleanTopic}`,
    tagline: `Maîtriser les fondamentaux, éviter les pièges et déployer les meilleures pratiques terrain (${audienceLevel})`,
    description: `Programme intensif de ${numSlides} modules conçu pour le niveau ${audienceLevel} dans le secteur ${industry}.`,
    topic: cleanTopic,
    audienceLevel: audienceLevel as any,
    language,
    industry,
    estimatedDuration: numSlides * 8,
    themeId: (themeId as any) || 'indigo',
    slides: selectedSlides,
    quiz,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate course directly with Google Gemini SDK in client/browser with multi-model fallback & repair
 */
export async function generateCourseWithClientGemini(
  apiKey: string,
  params: CourseGeneratorOptions & { model?: string }
): Promise<CoursePayload> {
  const {
    topic,
    audienceLevel = 'Intermediate',
    slideCount = 5,
    language = 'Français',
    industry = 'Général',
    themeId = 'indigo',
    objective = 'skills',
    tone = 'interactive',
    sessionFormat = 'workshop',
    customDirectives = '',
  } = params;

  const targetCount = Math.min(Math.max(slideCount || 5, 3), 12);
  const blueprints = getCurriculumBlueprint(topic, targetCount, industry, language);

  const blueprintInstruction = blueprints
    .map((b, idx) => `Slide ${idx + 1}: Theme = "${b.theme}" | Specific Focus = ${b.focus}`)
    .join('\n');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `You are a world-class executive corporate instructional designer and master trainer.
Generate an interactive, high-impact training module on "${topic}".

Parameters:
- Target Language: ${language}
- Audience Level: ${audienceLevel} (Beginner, Intermediate, or Advanced)
- MANDATORY Slide Count: EXACTLY ${targetCount} slides (1 to ${targetCount}).
- Target Industry: ${industry}
- Pedagogical Objective: ${objective}
- Tone & Delivery: ${tone}
- Session Format: ${sessionFormat}
${customDirectives ? `- Client Custom Directives: "${customDirectives}"` : ''}

MANDATORY CURRICULUM BLUEPRINT (Each slide must focus on this specific theme):
${blueprintInstruction}

Return STRICT JSON adhering to this schema:
{
  "title": string,
  "tagline": string,
  "description": string,
  "estimatedDuration": number,
  "slides": [
    {
      "slideNumber": number,
      "title": string,
      "subtitle": string,
      "categoryBadge": string,
      "imagePrompt": string,
      "bullets": [string, string, string, string],
      "visualConcept": {
        "type": "metric" | "framework" | "comparison" | "flow" | "takeaway",
        "title": string,
        "badge": string,
        "details": [string, string, string],
        "metric": string (optional),
        "metricLabel": string (optional),
        "leftTitle": string (optional),
        "leftPoints": [string] (optional),
        "rightTitle": string (optional),
        "rightPoints": [string] (optional)
      },
      "trainerNotes": {
        "timeMinutes": number,
        "keyTalkingPoints": [string, string, string],
        "oralScript": string,
        "interactivePrompt": string
      }
    }
  ],
  "quiz": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctOptionIndex": number,
      "explanation": string,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "hint": string
    }
  ]
}`;

  // Multi-model candidate cascade
  const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.7-flash'];
  let parsedData: any = null;
  let lastErr: any = null;

  for (const candidate of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: candidate,
        contents: prompt,
        config: {
          systemInstruction: `You are EduVibe AI, an elite corporate course designer. Always produce high quality instructional content in ${language}. Ensure tone is highly professional, engaging, and actionable. Return valid JSON only.`,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      });

      const rawText = response.text || '{}';
      parsedData = repairAndParseJson(rawText);
      if (parsedData && Array.isArray(parsedData.slides) && parsedData.slides.length > 0) {
        break;
      }
    } catch (e) {
      lastErr = e;
      console.warn(`Model ${candidate} failed, trying next candidate...`, e);
    }
  }

  if (!parsedData || !Array.isArray(parsedData.slides) || parsedData.slides.length === 0) {
    throw lastErr || new Error('All Gemini model candidates failed to generate valid course content.');
  }

  let rawSlides: any[] = parsedData.slides;

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

  // Ensure exact slide numbers, non-empty bullets & rich thematic image
  const formattedSlides: Slide[] = rawSlides.slice(0, targetCount).map((s: any, idx: number) => {
    const sNum = idx + 1;
    const defaultImg = resolveThematicSlideImage(sNum);
    const safeBullets = Array.isArray(s.bullets)
      ? s.bullets
      : Array.isArray(s.bulletPoints)
      ? s.bulletPoints
      : Array.isArray(s.points)
      ? s.points
      : typeof s.bullets === 'string'
      ? [s.bullets]
      : [
          `Maîtriser les principes fondamentaux de ${topic}`,
          `Appliquer la méthode opérationnelle avec rigueur`,
          `Mesurer les résultats et valider les acquis`,
        ];

    return {
      ...s,
      id: `slide-${sNum}-${Date.now()}`,
      slideNumber: sNum,
      title: s.title || `Diapositive ${sNum} : ${topic}`,
      subtitle: s.subtitle || `Guide pratique et mise en œuvre pour le niveau ${audienceLevel}`,
      categoryBadge: s.categoryBadge || `Module ${sNum}`,
      bullets: safeBullets,
      imageUrl: s.imageUrl || defaultImg.url,
      imagePrompt: s.imagePrompt || defaultImg.prompt,
      visualConcept: s.visualConcept || {
        type: 'takeaway',
        title: s.title || topic,
        badge: s.categoryBadge || 'Point Clé',
        details: safeBullets.slice(0, 3),
      },
      trainerNotes: s.trainerNotes || {
        timeMinutes: 8,
        keyTalkingPoints: safeBullets.slice(0, 2),
        oralScript: `Dans cette diapositive consacrée à ${s.title || topic}, nous abordons les leviers essentiels pour votre niveau ${audienceLevel}.`,
        interactivePrompt: `Tour de table : Quelle est votre réaction sur ce point ?`,
      },
    };
  });

  return {
    id: 'gen-' + Date.now(),
    title: parsedData.title || topic,
    tagline: parsedData.tagline || `Formation interactive sur ${topic}`,
    description: parsedData.description || `Module généré par IA (${targetCount} diapositives) pour niveau ${audienceLevel}`,
    topic,
    audienceLevel: audienceLevel as any,
    language,
    industry,
    estimatedDuration: parsedData.estimatedDuration || targetCount * 8,
    themeId: (themeId as any) || 'indigo',
    createdAt: new Date().toISOString(),
    slides: formattedSlides,
    quiz: (parsedData.quiz && parsedData.quiz.length > 0 ? parsedData.quiz : []).map((q: any, idx: number) => ({
      ...q,
      id: `quiz-${idx + 1}-${Date.now()}`,
    })),
  };
}

import { CoursePayload, Slide, VisualConcept, CourseTheme, QuizQuestion } from '../types';
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

/**
 * Curriculum blueprint generator to give Gemini and fallback distinct themes per slide
 */
export function getCurriculumBlueprint(topic: string, count: number, industry: string, language: string = 'Français') {
  const isFrench = (language || '').toLowerCase().includes('fr');
  
  const blueprintsFR = [
    {
      theme: 'Cadrage & Enjeux Stratégiques',
      focus: `Pourquoi "${topic}" est un impératif vital pour la rentabilité, la sécurité et la conformité dans le secteur ${industry}. Chiffres clés et contexte de marché.`,
    },
    {
      theme: 'Diagnostic des Vulnérabilités & Anti-Patterns',
      focus: `Disséquer les 4 erreurs critiques les plus fréquentes commises par les équipes sur "${topic}". Analyse des causes racines et des coûts cachés.`,
    },
    {
      theme: 'Concepts Fondamentaux & Architecture Cible',
      focus: `Les principes théoriques et techniques incontournables pour maîtriser "${topic}". Cartographie des flux et mécanismes clés.`,
    },
    {
      theme: 'Framework Opérationnel en 3 Piliers',
      focus: `La méthode standardisée (SOPs) pas-à-pas pour implémenter "${topic}" avec rigueur et contrôle continu.`,
    },
    {
      theme: 'Protocole d’Exécution & Checklist Terrain',
      focus: `Checklist opérationnelle quotidienne, points de validation obligatoires et réflexes réflexes à adopter face à l'imprévu.`,
    },
    {
      theme: 'Étude de Cas Réelle & Scénario Immersif',
      focus: `Analyse détaillée d'un cas réel ou d'une crise résolue dans le secteur ${industry} liée à "${topic}". Chronologie des décisions et enseignements.`,
    },
    {
      theme: 'Outils Numériques, Automatisation & Accélération IA',
      focus: `Les solutions logicielles, prompts IA et automatisations concrètes pour démultiplier l'efficacité sur "${topic}".`,
    },
    {
      theme: 'Communication d’Influence & Alignement Hiérarchique',
      focus: `Comment pitcher et valoriser les résultats de "${topic}" auprès de la direction générale et désamorcer les résistances au changement.`,
    },
    {
      theme: 'Indicateurs de Performance (KPIs) & Mesure du ROI',
      focus: `Tableau de bord de pilotage : 4 métriques précises pour mesurer l'impact financier et qualitatif de "${topic}".`,
    },
    {
      theme: 'Plan d’Action 30-60-90 Jours & Feuille de Route',
      focus: `Jalons opérationnels concrets pour ancrer les compétences dans la durée et désigner les référents d'équipe.`,
    },
    {
      theme: 'Veille Stratégique & Évolutions Réglementaires',
      focus: `Anticiper les tendances futures, les nouvelles normes et les ruptures technologiques à venir autour de "${topic}".`,
    },
    {
      theme: 'Bilan de Masterclass, Engagements & Certification',
      focus: `Synthèse exécutive des acquis, contrat d'engagement individuel et préparation à l'évaluation officielle finale.`,
    },
  ];

  const blueprintsEN = [
    {
      theme: 'Strategic Imperative & Industry Context',
      focus: `Why "${topic}" is critical to profitability, risk mitigation, and compliance in ${industry}. Key benchmark metrics.`,
    },
    {
      theme: 'Vulnerability Diagnostic & Common Pitfalls',
      focus: `Deep analysis of the top 4 frequent operational breakdowns and hidden costs associated with "${topic}".`,
    },
    {
      theme: 'Core Theoretical Foundations & Architecture',
      focus: `Essential architectural principles and functional mechanisms required to master "${topic}".`,
    },
    {
      theme: '3-Pillar Operational Framework',
      focus: `Standardized operating procedures (SOPs) and step-by-step methodologies to execute "${topic}".`,
    },
    {
      theme: 'Execution Protocol & Field Checklist',
      focus: `Daily action checklist, mandatory quality gates, and risk response reflexes.`,
    },
    {
      theme: 'Real-World Case Study & Incident Analysis',
      focus: `Comprehensive retrospective of a critical scenario in ${industry} and key operational takeaways.`,
    },
    {
      theme: 'Tech Stack, Automation & AI Acceleration',
      focus: `Specific software tools, AI prompts, and workflow automations to accelerate results on "${topic}".`,
    },
    {
      theme: 'Stakeholder Alignment & Influence Strategy',
      focus: `How to secure executive buy-in and overcome team resistance regarding "${topic}".`,
    },
    {
      theme: 'KPIs Dashboard & Quantitative ROI',
      focus: `4 concrete metrics and leading indicators to track financial and operational performance.`,
    },
    {
      theme: '30-60-90 Day Action Plan & Milestones',
      focus: `Tactical roadmap to transition learning into measurable daily habits and team standards.`,
    },
    {
      theme: 'Future Trends & Regulatory Outlook',
      focus: `Anticipating upcoming regulatory changes, disruptive innovations, and industry shifts in "${topic}".`,
    },
    {
      theme: 'Mastery Synthesis & Official Certification',
      focus: `Executive summary, personal implementation commitment, and preparation for the final certification exam.`,
    },
  ];

  const source = isFrench ? blueprintsFR : blueprintsEN;
  return source.slice(0, count);
}

/**
 * Generate a rich, diverse fallback course matching the exact slideCount requested (3 to 12)
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
  const langLower = (language || '').toLowerCase();
  const isVietnamese = langLower.includes('vi') || langLower.includes('tiếng việt') || langLower.includes('vietnamese');
  const isFrench = langLower.includes('fr') || langLower.includes('français') || langLower.includes('french');

  const numSlides = Math.min(Math.max(slideCount || 5, 3), 12);

  let title = `Executive Masterclass: ${topic}`;
  let tagline = `Operational Excellence, Strategic Frameworks & Practical Implementation (${audienceLevel})`;
  let description = `Comprehensive high-impact training program tailored for ${audienceLevel} professionals in ${industry}.`;

  if (isVietnamese) {
    title = `Chuyên Đề Huấn Luyện Thực Chiến: ${topic}`;
    tagline = `Nắm vững nguyên lý cốt lõi, quy trình chuẩn hóa và năng lực thực thi (${audienceLevel})`;
    description = `Chương trình đào tạo chuyên sâu cấp độ ${audienceLevel} trong lĩnh vực ${industry}.`;
  } else if (isFrench) {
    title = `Masterclass & Atelier Opérationnel : ${topic}`;
    tagline = `Maîtriser les fondamentaux, éviter les pièges et déployer les meilleures pratiques terrain (${audienceLevel})`;
    description = `Programme de formation intensif et opérationnel de ${numSlides} modules conçu pour le niveau ${audienceLevel} dans le secteur ${industry}.`;
  }

  // 12 distinct rich slide definitions in French
  const fullTemplatesFR: Slide[] = [
    {
      id: `s-1-${Date.now()}`,
      slideNumber: 1,
      title: `1. Cadrage Stratégique & Enjeux Clés : ${topic}`,
      subtitle: `Pourquoi ce sujet est critique pour la performance, la sécurité et la rentabilité`,
      categoryBadge: 'Cadrage Stratégique',
      bullets: [
        `Comprendre l'impact direct de ${topic} sur la compétitivité et la réduction des risques dans le secteur ${industry}.`,
        `Identifier les signaux faibles précurseurs d'incidents majeurs au sein des équipes.`,
        `Aligner les standards de travail individuels avec les exigences réglementaires et de conformité.`,
        `Fixer des objectifs de progression clairs et mesurables dès le démarrage de la formation.`,
      ],
      visualConcept: {
        type: 'metric',
        title: 'Chiffre Clé & Mesure d’Impact',
        metric: '78%',
        metricLabel: 'des défaillances opérationnelles sont évitées par la stricte application des bons réflexes dès les premiers jours.',
        badge: 'Impact Mesuré',
        details: [
          'Facteur humain : levier n°1 de sécurisation',
          'Gain de temps moyen : jusqu’à 4h par semaine et par collaborateur',
          'Sérénité d’équipe et conformité réglementaire garanties',
        ],
      },
      trainerNotes: {
        timeMinutes: 8,
        keyTalkingPoints: [
          `Capter l'attention dès les 30 premières secondes avec un chiffre fort.`,
          `Inviter 2 participants à verbaliser leur principal point de friction actuel sur ${topic}.`,
          `Présenter clairement le fil conducteur des ${numSlides} étapes de la session.`,
        ],
        oralScript: `Bonjour à tous et bienvenue dans cette session dédiée à ${topic}. Nous allons dépasser les généralités théoriques pour vous transmettre une méthode concrète, éprouvée et immédiatement applicable dès demain dans votre quotidien professionnel.`,
        interactivePrompt: `Tour de table flash : Sur une échelle de 1 à 10, quel est votre niveau d'aisance actuel sur ce sujet ?`,
      },
    },
    {
      id: `s-2-${Date.now()}`,
      slideNumber: 2,
      title: `2. Diagnostic des Vulnérabilités & Pièges Fréquents`,
      subtitle: `Analyse comparative entre les mauvaises pratiques courantes et la posture experte`,
      categoryBadge: 'Diagnostic & Pièges',
      bullets: [
        `Disséquer les raccourcis dangereux souvent pris sous la pression des délais.`,
        `Identifier les angles morts spécifiques au secteur ${industry} et leur coût financier caché.`,
        `Remplacer les réactions d'urgence non cadrées par des réflexes standardisés.`,
        `Instaurer une culture de signalement précoce sans culpabilisation.`,
      ],
      visualConcept: {
        type: 'comparison',
        title: 'Matrice Avant / Après',
        badge: 'Analyse Critique',
        leftTitle: '❌ Pratiques à Risque',
        leftPoints: [
          'Improvisation sous stress et contournement des règles',
          'Rétention d’information et absence de traçabilité',
          'Hypothèses non vérifiées auprès des référents',
        ],
        rightTitle: '✅ Posture d’Excellence',
        rightPoints: [
          'Application systématique de la checklist de sécurité',
          'Communication transparente et journalisation des actions',
          'Validation croisée et points d’arrêt formels',
        ],
        details: ['La standardisation réduit de plus de 85% le taux d’erreur humaine.'],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Faire réagir le groupe sur la colonne des erreurs fréquentes pour libérer la parole.`,
          `Démontrer qu'un raccourci de 5 minutes génère souvent des heures de rattrapage d'erreur.`,
        ],
        oralScript: `Analysons ensemble ces erreurs classiques. Nous les avons tous déjà observées. Notre objectif est de comprendre le contexte sous-jacent pour mettre en place des garde-fous collectifs efficaces.`,
        interactivePrompt: `Question live : Lequel de ces pièges avez-vous le plus souvent rencontré dans votre environnement de travail ?`,
      },
    },
    {
      id: `s-3-${Date.now()}`,
      slideNumber: 3,
      title: `3. Principes Fondamentaux & Architecture Cible`,
      subtitle: `Les mécanismes sous-jacents indispensables pour maîtriser durablement le sujet`,
      categoryBadge: 'Architecture & Fondamentaux',
      bullets: [
        `Cartographier les composants essentiels et les interactions du système.`,
        `Définir les rôles, responsabilités et matrices de décision (RACI).`,
        `Intégrer le principe de défense en profondeur et de redondance.`,
        `Garantir la cohérence technique et métier à chaque étape du flux.`,
      ],
      visualConcept: {
        type: 'framework',
        title: 'Socle d’Architecture',
        badge: 'Modèle Conceptuel',
        details: [
          'Niveau 1 - Gouvernance & Politiques d’accès',
          'Niveau 2 - Processus opérationnels & Garde-fous',
          'Niveau 3 - Contrôle continu & Journalisation',
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Expliquer la logique des 3 niveaux de protection.`,
          `Insister sur le fait que la gouvernance sans exécution opérationnelle reste stérile.`,
        ],
        oralScript: `Pour construire des solutions solides, nous devons nous appuyer sur une architecture claire. Voyons ensemble comment s'articulent ces trois niveaux fondamentaux.`,
        interactivePrompt: `Sondage rapide : Lequel de ces 3 niveaux vous semble le plus fragile dans vos opérations actuelles ?`,
      },
    },
    {
      id: `s-4-${Date.now()}`,
      slideNumber: 4,
      title: `4. Le Framework Opérationnel en 3 Piliers`,
      subtitle: `La méthode standardisée (SOPs) pas-à-pas pour structurer chaque intervention`,
      categoryBadge: 'Méthodologie 3P',
      bullets: [
        `Pilier 1 - Prévention & Cadrage : Vérifier les prérequis avant toute action critique.`,
        `Pilier 2 - Exécution & Contrôle : Dérouler les procédures standardisées avec points d’arrêt.`,
        `Pilier 3 - Rétroaction & Amélioration : Documenter l’incident et capitaliser pour l'équipe.`,
        `Intégrer des rituels réguliers pour maintenir le niveau d’exigence dans la durée.`,
      ],
      visualConcept: {
        type: 'framework',
        title: 'Déploiement du Modèle 3P',
        badge: 'Framework SOP',
        details: [
          '1. Cadrage : Validation des conditions de sécurité',
          '2. Exécution : Respect des protocoles et double validation',
          '3. Rétroaction : Débriefing à chaud et mise à jour des guides',
        ],
      },
      trainerNotes: {
        timeMinutes: 12,
        keyTalkingPoints: [
          `Faire mémoriser la règle des 3P à travers un cas simple.`,
          `Montrer comment cette méthode s'applique aussi bien en routine qu'en situation de crise.`,
        ],
        oralScript: `Voici la colonne vertébrale de notre approche. Ce framework en 3 piliers est simple, mnémotechnique, et protège vos projets de tout dérapage opérationnel.`,
        interactivePrompt: `Mise en situation : Dans votre équipe, quelle étape du 3P est actuellement la moins documentée ?`,
      },
    },
    {
      id: `s-5-${Date.now()}`,
      slideNumber: 5,
      title: `5. Protocole d’Exécution & Checklist Terrain`,
      subtitle: `Les points de validation obligatoires pour sécuriser les flux de travail quotidiens`,
      categoryBadge: 'Protocole & Checklist',
      bullets: [
        `Établir une checklist chronologique pré-intervention non négociable.`,
        `Formaliser les critères de 'Go / No-Go' avant le lancement d'une opération sensible.`,
        `Mettre en place un système de double regard sur les configurations à fort impact.`,
        `Archiver les preuves de conformité pour simplifier les audits futurs.`,
      ],
      visualConcept: {
        type: 'takeaway',
        title: 'Checklist des 4 Contrôles Clés',
        badge: 'Points de Contrôle',
        details: [
          '✓ Contrôle 1 : Identité et habilitation des intervenants',
          '✓ Contrôle 2 : Sauvegarde et plan de retour arrière validé',
          '✓ Contrôle 3 : Monitoring activé et seuils d’alerte vérifiés',
          '✓ Contrôle 4 : Validation formelle du commanditaire',
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Rappeler que les checklists sauvent des vies en aviation et en médecine, et qu'elles sont tout aussi vitales en entreprise.`,
        ],
        oralScript: `Ne faites jamais confiance à la seule mémoire sous la pression du temps. Cette checklist est votre bouclier opérationnel.`,
        interactivePrompt: `Question : Avez-vous déjà dû annuler une opération faute de plan de retour arrière ?`,
      },
    },
    {
      id: `s-6-${Date.now()}`,
      slideNumber: 6,
      title: `6. Étude de Cas Réelle & Scénario Immersif`,
      subtitle: `Analyse d’un incident majeur résolu en temps réel dans le secteur ${industry}`,
      categoryBadge: 'Étude de Cas',
      bullets: [
        `Mise en situation : Détection d'un dysfonctionnement critique à fort impact financier.`,
        `Phase 1 (T0 + 2 min) : Alerte immédiate, isolement de la source et activation de la cellule de crise.`,
        `Phase 2 (T0 + 20 min) : Diagnostic approfondi, concertation des experts et plan de contournement.`,
        `Phase 3 (T0 + 60 min) : Rétablissement complet du service, communication client et post-mortem.`,
      ],
      visualConcept: {
        type: 'flow',
        title: 'Chronologie de Résolution de Crise',
        badge: 'Incident Response',
        details: [
          'Étape 1 : Détection & Confinement immédiat (T0 + 2 min)',
          'Étape 2 : Investigation technique & Plan d’action (T0 + 20 min)',
          'Étape 3 : Résolution & Rétablissement nominal (T0 + 60 min)',
          'Étape 4 : Débriefing post-mortem & Capitalisation (J+1)',
        ],
      },
      trainerNotes: {
        timeMinutes: 15,
        keyTalkingPoints: [
          `Faire travailler les apprenants en binômes pendant 2 minutes sur la première action à mener.`,
          `Mettre l'accent sur le sang-froid et la clarté des messages en cellule de crise.`,
        ],
        oralScript: `Plongeons dans ce cas réel. Vous êtes face à cette situation d'urgence. Votre première décision va conditionner l'ampleur des dégâts. Que faites-vous dans les 120 premières secondes ?`,
        interactivePrompt: `Défi collectif : Quelle est l'erreur fatale à ne surtout pas commettre lors de la phase 1 ?`,
      },
    },
    {
      id: `s-7-${Date.now()}`,
      slideNumber: 7,
      title: `7. Outils Numériques, Automatisation & Accélération IA`,
      subtitle: `Tirer parti de la technologie et de l’IA pour multiplier votre productivité`,
      categoryBadge: 'Outils & IA',
      bullets: [
        `Identifier les tâches répétitives éligibles à l’automatisation sans perte de contrôle.`,
        `Utiliser des invites IA structurées (prompting avancé) pour générer rapports et synthèses.`,
        `Garantir la souveraineté et la confidentialité des données sensibles de l'entreprise.`,
        `Créer des modèles et scripts partagés pour accélérer l'ensemble de l'équipe.`,
      ],
      visualConcept: {
        type: 'framework',
        title: 'Stack Technologique Optimisée',
        badge: 'Accélération Tech',
        details: [
          'Niveau 1 : Alertes automatisées et déclencheurs temps réel',
          'Niveau 2 : Assistants IA pour le traitement et l’analyse',
          'Niveau 3 : Tableaux de bord décisionnels synchronisés',
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Montrer que l'IA ne remplace pas l'expertise mais augmente drastiquement la rapidité d'exécution.`,
        ],
        oralScript: `La technologie et l'IA générative sont des accélérateurs formidables lorsqu'elles sont encadrées par des règles éthiques et techniques claires.`,
        interactivePrompt: `Question : Quel processus manuel actuel vous fait perdre le plus d'énergie chaque semaine ?`,
      },
    },
    {
      id: `s-8-${Date.now()}`,
      slideNumber: 8,
      title: `8. Communication d’Influence & Alignement des Décideurs`,
      subtitle: `Savoir convaincre le management, fédérer ses pairs et porter ses projets`,
      categoryBadge: 'Influence & Management',
      bullets: [
        `Adapter son argumentaire aux attentes du CODIR (vision ROI, maîtrise des risques).`,
        `Structurer ses présentations avec la méthode 'Problème - Solution - Impact budgétaire'.`,
        `Désamorcer les réticences au changement par l'écoute active et les preuves chiffrées.`,
        `Créer des points de synchronisation réguliers pour maintenir l'alignement stratégique.`,
      ],
      visualConcept: {
        type: 'comparison',
        title: 'Posture de Communication',
        badge: 'Soft Skills',
        leftTitle: 'Communication Technique',
        leftPoints: ['Jargon trop spécialisé', 'Focus sur les contraintes', 'Difficulté à prouver le ROI'],
        rightTitle: 'Communication d’Impact',
        rightPoints: ['Orientation valeur et gains business', 'Mise en avant des bénéfices équipes', 'Plan de transition clair et chiffré'],
        details: ['La réussite d’un projet dépend à plus de 70% de la qualité de sa communication.'],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Réaliser un jeu de rôle flash : 'Pitcher son projet à son directeur en 60 secondes'.`,
        ],
        oralScript: `Avoir la bonne réponse technique ne suffit pas : il faut savoir convaincre ses parties prenantes avec des arguments percutants et accessibles.`,
        interactivePrompt: `Exercice : Comment résumeriez-vous la valeur de cette démarche en une seule phrase pour votre manager ?`,
      },
    },
    {
      id: `s-9-${Date.now()}`,
      slideNumber: 9,
      title: `9. Indicateurs de Performance (KPIs) & Mesure du ROI`,
      subtitle: `Piloter vos actions par la donnée et démontrer la valeur créée pour l’entreprise`,
      categoryBadge: 'KPIs & Pilotage',
      bullets: [
        `Sélectionner 3 à 4 métriques clés directement corrélées à la performance métier.`,
        `Mettre en place un tableau de bord visuel partagé et mis à jour en continu.`,
        `Analyser les écarts de performance chaque mois pour réallouer les priorités.`,
        `Valoriser les gains de productivité et la réduction des coûts lors des bilans annuels.`,
      ],
      visualConcept: {
        type: 'metric',
        title: 'Métriques Cibles de Réussite',
        metric: '+42%',
        metricLabel: 'de gain d’efficacité globale et de réduction des délais de traitement constatés.',
        badge: 'ROI Stratégique',
        details: [
          'KPI 1 : Taux de conformité aux procédures (> 98%)',
          'KPI 2 : Délai moyen de résolution des anomalies (-50%)',
          'KPI 3 : Indice de satisfaction et d’adoption des équipes (NPS > 60)',
        ],
      },
      trainerNotes: {
        timeMinutes: 12,
        keyTalkingPoints: [
          `Expliquer pourquoi un tableau de bord surchargé de 20 indicateurs devient inutilisable.`,
        ],
        oralScript: `Ce qui ne se mesure pas ne s'améliore pas. Choisissons ensemble les indicateurs qui reflètent la vraie santé de vos opérations.`,
        interactivePrompt: `Question : Quel est le KPI prioritaire que vous souhaitez voir progresser dans les 6 prochains mois ?`,
      },
    },
    {
      id: `s-10-${Date.now()}`,
      slideNumber: 10,
      title: `10. Plan d’Action 30-60-90 Jours & Déploiement`,
      subtitle: `Les jalons opérationnels concrets pour transformer l’apprentissage en résultats durables`,
      categoryBadge: 'Plan d’Action 30-60-90',
      bullets: [
        `Jours 1 à 30 (Socle) : Audit des pratiques, mise en place des checklists et nomination des référents.`,
        `Jours 31 à 60 (Harmonisation) : Animation d'ateliers de partage et montée en compétences collective.`,
        `Jours 61 à 90 (Excellence) : Revue des indicateurs KPIs, ajustements continus et certification interne.`,
        `Mettre en place une revue trimestrielle pour pérenniser les acquis et actualiser les guides.`,
      ],
      visualConcept: {
        type: 'flow',
        title: 'Feuille de Route Trimestrielle',
        badge: 'Jalons Clés',
        details: [
          'J+30 : Adoption des checklists et formation des référents d’équipe',
          'J+60 : Généralisation des protocoles et premier retour d’expérience',
          'J+90 : Évaluation des KPIs, mesure du ROI et certification globale',
        ],
      },
      trainerNotes: {
        timeMinutes: 12,
        keyTalkingPoints: [
          `Demander à chaque participant de s'engager sur une action prioritaire dès demain matin.`,
        ],
        oralScript: `Une formation prend tout son sens dans les actions concrètes menées dès votre retour au poste. Choisissez UNE priorité de ce plan à déployer dès cette semaine.`,
        interactivePrompt: `Engagement individuel : Quel est le tout premier changement que vous allez initier dès demain ?`,
      },
    },
    {
      id: `s-11-${Date.now()}`,
      slideNumber: 11,
      title: `11. Veille Stratégique & Évolutions Réglementaires`,
      subtitle: `Anticiper les ruptures technologiques et maintenir une longueur d’avance`,
      categoryBadge: 'Veille & Prospective',
      bullets: [
        `Organiser une veille active sur les nouvelles normes et obligations légales du secteur ${industry}.`,
        `Tester de nouvelles approches et outils dans un environnement bac à sable sécurisé.`,
        `Créer une communauté interne de veille pour partager les découvertes et bonnes pratiques.`,
        `Actualiser vos compétences et vos protocoles au minimum une fois par an.`,
      ],
      visualConcept: {
        type: 'takeaway',
        title: 'Principes de Veille Continue',
        badge: 'Anticipation',
        details: [
          '30 minutes par semaine dédiées à la veille sectorielle',
          'Expérimentation trimestrielle d’une nouvelle pratique',
          'Partage systématique des apprentissages avec l’équipe',
        ],
      },
      trainerNotes: {
        timeMinutes: 10,
        keyTalkingPoints: [
          `Donner 2 ou 3 sources de référence fiables dans le secteur ${industry}.`,
        ],
        oralScript: `Le monde professionnel évolue rapidement. Ceux qui réussissent sont ceux qui cultivent une curiosité constante et adaptent leurs pratiques en continu.`,
        interactivePrompt: `Question : Quelle évolution technologique récente surveillez-vous avec le plus d'attention ?`,
      },
    },
    {
      id: `s-12-${Date.now()}`,
      slideNumber: 12,
      title: `12. Bilan de Masterclass, Certification & Engagements`,
      subtitle: `Validation finale des acquis, remise des distinctions et accès aux ressources`,
      categoryBadge: 'Bilan & Certification',
      bullets: [
        `Synthèse des compétences clés et des méthodologies validées tout au long de la formation.`,
        `Passage du quiz officiel d'évaluation pour l'obtention du certificat accrédité EduVibe AI.`,
        `Signature de votre contrat individuel d'engagement opérationnel.`,
        `Accès permanent aux playbooks, checklists et à la communauté d'apprenants certifiés.`,
      ],
      visualConcept: {
        type: 'metric',
        title: 'Objectif de Maîtrise & Certification',
        metric: '100%',
        metricLabel: 'des participants certifiés disposent d’une feuille de route claire et de compétences opérationnelles validées.',
        badge: 'Accréditation',
        details: [
          'Certificat officiel vérifié par EduVibe AI',
          'Playbooks opérationnels & checklists téléchargeables',
          'Accompagnement continu et suivi des compétences',
        ],
      },
      trainerNotes: {
        timeMinutes: 15,
        keyTalkingPoints: [
          `Féliciter chaleureusement le groupe pour son engagement et son dynamisme.`,
          `Lancer l'épreuve de quiz pour la certification.`,
        ],
        oralScript: `Un grand bravo à toutes et à tous pour votre investissement remarquable tout au long de cette masterclass sur ${topic}. Vous avez désormais toutes les clés en main pour performer. Place à l'évaluation finale pour valider votre certificat officiel !`,
        interactivePrompt: `Mot de clôture : En un seul mot, avec quel état d'esprit repartez-vous aujourd'hui ?`,
      },
    },
  ];

  // Pick exactly the requested number of slides (e.g. 10 slides)
  const selectedSlides = fullTemplatesFR.slice(0, numSlides).map((tmpl, idx) => {
    const sNum = idx + 1;
    let titleText = tmpl.title;
    let subText = tmpl.subtitle;
    let bullets = tmpl.bullets;

    if (isVietnamese) {
      titleText = `Phần ${sNum}: ${tmpl.categoryBadge} - ${topic}`;
      subText = `Chiến lược và phương pháp triển khai thực chiến cấp độ ${audienceLevel}`;
      bullets = [
        `Phân tích sâu các yếu tố then chốt và chuẩn mực vận hành liên quan đến ${topic}.`,
        `Áp dụng quy trình chuẩn hóa nhằm loại bỏ hoàn toàn các sai sót trong ngành ${industry}.`,
        `Tối ưu hóa năng lực phối hợp liên phòng ban và trách nhiệm giải trình cá nhân.`,
        `Thiết lập cơ chế kiểm soát định kỳ và nâng cao chất lượng liên tục.`,
      ];
    } else if (!isFrench) {
      titleText = `${sNum}. ${tmpl.categoryBadge}: ${topic}`;
      subText = `High-impact methodology designed for ${audienceLevel} professionals across ${industry}`;
      bullets = [
        `Understand the direct impact of ${topic} on operational excellence and risk mitigation.`,
        `Identify early warning signs and common pitfalls across ${industry}.`,
        `Apply standardized operating procedures and structured checklists.`,
        `Measure quantitative KPIs and drive continuous team improvement.`,
      ];
    }

    return {
      ...tmpl,
      id: `s-${sNum}-${Date.now()}`,
      slideNumber: sNum,
      title: titleText,
      subtitle: subText,
      bullets,
    };
  });

  // Deep interactive quiz generation (4-5 nuanced practical questions)
  let quiz: QuizQuestion[] = [];
  if (isFrench) {
    quiz = [
      {
        id: `q-1-${Date.now()}`,
        question: `Face à une anomalie ou un incident critique lié à ${topic}, quelle est la première action obligatoire ?`,
        options: [
          `Tenter de résoudre le problème seul sans alerter personne pour éviter d'inquiéter l'équipe`,
          `Appliquer immédiatement le protocole de confinement et notifier les référents désignés`,
          `Attendre la réunion hebdomadaire pour aborder le sujet en groupe`,
          `Contourner les validations de sécurité pour gagner du temps`,
        ],
        correctOptionIndex: 1,
        explanation: `L'application immédiate du protocole et le signalement précoce permettent de circonscrire le risque sans propager l'erreur. C'est la règle d'or de la gestion des incidents.`,
        difficulty: 'Intermediate',
        hint: `Pensez à la règle d'or : confiner rapidement et alerter tôt.`,
      },
      {
        id: `q-2-${Date.now()}`,
        question: `Pourquoi l'utilisation de checklists et de procédures standardisées (SOPs) est-elle essentielle pour ${topic} ?`,
        options: [
          `Elle sert uniquement à contrôler et surveiller le temps de travail des collaborateurs`,
          `Elle libère la charge mentale, évite les oublis sous pression et garantit un standard de qualité homogène`,
          `Elle remplace entièrement le besoin de formation et d'expérience humaine`,
          `Elle ralentit volontairement les processus pour des raisons administratives`,
        ],
        correctOptionIndex: 1,
        explanation: `Les checklists réduisent drastiquement le taux d'erreur humaine sous stress en externalisant la mémoire de travail et en fiabilisant chaque étape critique.`,
        difficulty: 'Beginner',
        hint: `Pensez aux pilotes d'avion ou aux chirurgiens qui utilisent des checklists systématiques.`,
      },
      {
        id: `q-3-${Date.now()}`,
        question: `Dans le cadre d'un plan d'action d'amélioration continue, que doit-on faire à l'issue de chaque résolution d'incident ?`,
        options: [
          `Classer le dossier sans suite pour passer rapidement aux tâches suivantes`,
          `Organiser un post-mortem constructif pour analyser les causes racines et mettre à jour la documentation`,
          `Désigner publiquement un responsable pour servir d'exemple`,
          `Supprimer les logs et les traces pour alléger les serveurs`,
        ],
        correctOptionIndex: 1,
        explanation: `Le post-mortem 'blameless' (sans recherche de coupable) est le moteur de l'amélioration continue : il transforme une difficulté passée en protection collective pour l'avenir.`,
        difficulty: 'Advanced',
        hint: `L'objectif est d'analyser la cause racine (le 'pourquoi') plutôt que de chercher un coupable.`,
      },
      {
        id: `q-4-${Date.now()}`,
        question: `Quel indicateur (KPI) reflète le mieux la maturité et la solidité de l'adoption des bonnes pratiques sur ${topic} ?`,
        options: [
          `Le volume total d'emails échangés dans le mois`,
          `Le taux de conformité aux standards, le délai moyen de résolution des anomalies et le feedback régulier`,
          `Le temps passé assis devant son écran d'ordinateur`,
          `L'absence totale de questions posées par les collaborateurs`,
        ],
        correctOptionIndex: 1,
        explanation: `Les indicateurs qualitatifs et temporels (vélocité, respect des protocoles, proactivité) reflètent fidèlement la maturité opérationnelle et la confiance de l'équipe.`,
        difficulty: 'Intermediate',
        hint: `Recherchez les indicateurs mesurant la qualité réelle et la réactivité collective.`,
      },
    ];
  } else {
    quiz = [
      {
        id: `q-1-${Date.now()}`,
        question: `When facing an operational anomaly or critical incident related to ${topic}, what is the mandatory first step?`,
        options: [
          `Attempt to resolve it alone without alerting anyone to avoid causing panic`,
          `Execute the immediate containment protocol and notify designated incident leads without delay`,
          `Wait for the next weekly sync meeting to bring it up`,
          `Bypass validation checkpoints to deliver faster`,
        ],
        correctOptionIndex: 1,
        explanation: `Immediate containment combined with early escalation prevents minor glitches from cascading into catastrophic organizational failures.`,
        difficulty: 'Intermediate',
        hint: `Remember the golden rule: contain early and communicate clearly.`,
      },
      {
        id: `q-2-${Date.now()}`,
        question: `Why are standardized operating procedures and checklists indispensable for ${topic}?`,
        options: [
          `They serve solely as a micromanagement tool for supervisors`,
          `They reduce cognitive load, eliminate oversights under stress, and guarantee consistent operational excellence`,
          `They completely replace the need for critical thinking and human experience`,
          `They intentionally slow down project execution for compliance optics`,
        ],
        correctOptionIndex: 1,
        explanation: `Checklists externalize working memory during high-pressure scenarios, ensuring that critical safety and quality steps are never missed.`,
        difficulty: 'Beginner',
        hint: `Think about aviation pilots and surgeons who rely on checklists every single day.`,
      },
      {
        id: `q-3-${Date.now()}`,
        question: `What is the hallmark of a high-performing continuous improvement culture following an incident on ${topic}?`,
        options: [
          `Archiving the ticket immediately without further retrospective analysis`,
          `Conducting a blameless post-mortem to uncover root causes and update shared playbooks`,
          `Assigning individual blame publicly to discourage future mistakes`,
          `Deleting audit trails to free up database storage`,
        ],
        correctOptionIndex: 1,
        explanation: `Blameless post-mortems turn operational friction into collective organizational resilience and improved documentation.`,
        difficulty: 'Advanced',
        hint: `Focus on root cause analysis (the 'why') rather than personal finger-pointing.`,
      },
      {
        id: `q-4-${Date.now()}`,
        question: `Which metric provides the most accurate reflection of sustainable best practice adoption for ${topic}?`,
        options: [
          `Total volume of internal Slack messages sent per week`,
          `Procedure compliance rate, mean time to detection/resolution, and proactive feedback cadence`,
          `Total logged screen time during business hours`,
          `Zero questions asked during team standups`,
        ],
        correctOptionIndex: 1,
        explanation: `Actionable qualitative and temporal KPIs measure actual process health, speed of recovery, and team psychological safety.`,
        difficulty: 'Intermediate',
        hint: `Look for metrics that reflect genuine quality, speed, and transparency.`,
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
    slides: selectedSlides,
    quiz,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate course directly with Google Gemini SDK in client/browser with strict curriculum enforcement
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
    model = 'gemini-3.7-flash',
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

Return STRICT JSON only matching the schema:
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
      "correctOptionIndex": number (0-3),
      "explanation": string,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "hint": string
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: model || 'gemini-3.7-flash',
    contents: prompt,
    config: {
      systemInstruction: `You are EduVibe AI, an elite corporate course designer. Always produce high quality instructional content in ${language}. Ensure tone is highly professional, engaging, and actionable. Return valid JSON only.`,
      responseMimeType: 'application/json',
    },
  });

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

  // Ensure exact slide numbers
  const formattedSlides: Slide[] = rawSlides.slice(0, targetCount).map((s: any, idx: number) => ({
    ...s,
    id: `slide-${idx + 1}-${Date.now()}`,
    slideNumber: idx + 1,
  }));

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

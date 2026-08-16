import { CoursePayload, CourseTheme } from '../types';

export const COURSE_THEMES: Record<CourseTheme['id'], CourseTheme> = {
  indigo: {
    id: 'indigo',
    name: 'Modern Executive Indigo',
    primaryColor: '#4f46e5',
    accentColor: '#818cf8',
    gradient: 'from-indigo-600 via-indigo-700 to-slate-900',
    cardBg: 'bg-indigo-950/40 border-indigo-500/30',
    borderAccent: 'border-indigo-500/50',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    pptxPrimary: '4F46E5',
    pptxSecondary: '818CF8',
    pptxBg: '0F172A',
  },
  emerald: {
    id: 'emerald',
    name: 'Tech & Growth Emerald',
    primaryColor: '#059669',
    accentColor: '#34d399',
    gradient: 'from-emerald-600 via-teal-700 to-slate-900',
    cardBg: 'bg-emerald-950/40 border-emerald-500/30',
    borderAccent: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    pptxPrimary: '059669',
    pptxSecondary: '34D399',
    pptxBg: '064E3B',
  },
  violet: {
    id: 'violet',
    name: 'Cyber & Innovation Violet',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    gradient: 'from-purple-600 via-violet-700 to-slate-900',
    cardBg: 'bg-purple-950/40 border-purple-500/30',
    borderAccent: 'border-purple-500/50',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    pptxPrimary: '7C3AED',
    pptxSecondary: 'A78BFA',
    pptxBg: '1E1B4B',
  },
  amber: {
    id: 'amber',
    name: 'Leadership & Energy Amber',
    primaryColor: '#d97706',
    accentColor: '#fbbf24',
    gradient: 'from-amber-600 via-orange-700 to-slate-900',
    cardBg: 'bg-amber-950/40 border-amber-500/30',
    borderAccent: 'border-amber-500/50',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    pptxPrimary: 'D97706',
    pptxSecondary: 'FBBF24',
    pptxBg: '451A03',
  },
  rose: {
    id: 'rose',
    name: 'Human & Culture Rose',
    primaryColor: '#e11d48',
    accentColor: '#fb7185',
    gradient: 'from-rose-600 via-pink-700 to-slate-900',
    cardBg: 'bg-rose-950/40 border-rose-500/30',
    borderAccent: 'border-rose-500/50',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    pptxPrimary: 'E11D48',
    pptxSecondary: 'FB7185',
    pptxBg: '4C0519',
  },
  slate: {
    id: 'slate',
    name: 'Corporate Precision Slate',
    primaryColor: '#475569',
    accentColor: '#94a3b8',
    gradient: 'from-slate-700 via-slate-800 to-slate-950',
    cardBg: 'bg-slate-900/60 border-slate-700',
    borderAccent: 'border-slate-500/50',
    badgeBg: 'bg-slate-700/50',
    badgeText: 'text-slate-300',
    pptxPrimary: '334155',
    pptxSecondary: '94A3B8',
    pptxBg: '0F172A',
  },
};

export const PRESET_COURSES: CoursePayload[] = [
  {
    id: 'cybersec-remote-fr',
    title: 'Cybersécurité en Télétravail : Les Nouveaux Réflexes Clés',
    tagline: 'Protéger les données de l’entreprise et neutraliser le phishing moderne',
    description: 'Une formation interactive complète conçue pour sensibiliser les équipes distantes aux attaques d’ingénierie sociale, à la sécurité Wi-Fi et aux protocoles MFA.',
    topic: 'Cybersécurité en télétravail',
    audienceLevel: 'Intermediate',
    language: 'Français',
    industry: 'Général & Tech',
    estimatedDuration: 45,
    themeId: 'violet',
    createdAt: new Date().toISOString(),
    slides: [
      {
        id: 's1',
        slideNumber: 1,
        title: 'Le Périmètre Éclaté du Télétravail',
        subtitle: 'Comprendre la vulnérabilité du poste distant',
        bullets: [
          '82% des failles de sécurité impliquent un facteur humain ou une erreur de configuration à domicile.',
          'La frontière entre réseau domestique personnel et données sensibles d’entreprise s’est estompée.',
          'Les cyberattaquants ciblent préférentiellement les environnements hors VPN et les connexions non sécurisées.',
          'Nécessité d’adopter une posture "Zero Trust" : ne jamais faire confiance par défaut.'
        ],
        categoryBadge: 'Introduction & Enjeux',
        visualConcept: {
          type: 'metric',
          title: 'Impact Télétravail & Sécurité',
          metric: '+238%',
          metricLabel: 'Hausse des cyberattaques ciblant les télétravailleurs depuis 2020',
          details: [
            'Attaques de phishing déguisées en notifications RH ou IT',
            'Compromission via les objets connectés (IoT) du foyer',
            'Absence de segmentation du réseau local domestique'
          ],
          badge: 'Statistique Clé'
        },
        trainerNotes: {
          timeMinutes: 7,
          keyTalkingPoints: [
            'Accueillir les participants et rappeler que la cybersécurité n’est pas une contrainte technique mais un bouclier collectif.',
            'Citer l’exemple d’un collaborateur piégé par un faux email Teams ou Zoom.',
            'Poser la question au public : "Combien d’entre vous séparent leurs appareils pros et persos sur leur box ?"'
          ],
          oralScript: 'Bonjour à toutes et à tous. Bienvenue dans ce module consacré à la cybersécurité en situation de travail distant. Le constat est sans appel : en télétravail, le périmètre traditionnel du pare-feu d’entreprise disparaît. Notre premier rempart, c’est notre vigilance individuelle et nos automatismes quotidiens.',
          interactivePrompt: 'Sondez l’audience : Levez la main ou tapez "1" dans le chat si vous vous êtes déjà connecté à un Wi-Fi public sans VPN.'
        }
      },
      {
        id: 's2',
        slideNumber: 2,
        title: 'Déjouer le Phishing 2.0 & le Spear-Phishing',
        subtitle: 'Repérer les indices subtils et l’IA générative dans les arnaques',
        bullets: [
          'Les emails frauduleux ne comportent plus de fautes grossières grâce aux modèles de langage avancés.',
          'Techniques d’urgence psychologique : fausses alertes d’expiration de mot de passe, ordres de virement.',
          'Vérification systématique de l’adresse de l’expéditeur réel (domaine vs nom d’affichage).',
          'Règle d’or : en cas de doute, contacter l’émetteur par un canal indépendant (chat direct ou téléphone).'
        ],
        categoryBadge: 'Vigilance & Détection',
        visualConcept: {
          type: 'comparison',
          title: 'Email Légitime vs Phishing Ciblé',
          leftTitle: 'Email Légitime',
          leftPoints: [
            'Nom et domaine conformes (@entreprise.com)',
            'Demande formulée dans les procédures standards',
            'Délai de traitement raisonnable et documenté'
          ],
          rightTitle: 'Piège de Spear-Phishing',
          rightPoints: [
            'Domaine sosie (@entr-prise.com ou .co)',
            'Urgence extrême ("Votre compte sera coupé dans 1h")',
            'Lien raccourci ou pièce jointe zippée inhabituelle'
          ],
          details: ['L’IA générative permet désormais aux hackers de cloner le style rédactionnel exact de vos dirigeants.']
        },
        trainerNotes: {
          timeMinutes: 10,
          keyTalkingPoints: [
            'Montrer la différence entre un nom d’affichage tronqué sur smartphone et le véritable en-tête email.',
            'Expliquer la technique du "Quishing" (QR codes malveillants scannés sur mobile pro).',
            'Rappeler la règle du double appel pour toute transaction financière ou changement de RIB.'
          ],
          oralScript: 'Regardons de plus près la nouvelle génération d’attaques. Aujourd’hui, le pirate maîtrise parfaitement le vocabulaire de votre secteur. La seule façon d’éviter le piège est de regarder l’URL de destination et de rompre l’effet de panique artificielle.',
          interactivePrompt: 'Exercice rapide : Si votre PDG vous demande des cartes cadeaux en urgence par SMS, quelle est votre première action ?'
        }
      },
      {
        id: 's3',
        slideNumber: 3,
        title: 'Les 3 Piliers de la Défense Personnelle',
        subtitle: 'Mots de passe, Double Authentification (MFA) & Mises à jour',
        bullets: [
          '1. Gestionnaire de mots de passe : des mots de passe uniques et complexes sans effort de mémorisation.',
          '2. MFA (Multi-Factor Authentication) : bloque 99% des tentatives de piratage automatisé de compte.',
          '3. Mises à jour automatiques : combler les failles de sécurité zero-day sur vos OS et navigateurs.',
          'Verrouillage automatique de la session dès que l’on quitte son écran (Win+L / Cmd+Ctrl+Q).'
        ],
        categoryBadge: 'Bonnes Pratiques',
        visualConcept: {
          type: 'framework',
          title: 'Architecture du Poste Distant Sécurisé',
          details: [
            'PILIER 1 : Chiffrement intégral du disque dur (BitLocker / FileVault)',
            'PILIER 2 : Authentificateur par notification push sécurisée (pas de SMS)',
            'PILIER 3 : VPN d’entreprise systématique pour accéder aux ressources internes'
          ],
          badge: 'Framework de Protection'
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            'Démystifier les gestionnaires de mots de passe (1Password, Bitwarden, KeePass).',
            'Expliquer pourquoi le SMS n’est pas le facteur d’authentification le plus sûr (SIM swapping).',
            'Sensibiliser à l’environnement physique : famille, colocataires, regards indiscrets dans les cafés.'
          ],
          oralScript: 'Ces trois piliers constituent votre armure. En activant le MFA sur l’ensemble de vos comptes critiques et en automatisant les correctifs logiciels, vous réduisez drastiquement la surface d’attaque accessible aux robots malveillants.',
          interactivePrompt: 'Faites tester le raccourci clavier Win+L (ou Cmd+Ctrl+Q) en direct à vos apprenants.'
        }
      },
      {
        id: 's4',
        slideNumber: 4,
        title: 'Procédure d’Incident : Les 4 Premières Minutes',
        subtitle: 'Réagir efficacement sans paniquer en cas de clic suspect',
        bullets: [
          'Étape 1 : Déconnecter immédiatement l’appareil d’Internet (couper le Wi-Fi / débrancher le câble RJ45).',
          'Étape 2 : NE PAS ÉTEINDRE la machine (pour préserver la mémoire vive nécessaire aux analystes forensiques).',
          'Étape 3 : Alerter le support sécurité (SOC / DSI) via votre téléphone ou un canal de secours.',
          'Culture de non-blâme : signaler immédiatement une erreur permet de stopper la propagation avant le chiffrement.'
        ],
        categoryBadge: 'Gestion de Crise',
        visualConcept: {
          type: 'flow',
          title: 'Chronologie d’Intervention Post-Clic',
          details: [
            'Minute 0 : Clic suspect ou fichier suspect exécuté',
            'Minute 1 : Déconnexion réseau immédiate (Mode Avion / Coupure Wi-Fi)',
            'Minute 2 : Appel hotline d’urgence IT avec descriptif précis',
            'Minute 3-4 : Audit initial et isolation du compte compromise'
          ],
          badge: 'Protocole d’Urgence'
        },
        trainerNotes: {
          timeMinutes: 10,
          keyTalkingPoints: [
            'Insister très lourdement sur la tolérance zéro à la dissimulation : un clic avoué dans les 5 minutes coûte 100x moins cher qu’un rançongiciel étendu.',
            'Noter le numéro d’urgence IT sur un post-it accessible en permanence.',
            'Présenter le rôle du SOC (Security Operations Center).'
          ],
          oralScript: 'L’erreur humaine arrive aux plus prudents. Ce qui fait la différence entre un non-événement et une catastrophe majeure pour l’entreprise, c’est votre rapidité à couper la connexion et à prévenir les équipes d’astreinte sans honte.',
          interactivePrompt: 'Demandez aux apprenants : "Avez-vous tous enregistré le numéro d’urgence de votre équipe IT dans votre smartphone pro ?"'
        }
      },
      {
        id: 's5',
        slideNumber: 5,
        title: 'Plan d’Action & Checklist du Télétravailleur Serein',
        subtitle: 'Votre feuille de route pour les 7 prochains jours',
        bullets: [
          'Aujourd’hui : Vérifier le mot de passe de sa box Internet et désactiver l’accès distant.',
          'Cette semaine : Activer le MFA sur tous ses comptes professionnels et personnels critiques.',
          'Régulièrement : Sauvegarder ses documents sur le Cloud sécurisé d’entreprise (SharePoint / Google Drive).',
          'Règle d’or : En cas de doute, signalez le message au bouton de phishing dédié de votre messagerie.'
        ],
        categoryBadge: 'Synthèse & Clôture',
        visualConcept: {
          type: 'takeaway',
          title: 'Les 3 Commandements du Collaborateur Vigilant',
          details: [
            '1. Je ne clique jamais sous la pression de l’urgence.',
            '2. Je sépare mes usages professionnels et personnels.',
            '3. Je signale immédiatement tout comportement suspect.'
          ],
          badge: 'Checklist Quotidienne'
        },
        trainerNotes: {
          timeMinutes: 10,
          keyTalkingPoints: [
            'Féliciter les apprenants et ouvrir la session de questions/réponses.',
            'Lancer le quiz final interactif pour valider les acquis.',
            'Partager les liens vers les chartes informatiques internes.'
          ],
          oralScript: 'Nous arrivons au terme de cette présentation. Vous détenez désormais les clés pour transformer votre domicile en un bastion sécurisé. Passons ensemble au quiz d’évaluation pour tester vos réflexes !',
          interactivePrompt: 'Passez à l’onglet Quiz et défiez les participants pour un sans-faute.'
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Que devez-vous faire en priorité absolue si vous venez de cliquer sur une pièce jointe suspecte ?',
        options: [
          'Éteindre immédiatement l’ordinateur avec le bouton marche/arrêt',
          'Couper la connexion Internet (déconnecter le Wi-Fi / câble) et prévenir l’IT',
          'Attendre 24 heures pour voir si un message d’erreur apparaît',
          'Supprimer le fichier téléchargé et vider la corbeille sans rien dire'
        ],
        correctOptionIndex: 1,
        explanation: 'Couper la connexion réseau empêche le malware de communiquer avec son serveur de contrôle ou d’infecter d’autres postes sur le réseau, tout en conservant la mémoire RAM intacte pour l’analyse IT.',
        difficulty: 'Beginner',
        hint: 'Pensez à isoler la machine du reste du réseau pour couper la communication avec les hackers.'
      },
      {
        id: 'q2',
        question: 'Quelle est la méthode d’authentification multifacteur (MFA) la plus sécurisée parmi les suivantes ?',
        options: [
          'Réception d’un code à 6 chiffres par SMS',
          'Question secrète (ex: le nom de jeune fille de votre mère)',
          'Application d’authentification avec notification push ou clé de sécurité FIDO2',
          'Envoi du code par email sur votre boîte personnelle'
        ],
        correctOptionIndex: 2,
        explanation: 'Les applications d’authentification dédiées et les clés physiques résistent aux attaques par clonage de carte SIM (SIM swapping) et à l’interception de SMS.',
        difficulty: 'Intermediate',
        hint: 'Le SMS peut être intercepté ou détourné par des pirates via les opérateurs téléphoniques.'
      },
      {
        id: 'q3',
        question: 'Pourquoi l’IA générative rend-elle les attaques de phishing plus dangereuses aujourd’hui ?',
        options: [
          'Elle permet de pirater les box Internet sans mot de passe',
          'Elle produit des textes sans fautes d’orthographe et imite parfaitement le ton d’un collaborateur',
          'Elle désactive automatiquement l’antivirus de votre ordinateur',
          'Elle remplace votre mot de passe à distance sans vous avertir'
        ],
        correctOptionIndex: 1,
        explanation: 'Les modèles de langage permettent aux cybercriminels de rédiger des messages ultra-réalistes, crédibles et personnalisés, éliminant les indices traditionnels comme les fautes de syntaxe.',
        difficulty: 'Intermediate',
        hint: 'Observez comment la qualité de rédaction et de persuasion a augmenté.'
      },
      {
        id: 'q4',
        question: 'Quelle est la bonne attitude lorsque vous travaillez dans un espace public (café, gare, train) ?',
        options: [
          'Se connecter au Wi-Fi public sans VPN pour économiser de la batterie',
          'Laisser sa session ouverte quand on va chercher un café pour aller plus vite',
          'Utiliser un filtre de confidentialité sur l’écran et activer systématiquement le VPN d’entreprise',
          'Partager sa connexion 4G avec d’autres usagers du café par politesse'
        ],
        correctOptionIndex: 2,
        explanation: 'Le filtre de confidentialité empêche le piratage visuel (shoulder surfing) et le VPN chiffre l’intégralité de vos flux sur les réseaux non fiables.',
        difficulty: 'Beginner',
        hint: 'Protégez à la fois ce qui se voit sur votre écran et ce qui transite sur les ondes Wi-Fi.'
      }
    ]
  },
  {
    id: 'ai-prompt-engineering-en',
    title: 'Enterprise AI & Prompt Engineering Masterclass',
    tagline: 'Leveraging Generative Models safely for maximum productivity and business value',
    description: 'A cutting-edge workshop for managers, analysts, and knowledge workers to master few-shot prompting, chain-of-thought, hallucination mitigation, and enterprise data privacy.',
    topic: 'Prompt Engineering & Enterprise Generative AI',
    audienceLevel: 'Intermediate',
    language: 'English',
    industry: 'Technology & Enterprise',
    estimatedDuration: 60,
    themeId: 'indigo',
    createdAt: new Date().toISOString(),
    slides: [
      {
        id: 'ai-s1',
        slideNumber: 1,
        title: 'The Generative AI Paradigm Shift',
        subtitle: 'From search engines to intelligent reasoning co-pilots',
        bullets: [
          'Large Language Models (LLMs) act as reasoning engines rather than static databases.',
          'Context window management is the new working memory for corporate task automation.',
          'Key enterprise benefits: 40% time reduction in synthesis, drafting, and data transformation.',
          'The quality of output is directly proportional to the clarity and constraints of your prompt.'
        ],
        categoryBadge: 'Executive Overview',
        visualConcept: {
          type: 'metric',
          title: 'Productivity Acceleration',
          metric: '3.2x',
          metricLabel: 'Speedup in content drafting and qualitative analysis when using structured prompts',
          details: [
            'Automated RFP summarization and comparison',
            'Cross-lingual document synthesis in seconds',
            'Instant synthetic data generation for testing'
          ],
          badge: 'Benchmark Insight'
        },
        trainerNotes: {
          timeMinutes: 10,
          keyTalkingPoints: [
            'Frame LLMs as super-interns: exceptionally fast, broadly knowledgeable, but needing crystal-clear briefs.',
            'Emphasize that prompt engineering is a structured communication skill, not coding.',
            'Highlight the distinction between public consumer tools and secure enterprise endpoints.'
          ],
          oralScript: 'Welcome everyone. Today we are demystifying Prompt Engineering in the corporate environment. We will move beyond simple chat queries into industrial-strength prompt workflows that guarantee repeatable, accurate business results.',
          interactivePrompt: 'Ask participants: What is the most repetitive document or email you draft every week?'
        }
      },
      {
        id: 'ai-s2',
        slideNumber: 2,
        title: 'The C.R.E.A.T.E. Prompting Framework',
        subtitle: 'The 6 indispensable components of high-precision prompts',
        bullets: [
          'C - Context: Define background, target audience, and business objective.',
          'R - Role: Assign the persona (e.g. Senior Compliance Auditor, Principal Data Engineer).',
          'E - Explicit Instructions: Use imperative verbs and step-by-step logic.',
          'A - Audience & Tone: Specify professional level, brevity, and formatting style.',
          'T - Template / Output Format: Request JSON, Markdown tables, or executive bullet points.',
          'E - Examples (Few-Shot): Provide 1 or 2 gold-standard input/output pairs.'
        ],
        categoryBadge: 'Methodology & Framework',
        visualConcept: {
          type: 'framework',
          title: 'Architecture of a Professional Prompt',
          details: [
            'ROLE & CONTEXT: "Act as a Fortune 500 Chief Information Security Officer..."',
            'TASK CONSTRAINTS: "Analyze this vendor SLA. Highlight missing indemnities in a Markdown table."',
            'FEW-SHOT EXAMPLES: "Input: [Sample Term] -> Output: [Risk Level: High | Mitigation: Add clause 4.2]"'
          ],
          badge: 'CREATE Framework'
        },
        trainerNotes: {
          timeMinutes: 12,
          keyTalkingPoints: [
            'Break down why vague prompts yield vague hallucinated answers.',
            'Show how few-shot prompting increases precision by over 60%.',
            'Explain temperature and system instructions.'
          ],
          oralScript: 'If you remember only one slide from today, let it be this CREATE framework. When a model gives you mediocre results, 95% of the time it is missing either explicit role constraints or a target output template.',
          interactivePrompt: 'Demonstrate live in the AI Tutor chat: Refactor a vague prompt into the CREATE framework.'
        }
      },
      {
        id: 'ai-s3',
        slideNumber: 3,
        title: 'Mitigating Hallucinations & Ensuring Data Privacy',
        subtitle: 'Enterprise governance, Zero-Day retention, and grounding techniques',
        bullets: [
          'Never paste confidential customer PII, unreleased financials, or credentials into unapproved public tools.',
          'Grounding: Force the model to cite and extract solely from provided reference attachments.',
          'Negative Prompting: Explicitly state "If the answer is not in the source text, reply \'Information not available\'".',
          'Chain-of-Verification: Ask the model to review and fact-check its own draft before final output.'
        ],
        categoryBadge: 'Governance & Ethics',
        visualConcept: {
          type: 'comparison',
          title: 'Safe Enterprise AI vs Risky Habits',
          leftTitle: 'Safe Enterprise AI Practice',
          leftPoints: [
            'Approved Enterprise API with Zero-Data Retention',
            'Source-grounded synthesis with direct document citations',
            'Human-in-the-loop review for all critical decisions'
          ],
          rightTitle: 'High-Risk Habits to Avoid',
          rightPoints: [
            'Pasting customer data into consumer personal accounts',
            'Blindly accepting mathematical or legal calculations without verification',
            'Publishing AI content without human editorial oversight'
          ],
          details: ['Always verify outputs before delivering to external stakeholders or regulatory authorities.']
        },
        trainerNotes: {
          timeMinutes: 12,
          keyTalkingPoints: [
            'Clarify enterprise data terms: explain how corporate API contracts guarantee models are NOT trained on your prompt inputs.',
            'Introduce Retrieval-Augmented Generation (RAG) concepts in simple language.',
            'Discuss liability and ethical copyright considerations.'
          ],
          oralScript: 'Trust and privacy are non-negotiable in business. By using source grounding and strict negative constraints, we harness the reasoning power of AI while effectively eliminating hallucination risks.',
          interactivePrompt: 'Poll the room: Does your department have an official GenAI policy approved by legal?'
        }
      }
    ],
    quiz: [
      {
        id: 'ai-q1',
        question: 'Which technique is most effective for preventing Large Language Models from making up false facts (hallucinating)?',
        options: [
          'Asking the model to guess if it does not know the answer',
          'Providing reference source documents and explicitly prompting "Answer only based on the provided text"',
          'Using all-caps in your prompt instructions',
          'Repeating the question three times in a row'
        ],
        correctOptionIndex: 1,
        explanation: 'Source grounding with strict negative constraints forces the model to extract verified facts rather than relying on probabilistic generative guesswork.',
        difficulty: 'Intermediate',
        hint: 'Restrict the model to explicit facts present in your uploaded text.'
      },
      {
        id: 'ai-q2',
        question: 'In prompt engineering, what does "Few-Shot Prompting" mean?',
        options: [
          'Limiting your prompt to fewer than 5 words',
          'Providing a few sample input-output pairs inside the prompt to illustrate the desired format and style',
          'Running the prompt multiple times until you get lucky',
          'Using image generation models instead of text models'
        ],
        correctOptionIndex: 1,
        explanation: 'Few-shot prompting provides concrete examples of the expected input and output format, guiding the model to mimic the exact pattern reliably.',
        difficulty: 'Beginner',
        hint: 'Think of showing examples to an intern so they understand the exact format required.'
      }
    ]
  },
  {
    id: 'cybersec-ai-vi',
    title: 'An Toàn Thông Tin & Ứng Dụng AI Trong Doanh Nghiệp',
    tagline: 'Bảo vệ dữ liệu, phòng chống lừa đảo trực tuyến và tối ưu hóa năng suất bằng AI',
    description: 'Chương trình đào tạo tương tác toàn diện dành cho nhân sự và cấp quản lý nhằm nắm vững kỹ năng nhận diện rủi ro mạng, bảo vệ dữ liệu nhạy cảm và ứng dụng AI an toàn.',
    topic: 'An toàn thông tin & AI Doanh Nghiệp',
    audienceLevel: 'Intermediate',
    language: 'Tiếng Việt',
    industry: 'Công nghệ & Doanh nghiệp',
    estimatedDuration: 45,
    themeId: 'emerald',
    createdAt: new Date().toISOString(),
    slides: [
      {
        id: 'vi-s1',
        slideNumber: 1,
        title: 'Bảo Mật Làm Việc Từ Xa & Rủi Ro Tiềm Ẩn',
        subtitle: 'Thấu hiểu các điểm yếu của môi trường làm việc phân tán',
        bullets: [
          '82% các vụ rò rỉ dữ liệu bắt nguồn từ yếu tố con người và cấu hình thiết bị cá nhân tại nhà.',
          'Ranh giới giữa mạng gia đình và dữ liệu nhạy cảm của tổ chức ngày càng mờ nhạt.',
          'Kẻ tấn công thường nhắm vào các kết nối không mã hóa và Wi-Fi công cộng thiếu VPN.',
          'Cần áp dụng nguyên tắc "Zero Trust": Không tin tưởng bất kỳ thiết bị nào theo mặc định.'
        ],
        categoryBadge: 'Bối Cảnh & Nguy Cơ',
        visualConcept: {
          type: 'metric',
          title: 'Gia Tăng Tấn Công Mạng',
          metric: '+238%',
          metricLabel: 'Sự gia tăng các cuộc tấn công mạng nhắm vào nhân viên làm việc từ xa',
          details: [
            'Email giả mạo thông báo từ phòng Nhân sự hoặc IT',
            'Xâm nhập thông qua các thiết bị thông minh (IoT) trong gia đình',
            'Thiếu lớp phân tách bảo vệ mạng nội bộ'
          ],
          badge: 'Thống Kê Trọng Điểm'
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            'Chào đón học viên và nhấn mạnh: An toàn thông tin không phải là rào cản kỹ thuật mà là lá chắn chung của toàn công ty.',
            'Nêu ví dụ thực tế về nhân viên bị đánh cắp tài khoản do đăng nhập qua link giả mạo.',
            'Đặt câu hỏi thăm dò: "Bao nhiêu bạn ở đây từng dùng chung mật khẩu cho tài khoản công việc và mạng xã hội?"'
          ],
          oralScript: 'Xin chào toàn thể anh chị học viên. Chào mừng mọi người đến với chuyên đề an toàn thông tin và ứng dụng công nghệ. Trong môi trường số hiện nay, ranh giới an ninh vật lý đã hoàn toàn thay đổi. Lá chắn mạnh mẽ nhất của tổ chức chính là sự cảnh giác và thói quen bảo mật của từng cá nhân mỗi ngày.',
          interactivePrompt: 'Khảo sát nhanh lớp học: Hãy giơ tay hoặc gõ phím "1" vào khung chat nếu bạn từng kết nối Wi-Fi tại quán cà phê mà chưa bật VPN.'
        }
      },
      {
        id: 'vi-s2',
        slideNumber: 2,
        title: 'Nhận Diện Lừa Đảo Phishing & Kỹ Thuật AI Mới',
        subtitle: 'Phát hiện các dấu hiệu tinh vi và thủ đoạn giả mạo danh tính',
        bullets: [
          'Email lừa đảo ngày nay sử dụng mô hình ngôn ngữ lớn (LLM) để viết văn trôi chảy, không còn lỗi chính tả.',
          'Thủ đoạn tạo áp lực tâm lý khẩn cấp: Đe dọa khóa tài khoản trong 1 giờ hoặc yêu cầu chuyển tiền gấp.',
          'Kiểm tra cẩn thận địa chỉ email người gửi thực tế (tên hiển thị so với tên miền sau dấu @).',
          'Nguyên tắc vàng: Khi có nghi ngờ, luôn xác minh qua kênh liên lạc độc lập (gọi điện thoại trực tiếp).'
        ],
        categoryBadge: 'Phát Hiện & Cảnh Giác',
        visualConcept: {
          type: 'comparison',
          title: 'Email Hợp Lệ vs Email Giả Mạo Phishing',
          leftTitle: 'Email Hợp Lệ',
          leftPoints: [
            'Tên miền chuẩn xác (@tencongty.vn)',
            'Yêu cầu theo đúng quy trình công việc',
            'Thời gian xử lý hợp lý, có tài liệu đính kèm chính thức'
          ],
          rightTitle: 'Bẫy Lừa Đảo Phishing',
          rightPoints: [
            'Tên miền giả mạo tinh vi (@ten-congty.co)',
            'Áp lực khẩn cấp ("Tài khoản sẽ bị hủy sau 30 phút")',
            'Liên kết rút gọn hoặc file nén lạ'
          ],
          details: ['Kẻ gian hiện nay có thể dùng AI để sao chép văn phong và giọng điệu của lãnh đạo doanh nghiệp.']
        },
        trainerNotes: {
          timeMinutes: 10,
          keyTalkingPoints: [
            'Chỉ ra sự khác biệt giữa tên hiển thị trên điện thoại và địa chỉ email đầy đủ.',
            'Giải thích về hình thức mã QR độc hại (Quishing) dán tại nơi công cộng.',
            'Nhắc lại quy tắc xác nhận 2 lần đối với mọi giao dịch chuyển tiền hoặc đổi thông tin tài khoản.'
          ],
          oralScript: 'Hãy cùng phân tích thế hệ tấn công mới. Kẻ lừa đảo hiện nay hiểu rất rõ cấu trúc tổ chức và thuật ngữ chuyên ngành của chúng ta. Cách duy nhất để không sập bẫy là luôn nhìn kỹ địa chỉ trang web đích và tuyệt đối không hành động theo cảm xúc vội vã.',
          interactivePrompt: 'Tình huống giả định: Nếu nhận được tin nhắn SMS từ Tổng giám đốc nhờ mua hộ thẻ cào điện thoại khẩn cấp, bạn sẽ làm gì đầu tiên?'
        }
      },
      {
        id: 'vi-s3',
        slideNumber: 3,
        title: '3 Trụ Cột Tự Vệ & Làm Việc An Toàn',
        subtitle: 'Mật khẩu mạnh, Xác thực 2 bước (MFA) & Khóa màn hình',
        bullets: [
          '1. Trình quản lý mật khẩu: Tạo mật khẩu ngẫu nhiên, duy nhất cho từng dịch vụ mà không cần nhớ.',
          '2. Xác thực 2 yếu tố (2FA / MFA): Ngăn chặn 99% các cuộc tấn công chiếm đoạt tài khoản tự động.',
          '3. Cập nhật phần mềm định kỳ: Vá các lỗ hổng bảo mật mới nhất trên hệ điều hành và trình duyệt.',
          'Khóa màn hình máy tính ngay khi rời khỏi bàn làm việc (phím tắt Win + L trên Windows hoặc Cmd + Ctrl + Q trên Mac).'
        ],
        categoryBadge: 'Thực Hành Tốt Nhất',
        visualConcept: {
          type: 'framework',
          title: 'Khung Bảo Vệ Thiết Bị Cá Nhân',
          details: [
            'TRỤ CỘT 1: Mã hóa toàn bộ ổ cứng thiết bị (BitLocker / FileVault)',
            'TRỤ CỘT 2: Ứng dụng xác thực mã OTP an toàn (Microsoft/Google Authenticator)',
            'TRỤ CỘT 3: Kết nối VPN chuyên dụng khi truy cập tài nguyên nội bộ công ty'
          ],
          badge: 'Mô Hình Phòng Thủ'
        },
        trainerNotes: {
          timeMinutes: 10,
          keyTalkingPoints: [
            'Giới thiệu cách dùng trình quản lý mật khẩu đơn giản, an toàn.',
            'Giải thích vì sao nhận mã OTP qua SMS có thể bị chiếm quyền (SIM swapping) và nên ưu tiên app xác thực.',
            'Lưu ý về môi trường làm việc công cộng: cẩn thận góc nhìn trộm màn hình tại quán cà phê.'
          ],
          oralScript: 'Ba trụ cột này chính là bộ áo giáp số của bạn. Khi kích hoạt xác thực 2 bước trên mọi tài khoản quan trọng, bạn đã loại bỏ hầu hết nguy cơ bị tin tặc xâm nhập tự động.',
          interactivePrompt: 'Mời cả lớp cùng thực hành ngay phím tắt khóa màn hình Win+L (hoặc Cmd+Ctrl+Q) trên máy tính của mình.'
        }
      },
      {
        id: 'vi-s4',
        slideNumber: 4,
        title: 'Kế Hoạch Hành Động & Checklist 7 Ngày Tới',
        subtitle: 'Lộ trình thực hiện đơn giản để hình thành thói quen bảo mật',
        bullets: [
          'Hôm nay: Đổi mật khẩu router Wi-Fi tại nhà và tắt tính năng truy cập từ xa.',
          'Trong tuần này: Bật xác thực 2 bước (MFA) cho toàn bộ tài khoản email, mạng xã hội và ngân hàng.',
          'Định kỳ: Sao lưu các tài liệu quan trọng lên bộ nhớ đám mây của doanh nghiệp (OneDrive / Google Drive).',
          'Quy tắc vàng: Khi phát hiện bất thường, hãy báo cáo ngay cho bộ phận IT chuyên trách.'
        ],
        categoryBadge: 'Tổng Kết & Hành Động',
        visualConcept: {
          type: 'takeaway',
          title: '3 Nguyên Tắc Cốt Lõi Của Nhân Viên Số',
          details: [
            '1. Không click vào link lạ dưới áp lực thời gian.',
            '2. Tách biệt rõ ràng giữa tài khoản công việc và giải trí cá nhân.',
            '3. Báo cáo sự cố ngay lập tức mà không ngần ngại.'
          ],
          badge: 'Checklist Hàng Ngày'
        },
        trainerNotes: {
          timeMinutes: 8,
          keyTalkingPoints: [
            'Chúc mừng học viên đã hoàn thành phần lý thuyết.',
            'Mở phiên hỏi đáp và giải đáp thắc mắc thực tế từ người học.',
            'Hướng dẫn học viên chuyển sang phần Quiz trắc nghiệm để nhận chứng chỉ tốt nghiệp.'
          ],
          oralScript: 'Chúng ta đã đi qua các nội dung trọng tâm của khóa học. Bây giờ, xin mời anh chị cùng bước vào bài kiểm tra trắc nghiệm ngắn để củng cố kiến thức và nhận chứng chỉ chính thức từ hệ thống!',
          interactivePrompt: 'Chuyển sang tab Trắc Nghiệm để bắt đầu làm bài đánh giá.'
        }
      }
    ],
    quiz: [
      {
        id: 'vi-q1',
        question: 'Hành động quan trọng nhất bạn cần làm NGAY LẬP TỨC khi lỡ nhấp vào một liên kết hoặc file đính kèm đáng ngờ là gì?',
        options: [
          'Tắt nguồn máy tính bằng nút nguồn vật lý',
          'Ngắt kết nối mạng (tắt Wi-Fi / rút cáp mạng) và thông báo ngay cho đội ngũ IT',
          'Chờ đợi 24 giờ xem có hiện thông báo lỗi nào không',
          'Xóa file đã tải về và không nói gì với ai'
        ],
        correctOptionIndex: 1,
        explanation: 'Ngắt kết nối mạng lập tức giúp chặn phần mềm độc hại gửi dữ liệu ra máy chủ của hacker hoặc lây lan sang các máy khác trong mạng nội bộ, đồng thời giữ nguyên bộ nhớ RAM để kỹ thuật viên kiểm tra.',
        difficulty: 'Beginner',
        hint: 'Cần cô lập thiết bị khỏi mạng Internet để cắt đứt liên lạc với kẻ tấn công.'
      },
      {
        id: 'vi-q2',
        question: 'Phương thức xác thực 2 yếu tố (2FA / MFA) nào sau đây mang lại mức độ an toàn cao nhất?',
        options: [
          'Nhận mã OTP qua tin nhắn SMS thông thường',
          'Câu hỏi bảo mật (ví dụ: tên trường cấp 1 của bạn)',
          'Ứng dụng tạo mã xác thực chuyên dụng (Google/Microsoft Authenticator) hoặc khóa bảo mật phần cứng FIDO2',
          'Gửi mã xác nhận về địa chỉ email cá nhân'
        ],
        correctOptionIndex: 2,
        explanation: 'Ứng dụng xác thực chuyên dụng và khóa bảo mật vật lý có khả năng chống lại tấn công chuyển hướng SIM (SIM swapping) và chặn bắt gói tin SMS.',
        difficulty: 'Intermediate',
        hint: 'SMS có thể bị kẻ xấu can thiệp hoặc chiếm đoạt SIM điện thoại.'
      },
      {
        id: 'vi-q3',
        question: 'Tại sao công nghệ AI tạo sinh lại khiến các cuộc tấn công lừa đảo (Phishing) trở nên nguy hiểm hơn trước?',
        options: [
          'AI có thể tự động bẻ khóa mật khẩu Wi-Fi không cần mã PIN',
          'AI giúp tạo ra email lừa đảo cực kỳ trau chuốt, không lỗi ngữ pháp và bắt chước hoàn hảo phong cách của đồng nghiệp',
          'AI tự động tắt phần mềm diệt virus trên máy tính của bạn',
          'AI tự ý thay đổi mật khẩu của bạn từ xa'
        ],
        correctOptionIndex: 1,
        explanation: 'Mô hình AI giúp kẻ gian soạn thảo các thông điệp có tính thuyết phục cao, chuẩn văn phong tiếng Việt và ngữ cảnh cụ thể, khiến nạn nhân rất khó phân biệt bằng mắt thường.',
        difficulty: 'Intermediate',
        hint: 'Hãy chú ý đến chất lượng ngôn ngữ và tính cá nhân hóa tinh vi của tin nhắn giả mạo.'
      }
    ]
  }
];

export const TOPIC_SUGGESTIONS_BY_LANG: Record<'fr' | 'en' | 'vi', string[]> = {
  fr: [
    'Cybersécurité en télétravail : Phishing & VPN',
    'IA Générative en Entreprise & Prompting',
    'Management d’Équipes Hybrides & Motivation',
    'Conformité RGPD & Protection des Données',
    'Gestion du Temps & Priorisation Agile',
    'Communication Non-Violente en Entreprise',
  ],
  en: [
    'Remote Work Cybersecurity: Phishing & VPNs',
    'Enterprise Generative AI & Prompt Engineering',
    'Hybrid Team Leadership & Employee Engagement',
    'Data Privacy & Compliance Governance',
    'Agile Time Management & Deep Work',
    'Non-Violent & High-Impact Business Communication',
  ],
  vi: [
    'An toàn thông tin & Kỹ năng làm việc từ xa',
    'Ứng dụng AI tạo sinh & Tối ưu hóa năng suất doanh nghiệp',
    'Kỹ năng lãnh đạo đội ngũ linh hoạt & Gắn kết nhân sự',
    'Bảo mật dữ liệu cá nhân & Tuân thủ quy định',
    'Quản trị thời gian & Phương pháp làm việc Agile',
    'Giao tiếp hiệu quả & Giải quyết xung đột nơi công sở',
  ],
};

export const INDUSTRIES_BY_LANG: Record<'fr' | 'en' | 'vi', string[]> = {
  fr: [
    'Général & Tertiaire',
    'Technologie & SaaS',
    'Banque & Assurance',
    'Santé & Médical',
    'Industrie & Logistique',
    'Retail & Luxe',
  ],
  en: [
    'General & Corporate Services',
    'Technology & SaaS',
    'Banking & Insurance',
    'Healthcare & Life Sciences',
    'Manufacturing & Logistics',
    'Retail & Consumer Goods',
  ],
  vi: [
    'Sản xuất & Vận tải Logistics',
    'Bán lẻ & Thương mại điện tử',
  ],
};

export const DEFAULT_COURSES = PRESET_COURSES;



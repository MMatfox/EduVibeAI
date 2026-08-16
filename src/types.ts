export interface VisualConcept {
  type: 'framework' | 'metric' | 'comparison' | 'flow' | 'takeaway' | 'quote';
  title: string;
  details: string[];
  badge?: string;
  metric?: string;
  metricLabel?: string;
  leftTitle?: string;
  leftPoints?: string[];
  rightTitle?: string;
  rightPoints?: string[];
}

export interface TrainerNotes {
  timeMinutes: number;
  keyTalkingPoints: string[];
  oralScript: string;
  interactivePrompt: string;
}

export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle: string;
  bullets: string[];
  categoryBadge?: string;
  visualConcept: VisualConcept;
  trainerNotes: TrainerNotes;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  hint: string;
}

export interface CourseTheme {
  id: 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate';
  name: string;
  primaryColor: string;
  accentColor: string;
  gradient: string;
  cardBg: string;
  borderAccent: string;
  badgeBg: string;
  badgeText: string;
  pptxPrimary: string;
  pptxSecondary: string;
  pptxBg: string;
}

export interface CoursePayload {
  id: string;
  title: string;
  subtitle?: string;
  tagline: string;
  description: string;
  topic: string;
  audienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  industry: string;
  estimatedDuration: number; // minutes
  themeId: CourseTheme['id'];
  slides: Slide[];
  quiz: QuizQuestion[];
  createdAt: string;
  groupId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedSlideNumber?: number;
}

// User & Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  company?: string;
  skills: string[];
  joinedAt: string;
  phone?: string;
  website?: string;
  linkedin?: string;
}

// Group Roles & Member Types
export type GroupRole = 'owner' | 'admin' | 'member';

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  bio?: string;
  skills?: string[];
  role: GroupRole;
  joinedAt: string;
}

export interface TrainingGroup {
  id: string;
  name: string;
  description: string;
  code: string; // 6-digit unique code like "CYBER9"
  icon: string;
  ownerId: string;
  members: GroupMember[];
  courseIds: string[];
  createdAt: string;
}

export function getSlideBullets(slide?: any): string[] {
  if (!slide) return [];
  const list = slide.bullets || slide.bulletPoints || slide.bullet_points || slide.points || slide.keyPoints || slide.items;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item: any) => (typeof item === 'string' ? item : item.point || item.text || item.title || JSON.stringify(item)));
  }
  if (typeof list === 'string' && list.trim()) {
    return list.split('\n').map((l: string) => l.replace(/^[•\-\*\d\.]+\s*/, '').trim()).filter(Boolean);
  }
  return [
    `Assimiler les principes clés et les objectifs prioritaires de ${slide.title || 'ce module'}.`,
    `Déployer la méthodologie standardisée pas-à-pas avec rigueur.`,
    `Identifier les pièges à éviter et adopter la posture d'excellence.`,
    `Valider la bonne exécution à travers des points de contrôle mesurables.`,
  ];
}

export function getSlideVisualConcept(slide?: any): VisualConcept {
  if (!slide) {
    return {
      type: 'takeaway',
      title: 'Concept Clé',
      badge: 'Point Clé',
      details: ['Méthode opérationnelle', 'Standards de qualité', 'Validation des acquis'],
    };
  }
  const vc = slide.visualConcept;
  if (typeof vc === 'string') {
    return {
      type: 'takeaway',
      title: slide.title || 'Concept Clé',
      badge: slide.categoryBadge || 'Point Clé',
      details: getSlideBullets(slide).slice(0, 3),
    };
  }
  if (vc && typeof vc === 'object') {
    const rawDetails = vc.details || vc.takeawayPoints || vc.components || vc.flowSteps || vc.points;
    const details = Array.isArray(rawDetails) && rawDetails.length > 0
      ? rawDetails.map((d: any) => (typeof d === 'string' ? d : d.title || d.point || d.text || JSON.stringify(d)))
      : getSlideBullets(slide).slice(0, 3);

    return {
      type: vc.type || 'takeaway',
      title: vc.title || slide.title || 'Concept Clé',
      badge: vc.badge || slide.categoryBadge || 'Point Clé',
      details,
      metric: vc.metric,
      metricLabel: vc.metricLabel,
      leftTitle: vc.leftTitle,
      leftPoints: vc.leftPoints,
      rightTitle: vc.rightTitle,
      rightPoints: vc.rightPoints,
    };
  }
  return {
    type: 'takeaway',
    title: slide.title || 'Concept Clé',
    badge: slide.categoryBadge || 'Point Clé',
    details: getSlideBullets(slide).slice(0, 3),
  };
}

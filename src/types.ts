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

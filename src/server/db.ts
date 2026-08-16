import fs from 'fs';
import path from 'path';
import { UserProfile, TrainingGroup, CoursePayload, GroupMember, GroupRole } from '../types';
import { PRESET_COURSES } from '../data/defaultCourses';

interface StoredUser extends UserProfile {
  passwordHash?: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  groups: TrainingGroup[];
  courses: CoursePayload[];
}

const DB_DIR = process.env.VERCEL ? '/tmp/eduvibe' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'eduvibe_db.json');

const INITIAL_USERS: StoredUser[] = [
  {
    id: 'user-1',
    name: 'Alexandre Martin',
    email: 'alexandre.martin@eduvibe.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Corporate Trainer & SecOps',
    bio: 'Formateur certifié avec plus de 8 ans d’expérience dans l’animation de sessions sur la cybersécurité et l’agilité opérationnelle.',
    company: 'EduVibe Solutions',
    skills: ['Cybersécurité', 'Pédagogie Interactive', 'Leadership', 'Prompt Engineering'],
    joinedAt: '2025-01-15',
    linkedin: 'linkedin.com/in/alexandre-martin',
    passwordHash: 'password123',
  },
  {
    id: 'user-2',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@company.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Chief Compliance & HR Officer',
    bio: 'Spécialiste de la formation continue et du développement des compétences RH en environnement hybride.',
    company: 'Nexus Corp',
    skills: ['Conformité RGPD', 'Management RH', 'Coaching'],
    joinedAt: '2025-02-10',
    passwordHash: 'password123',
  },
  {
    id: 'user-3',
    name: 'David Chen',
    email: 'david.chen@cybersec.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Cloud Security Architect',
    bio: 'Architecte cloud et formateur technique. Passionné par la vulgarisation des concepts Zero Trust.',
    company: 'SecOps Global',
    skills: ['AWS / Azure', 'Zero Trust', 'DevSecOps', 'Cryptographie'],
    joinedAt: '2025-03-01',
    passwordHash: 'password123',
  },
];

const INITIAL_GROUPS: TrainingGroup[] = [
  {
    id: 'group-cyber',
    name: 'Tech & Cybersecurity Academy',
    description: 'Pôle de formation dédié à la sécurité informatique, aux bonnes pratiques cloud et aux réflexes anti-phishing.',
    code: 'CYBER9',
    icon: '🛡️',
    ownerId: 'user-1',
    members: [
      {
        userId: 'user-1',
        name: 'Alexandre Martin',
        email: 'alexandre.martin@eduvibe.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: 'Lead Corporate Trainer & SecOps',
        bio: 'Formateur certifié avec plus de 8 ans d’expérience.',
        skills: ['Cybersécurité', 'Pédagogie Interactive', 'Leadership'],
        role: 'owner',
        joinedAt: '2025-01-15',
      },
      {
        userId: 'user-2',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@company.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        title: 'Chief Compliance & HR Officer',
        bio: 'Spécialiste de la formation continue.',
        skills: ['Conformité RGPD', 'Management RH'],
        role: 'admin',
        joinedAt: '2025-02-10',
      },
      {
        userId: 'user-3',
        name: 'David Chen',
        email: 'david.chen@cybersec.io',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        title: 'Cloud Security Architect',
        skills: ['AWS / Azure', 'Zero Trust'],
        role: 'member',
        joinedAt: '2025-03-01',
      },
    ],
    courseIds: ['preset-1', 'preset-3'],
    createdAt: '2025-01-15',
  },
  {
    id: 'group-leadership',
    name: 'Executive & Hybrid Leadership',
    description: 'Ateliers et formations interactives pour managers, directeurs et responsables d’équipes à distance.',
    code: 'LEAD84',
    icon: '🚀',
    ownerId: 'user-1',
    members: [
      {
        userId: 'user-1',
        name: 'Alexandre Martin',
        email: 'alexandre.martin@eduvibe.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: 'Lead Corporate Trainer & SecOps',
        role: 'owner',
        joinedAt: '2025-01-20',
      },
    ],
    courseIds: ['preset-2'],
    createdAt: '2025-01-20',
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create DB directory:', err);
      }
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_USERS,
          groups: parsed.groups || INITIAL_GROUPS,
          courses: parsed.courses || PRESET_COURSES,
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      groups: INITIAL_GROUPS,
      courses: PRESET_COURSES,
    };
    this.saveToDisk(defaultData);
    return defaultData;
  }

  private saveToDisk(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  // Auth & Users
  public getUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: Partial<UserProfile>, password?: string): StoredUser {
    const newUser: StoredUser = {
      id: user.id || `user-${Date.now()}`,
      name: user.name || 'Formateur EduVibe',
      email: (user.email || '').toLowerCase().trim(),
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: user.title || 'Concepteur Pédagogique',
      bio: user.bio || 'Formateur sur la plateforme EduVibe AI.',
      company: user.company || 'EduVibe Solutions',
      skills: user.skills || ['Formation', 'Cybersécurité'],
      joinedAt: user.joinedAt || new Date().toISOString().slice(0, 10),
      linkedin: user.linkedin || '',
      passwordHash: password || 'password123',
    };

    this.data.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfile>): StoredUser | null {
    const userIndex = this.data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    const current = this.data.users[userIndex];
    const updated: StoredUser = {
      ...current,
      ...updates,
      id: current.id,
      email: updates.email ? updates.email.toLowerCase().trim() : current.email,
    };

    this.data.users[userIndex] = updated;

    // Synchronize member profile details in all groups
    this.data.groups.forEach((g) => {
      g.members.forEach((m) => {
        if (m.userId === userId) {
          m.name = updated.name;
          m.avatar = updated.avatar;
          m.title = updated.title;
          m.bio = updated.bio;
          m.skills = updated.skills;
        }
      });
    });

    this.saveToDisk();
    return updated;
  }

  // Groups
  public getGroupsForUser(userId: string): TrainingGroup[] {
    return this.data.groups.filter((g) => g.members.some((m) => m.userId === userId));
  }

  public getAllGroups(): TrainingGroup[] {
    return this.data.groups;
  }

  public getGroupById(groupId: string): TrainingGroup | undefined {
    return this.data.groups.find((g) => g.id === groupId);
  }

  public getGroupByCode(code: string): TrainingGroup | undefined {
    const normalized = code.trim().toUpperCase();
    return this.data.groups.find((g) => g.code.toUpperCase() === normalized || g.id === normalized);
  }

  public createGroup(owner: UserProfile, name: string, description: string, icon: string): TrainingGroup {
    const cleanName = name.trim();
    const code = (cleanName.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900)).replace(/[^A-Z0-9]/g, 'G');

    const newGroup: TrainingGroup = {
      id: `group-${Date.now()}`,
      name: cleanName,
      description: description.trim(),
      code,
      icon: icon || '🛡️',
      ownerId: owner.id,
      members: [
        {
          userId: owner.id,
          name: owner.name,
          email: owner.email,
          avatar: owner.avatar,
          title: owner.title,
          bio: owner.bio,
          skills: owner.skills,
          role: 'owner',
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ],
      courseIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    this.data.groups.unshift(newGroup);
    this.saveToDisk();
    return newGroup;
  }

  public joinGroup(groupIdOrCode: string, user: UserProfile): { success: boolean; message: string; group?: TrainingGroup } {
    const group = this.getGroupByCode(groupIdOrCode) || this.getGroupById(groupIdOrCode);
    if (!group) {
      return { success: false, message: 'Groupe introuvable avec ce code ou identifiant.' };
    }

    const alreadyMember = group.members.some((m) => m.userId === user.id);
    if (alreadyMember) {
      return { success: true, message: `Vous faites déjà partie du groupe "${group.name}".`, group };
    }

    const newMember: GroupMember = {
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      bio: user.bio,
      skills: user.skills,
      role: 'member',
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    group.members.push(newMember);
    this.saveToDisk();
    return { success: true, message: `Bienvenue dans le groupe "${group.name}" !`, group };
  }

  public leaveGroup(groupId: string, userId: string): boolean {
    const group = this.getGroupById(groupId);
    if (!group) return false;

    group.members = group.members.filter((m) => m.userId !== userId);
    this.saveToDisk();
    return true;
  }

  public deleteGroup(groupId: string): boolean {
    const initLen = this.data.groups.length;
    this.data.groups = this.data.groups.filter((g) => g.id !== groupId);
    if (this.data.groups.length !== initLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public updateMemberRole(groupId: string, targetUserId: string, newRole: GroupRole): boolean {
    const group = this.getGroupById(groupId);
    if (!group) return false;

    const member = group.members.find((m) => m.userId === targetUserId);
    if (!member) return false;

    member.role = newRole;
    this.saveToDisk();
    return true;
  }

  public removeMember(groupId: string, targetUserId: string): boolean {
    const group = this.getGroupById(groupId);
    if (!group) return false;

    group.members = group.members.filter((m) => m.userId !== targetUserId);
    this.saveToDisk();
    return true;
  }

  // Courses
  public getAllCourses(): CoursePayload[] {
    return this.data.courses;
  }

  public saveCourse(course: CoursePayload): CoursePayload {
    const index = this.data.courses.findIndex((c) => c.id === course.id);
    if (index >= 0) {
      this.data.courses[index] = course;
    } else {
      this.data.courses.unshift(course);
    }
    this.saveToDisk();
    return course;
  }

  public deleteCourse(courseId: string): boolean {
    const initLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== courseId);
    if (this.data.courses.length !== initLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseManager();

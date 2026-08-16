import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TrainingGroup, GroupMember, GroupRole, CoursePayload } from '../types';

export const DEFAULT_USERS: UserProfile[] = [
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
  },
  {
    id: 'user-4',
    name: 'Camille Dupont',
    email: 'camille.dupont@innovate.org',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Instructional Designer & UX Specialist',
    bio: 'Créatrice de parcours immersifs et modules interactifs pour entreprises du Fortune 500.',
    company: 'EduVibe Studios',
    skills: ['Ingénierie Pédagogique', 'UX Design', 'Gamification'],
    joinedAt: '2025-03-12',
  },
];

export const DEFAULT_GROUPS: TrainingGroup[] = [
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
      {
        userId: 'user-4',
        name: 'Camille Dupont',
        email: 'camille.dupont@innovate.org',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        title: 'Instructional Designer & UX Specialist',
        role: 'member',
        joinedAt: '2025-03-12',
      },
    ],
    courseIds: ['preset-2'],
    createdAt: '2025-01-20',
  },
];

interface AuthAndGroupContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Groups
  groups: TrainingGroup[];
  userGroups: TrainingGroup[];
  activeGroup: TrainingGroup | null;
  setActiveGroup: (group: TrainingGroup | null) => void;
  createGroup: (name: string, description: string, icon: string) => TrainingGroup;
  joinGroupByCode: (code: string) => { success: boolean; message: string; group?: TrainingGroup };
  leaveGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  updateMemberRole: (groupId: string, targetUserId: string, newRole: GroupRole) => void;
  removeMember: (groupId: string, targetUserId: string) => void;

  // View Profile Modal State
  selectedViewProfile: UserProfile | null;
  setSelectedViewProfile: (profile: UserProfile | null) => void;
  openUserProfileById: (userId: string) => void;
}

const AuthAndGroupContext = createContext<AuthAndGroupContextType | undefined>(undefined);

export const AuthAndGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('eduvibe_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default to first profile Alexandre Martin on initial visit, or null
    return DEFAULT_USERS[0];
  });

  // Groups state
  const [groups, setGroups] = useState<TrainingGroup[]>(() => {
    try {
      const saved = localStorage.getItem('eduvibe_groups_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_GROUPS;
  });

  // Active Group state
  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('eduvibe_active_group_id');
      if (saved) return saved;
    } catch {}
    return DEFAULT_GROUPS[0].id;
  });

  // View Profile Modal
  const [selectedViewProfile, setSelectedViewProfile] = useState<UserProfile | null>(null);

  // Persist Current User
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduvibe_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eduvibe_current_user');
    }
  }, [currentUser]);

  // Persist Groups
  useEffect(() => {
    localStorage.setItem('eduvibe_groups_v3', JSON.stringify(groups));
  }, [groups]);

  // Persist Active Group Id
  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem('eduvibe_active_group_id', activeGroupId);
    } else {
      localStorage.removeItem('eduvibe_active_group_id');
    }
  }, [activeGroupId]);

  const login = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    // Also update member details across all groups where this user participates
    setGroups((prevGroups) =>
      prevGroups.map((g) => ({
        ...g,
        members: g.members.map((m) =>
          m.userId === currentUser.id
            ? {
                ...m,
                name: updated.name,
                avatar: updated.avatar,
                title: updated.title,
                bio: updated.bio,
                skills: updated.skills,
              }
            : m
        ),
      }))
    );
  };

  const userGroups = groups.filter((g) =>
    currentUser ? g.members.some((m) => m.userId === currentUser.id) : false
  );

  const activeGroup = groups.find((g) => g.id === activeGroupId) || userGroups[0] || null;

  const setActiveGroup = (group: TrainingGroup | null) => {
    setActiveGroupId(group ? group.id : null);
  };

  const createGroup = (name: string, description: string, icon: string = '💼'): TrainingGroup => {
    if (!currentUser) throw new Error('Not authenticated');

    const cleanName = name.trim();
    const code = (cleanName.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900)).replace(/[^A-Z0-9]/g, 'G');

    const newGroup: TrainingGroup = {
      id: `group-${Date.now()}`,
      name: cleanName,
      description: description.trim(),
      code,
      icon: icon || '👥',
      ownerId: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          title: currentUser.title,
          bio: currentUser.bio,
          skills: currentUser.skills,
          role: 'owner',
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ],
      courseIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
    return newGroup;
  };

  const joinGroupByCode = (codeToJoin: string): { success: boolean; message: string; group?: TrainingGroup } => {
    if (!currentUser) return { success: false, message: 'Veuillez vous connecter pour rejoindre un groupe.' };

    const normalizedCode = codeToJoin.trim().toUpperCase().replace(/.*[?&]join=/i, '');
    const foundGroup = groups.find((g) => g.code.toUpperCase() === normalizedCode || g.id === normalizedCode);

    if (!foundGroup) {
      return { success: false, message: `Aucun groupe trouvé avec le code ou lien "${codeToJoin}".` };
    }

    const alreadyMember = foundGroup.members.some((m) => m.userId === currentUser.id);
    if (alreadyMember) {
      setActiveGroupId(foundGroup.id);
      return { success: true, message: `Vous faites déjà partie du groupe "${foundGroup.name}".`, group: foundGroup };
    }

    const newMember: GroupMember = {
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
      title: currentUser.title,
      bio: currentUser.bio,
      skills: currentUser.skills,
      role: 'member',
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    const updatedGroup: TrainingGroup = {
      ...foundGroup,
      members: [...foundGroup.members, newMember],
    };

    setGroups((prev) => prev.map((g) => (g.id === foundGroup.id ? updatedGroup : g)));
    setActiveGroupId(updatedGroup.id);
    return { success: true, message: `Bienvenue dans le groupe "${foundGroup.name}" !`, group: updatedGroup };
  };

  const leaveGroup = (groupId: string) => {
    if (!currentUser) return;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: g.members.filter((m) => m.userId !== currentUser.id),
        };
      })
    );

    if (activeGroupId === groupId) {
      const remaining = userGroups.filter((g) => g.id !== groupId);
      setActiveGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (activeGroupId === groupId) {
      setActiveGroupId(null);
    }
  };

  const updateMemberRole = (groupId: string, targetUserId: string, newRole: GroupRole) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: g.members.map((m) => (m.userId === targetUserId ? { ...m, role: newRole } : m)),
        };
      })
    );
  };

  const removeMember = (groupId: string, targetUserId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: g.members.filter((m) => m.userId !== targetUserId),
        };
      })
    );
  };

  const openUserProfileById = (userId: string) => {
    // Search in default users or group members
    const foundInDefaults = DEFAULT_USERS.find((u) => u.id === userId);
    if (foundInDefaults) {
      setSelectedViewProfile(foundInDefaults);
      return;
    }
    for (const g of groups) {
      const mem = g.members.find((m) => m.userId === userId);
      if (mem) {
        setSelectedViewProfile({
          id: mem.userId,
          name: mem.name,
          email: mem.email,
          avatar: mem.avatar,
          title: mem.title || 'Membre de formation',
          bio: mem.bio || 'Membre actif du groupe EduVibe.',
          skills: mem.skills || ['Formation', 'Collaboration'],
          joinedAt: mem.joinedAt,
        });
        return;
      }
    }
  };

  return (
    <AuthAndGroupContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
        updateProfile,
        groups,
        userGroups,
        activeGroup,
        setActiveGroup,
        createGroup,
        joinGroupByCode,
        leaveGroup,
        deleteGroup,
        updateMemberRole,
        removeMember,
        selectedViewProfile,
        setSelectedViewProfile,
        openUserProfileById,
      }}
    >
      {children}
    </AuthAndGroupContext.Provider>
  );
};

export const useAuthAndGroup = (): AuthAndGroupContextType => {
  const context = useContext(AuthAndGroupContext);
  if (!context) {
    throw new Error('useAuthAndGroup must be used within an AuthAndGroupProvider');
  }
  return context;
};

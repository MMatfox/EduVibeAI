import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, TrainingGroup, GroupMember, GroupRole } from '../types';
import {
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logoutFirebase,
  updateFirestoreProfile,
  isFirebaseConfigured,
  checkRedirectResult,
  subscribeToAuthState,
  fetchFirestoreGroups,
  createFirestoreGroup,
} from '../services/firebase';

export const DEMO_PRESET_USERS: UserProfile[] = [
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
];

export const DEFAULT_TRAINING_GROUPS: TrainingGroup[] = [
  {
    id: 'grp-cyber-2026',
    name: 'Cybersécurité & SecOps Q1',
    description: 'Programme certifiant sur l’hygiène informatique, la protection des données sensibles et la détection du phishing.',
    icon: '🛡️',
    code: 'SEC-8921',
    ownerId: 'user-1',
    createdAt: '2025-02-01',
    members: [
      {
        userId: 'user-1',
        name: 'Alexandre Martin',
        email: 'alexandre.martin@eduvibe.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'owner',
        joinedAt: '2025-02-01',
        title: 'Lead Corporate Trainer & SecOps',
      },
      {
        userId: 'user-2',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@company.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        joinedAt: '2025-02-05',
        title: 'Chief Compliance & HR Officer',
      },
      {
        userId: 'user-3',
        name: 'David Chen',
        email: 'david.chen@cybersec.io',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        joinedAt: '2025-02-12',
        title: 'Cloud Security Architect',
      },
    ],
    courseIds: [],
  },
  {
    id: 'grp-ai-leadership',
    name: 'Executive AI & Transformation',
    description: 'Ateliers stratégiques pour décideurs sur l’impact de l’intelligence artificielle générative et l’automatisation.',
    icon: '⚡',
    code: 'AI-4092',
    ownerId: 'user-1',
    createdAt: '2025-02-15',
    members: [
      {
        userId: 'user-1',
        name: 'Alexandre Martin',
        email: 'alexandre.martin@eduvibe.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'owner',
        joinedAt: '2025-02-15',
        title: 'Lead Corporate Trainer & SecOps',
      },
      {
        userId: 'user-2',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@company.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        joinedAt: '2025-02-18',
        title: 'Chief Compliance & HR Officer',
      },
    ],
    courseIds: [],
  },
];

interface AuthAndGroupContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  loginWithCredentials: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (name?: string) => void;
  registerUser: (userData: Partial<UserProfile>, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Groups
  groups: TrainingGroup[];
  userGroups: TrainingGroup[];
  activeGroup: TrainingGroup | null;
  setActiveGroup: (group: TrainingGroup | null) => void;
  createGroup: (name: string, description: string, icon: string) => Promise<TrainingGroup | null>;
  joinGroupByCode: (code: string) => Promise<{ success: boolean; message: string; group?: TrainingGroup }>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  updateMemberRole: (groupId: string, targetUserId: string, newRole: GroupRole) => Promise<void>;
  removeMember: (groupId: string, targetUserId: string) => Promise<void>;

  // Profile View
  selectedViewProfile: UserProfile | null;
  setSelectedViewProfile: (profile: UserProfile | null) => void;
  openUserProfileById: (userId: string) => void;
}

const AuthAndGroupContext = createContext<AuthAndGroupContextType | undefined>(undefined);

export const AuthAndGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('eduvibe_auth_session_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    return isFirebaseConfigured() && !localStorage.getItem('eduvibe_auth_session_user');
  });

  const [groups, setGroups] = useState<TrainingGroup[]>(() => {
    try {
      const saved = localStorage.getItem('eduvibe_training_groups_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TRAINING_GROUPS;
  });

  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
    return localStorage.getItem('eduvibe_active_group_id');
  });

  const [selectedViewProfile, setSelectedViewProfile] = useState<UserProfile | null>(null);

  // Sync groups to localStorage
  const saveGroupsLocal = (updatedGroups: TrainingGroup[]) => {
    setGroups(updatedGroups);
    try {
      localStorage.setItem('eduvibe_training_groups_v3', JSON.stringify(updatedGroups));
    } catch {}
  };

  // Fetch groups from backend Database API & Firestore
  const refreshGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        if (data.groups && Array.isArray(data.groups)) {
          // Merge remote with local and deduplicate
          setGroups((prev) => {
            const map = new Map<string, TrainingGroup>();
            const seenOwnerGroupKeys = new Set<string>();

            const addUniqueGroup = (g: TrainingGroup) => {
              if (!g || !g.id) return;
              const ownerGroupKey = `${g.ownerId}_${g.name?.trim().toLowerCase()}`;
              if (map.has(g.id) || seenOwnerGroupKeys.has(ownerGroupKey)) return;
              map.set(g.id, g);
              seenOwnerGroupKeys.add(ownerGroupKey);
            };

            // Local user-created groups take precedence
            prev.forEach(addUniqueGroup);
            data.groups.forEach(addUniqueGroup);

            const merged = Array.from(map.values());
            try {
              localStorage.setItem('eduvibe_training_groups_v3', JSON.stringify(merged));
            } catch {}
            return merged;
          });
          return;
        }
      }
    } catch (err) {
      console.warn('API groups fetch fallback to local/firestore:', err);
    }

    if (isFirebaseConfigured()) {
      try {
        const fbGroups = await fetchFirestoreGroups();
        if (fbGroups && fbGroups.length > 0) {
          saveGroupsLocal(fbGroups);
        }
      } catch (err) {
        console.warn('Firestore groups fetch skipped:', err);
      }
    }
  }, []);

  useEffect(() => {
    refreshGroups();

    if (isFirebaseConfigured()) {
      checkRedirectResult()
        .then((user) => {
          if (user) {
            setCurrentUser(user);
            refreshGroups();
          }
        })
        .catch(console.warn)
        .finally(() => {
          setIsAuthLoading(false);
        });

      const unsubscribe = subscribeToAuthState((user) => {
        if (user) {
          setCurrentUser(user);
        }
        setIsAuthLoading(false);
      });

      const safetyTimer = setTimeout(() => {
        setIsAuthLoading(false);
      }, 2000);

      return () => {
        clearTimeout(safetyTimer);
        unsubscribe();
      };
    } else {
      setIsAuthLoading(false);
    }
  }, [refreshGroups]);

  // Persist session user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduvibe_auth_session_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eduvibe_auth_session_user');
    }
  }, [currentUser]);

  // Persist active group
  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem('eduvibe_active_group_id', activeGroupId);
    } else {
      localStorage.removeItem('eduvibe_active_group_id');
    }
  }, [activeGroupId]);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured()) {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        await refreshGroups();
        return { success: true };
      }
      return { success: false, error: result.error };
    }

    // Smart Fallback
    const demoGoogleUser: UserProfile = {
      id: `google-user-${Date.now()}`,
      name: 'Google Trainer',
      email: 'trainer.google@eduvibe.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Formateur Certifié Google',
      bio: 'Authentifié avec Google OAuth.',
      company: 'EduVibe AI Partner',
      skills: ['Google Workspace', 'Pédagogie Interactive', 'IA Générative'],
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    setCurrentUser(demoGoogleUser);
    await refreshGroups();
    return { success: true };
  };

  const loginWithCredentials = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = (email || '').trim().toLowerCase();

    // 1. Instant check for DEMO_PRESET_USERS
    const foundDemo = DEMO_PRESET_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (foundDemo) {
      setCurrentUser(foundDemo);
      await refreshGroups();
      return { success: true };
    }

    // 2. Firebase authentication
    if (isFirebaseConfigured() && password) {
      const fbRes = await loginWithEmail(email, password);
      if (fbRes.success && fbRes.user) {
        setCurrentUser(fbRes.user);
        await refreshGroups();
        return { success: true };
      }
    }

    // 3. Server Database Authentication
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        await refreshGroups();
        return { success: true };
      }
      return { success: false, error: data.error || 'Identifiants invalides' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Impossible de contacter le serveur.' };
    }
  };

  const loginAsGuest = (name: string = 'Formateur Invité') => {
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name,
      email: 'guest@eduvibe.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Formateur & Concepteur',
      bio: 'Session de formation EduVibe AI.',
      company: 'EduVibe Solutions',
      skills: ['Formation Interactive', 'Cybersécurité', 'Pédagogie'],
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    setCurrentUser(guestUser);
    refreshGroups();
  };

  const registerUser = async (userData: Partial<UserProfile>, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured() && userData.email && password) {
      const fbRes = await registerWithEmail(
        userData.name || 'Formateur EduVibe',
        userData.email,
        password,
        userData.title
      );
      if (fbRes.success && fbRes.user) {
        setCurrentUser(fbRes.user);
        await refreshGroups();
        return { success: true };
      }
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        await refreshGroups();
        return { success: true };
      }
      return { success: false, error: data.error || 'Erreur lors de la création' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    logoutFirebase();
    setCurrentUser(null);
    setActiveGroupId(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    if (isFirebaseConfigured()) {
      await updateFirestoreProfile(currentUser.id, updates);
    }
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...updates }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        await refreshGroups();
      }
    } catch (err) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  // Determine if the current session is a demo/guest preset account
  const isDemoAccount = Boolean(
    currentUser && (currentUser.id === 'user-1' || currentUser.id.startsWith('demo-'))
  );

  // Compute groups user is a member of (or all preset demo groups if on a demo account)
  const userGroups = useMemo(() => {
    if (!currentUser) return [];
    if (isDemoAccount) {
      return groups;
    }
    // Real authenticated user (Google / Email): ONLY show groups they own or belong to!
    return groups.filter(
      (g) =>
        g.ownerId === currentUser.id ||
        g.members.some(
          (m) =>
            m.userId === currentUser.id ||
            (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
        )
    );
  }, [groups, currentUser, isDemoAccount]);

  const activeGroup = useMemo(() => {
    if (userGroups.length === 0) return null;
    return userGroups.find((g) => g.id === activeGroupId) || userGroups[0] || null;
  }, [userGroups, activeGroupId]);

  const setActiveGroup = (group: TrainingGroup | null) => {
    setActiveGroupId(group ? group.id : null);
  };

  // Robust Create Group: local instant + remote background
  const createGroup = async (name: string, description: string, icon: string): Promise<TrainingGroup | null> => {
    if (!currentUser) return null;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const groupCode = `EV-${randomSuffix}`;

    const newGroup: TrainingGroup = {
      id: `grp-${Date.now()}-${randomSuffix.toLowerCase()}`,
      name: name.trim(),
      description: description.trim() || 'Groupe de formation collaboratif.',
      icon: icon || '🛡️',
      code: groupCode,
      ownerId: currentUser.id,
      createdAt: new Date().toISOString().slice(0, 10),
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          role: 'owner',
          joinedAt: new Date().toISOString().slice(0, 10),
          title: currentUser.title,
          bio: currentUser.bio,
          skills: currentUser.skills,
        },
      ],
      courseIds: [],
    };

    // 1. Instant local state & localStorage update
    const updated = [newGroup, ...groups];
    saveGroupsLocal(updated);
    setActiveGroupId(newGroup.id);

    // 2. Background Firestore sync
    if (isFirebaseConfigured()) {
      createFirestoreGroup(newGroup).catch(console.warn);
    }

    // 3. Background API sync
    try {
      fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: newGroup, owner: currentUser }),
      }).catch(console.warn);
    } catch {}

    return newGroup;
  };

  // Robust Join Group by Code: local lookup + remote fallback
  const joinGroupByCode = async (code: string): Promise<{ success: boolean; message: string; group?: TrainingGroup }> => {
    if (!currentUser) return { success: false, message: 'Veuillez vous connecter pour rejoindre un groupe.' };
    const cleanCode = code.trim().replace(/.*[?&]join=/i, '').toUpperCase();

    // 1. Check local groups first
    const foundGroupIndex = groups.findIndex((g) => g.code.toUpperCase() === cleanCode);
    if (foundGroupIndex !== -1) {
      const targetGroup = groups[foundGroupIndex];
      const isAlreadyMember = targetGroup.members.some((m) => m.userId === currentUser.id);

      if (!isAlreadyMember) {
        const newMember: GroupMember = {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          role: 'member',
          joinedAt: new Date().toISOString().slice(0, 10),
          title: currentUser.title,
          bio: currentUser.bio,
          skills: currentUser.skills,
        };

        const updatedGroup: TrainingGroup = {
          ...targetGroup,
          members: [...targetGroup.members, newMember],
        };

        const updatedGroups = [...groups];
        updatedGroups[foundGroupIndex] = updatedGroup;
        saveGroupsLocal(updatedGroups);
        setActiveGroupId(updatedGroup.id);

        if (isFirebaseConfigured()) {
          createFirestoreGroup(updatedGroup).catch(console.warn);
        }

        return { success: true, message: `Félicitations ! Vous avez rejoint le groupe "${updatedGroup.name}".`, group: updatedGroup };
      } else {
        setActiveGroupId(targetGroup.id);
        return { success: true, message: `Vous êtes déjà membre du groupe "${targetGroup.name}".`, group: targetGroup };
      }
    }

    // 2. Remote API check
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, user: currentUser }),
      });
      const data = await res.json();
      if (data.success && data.group) {
        const updated = [data.group, ...groups.filter((g) => g.id !== data.group.id)];
        saveGroupsLocal(updated);
        setActiveGroupId(data.group.id);
        return data;
      }
      return { success: false, message: data.error || 'Code de groupe introuvable.' };
    } catch (err: any) {
      return { success: false, message: 'Code de groupe invalide ou introuvable.' };
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.filter((m) => m.userId !== currentUser.id),
        };
      }
      return g;
    });

    saveGroupsLocal(updated);
    if (activeGroupId === groupId) {
      const remaining = updated.filter((g) => g.members.some((m) => m.userId === currentUser.id));
      setActiveGroupId(remaining[0]?.id || null);
    }

    try {
      fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      }).catch(console.warn);
    } catch {}
  };

  const deleteGroup = async (groupId: string) => {
    const updated = groups.filter((g) => g.id !== groupId);
    saveGroupsLocal(updated);
    if (activeGroupId === groupId) {
      setActiveGroupId(updated[0]?.id || null);
    }

    try {
      fetch(`/api/groups/${groupId}`, { method: 'DELETE' }).catch(console.warn);
    } catch {}
  };

  const updateMemberRole = async (groupId: string, targetUserId: string, newRole: GroupRole) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.map((m) => (m.userId === targetUserId ? { ...m, role: newRole } : m)),
        };
      }
      return g;
    });
    saveGroupsLocal(updated);

    try {
      fetch(`/api/groups/${groupId}/members/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      }).catch(console.warn);
    } catch {}
  };

  const removeMember = async (groupId: string, targetUserId: string) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.filter((m) => m.userId !== targetUserId),
        };
      }
      return g;
    });
    saveGroupsLocal(updated);

    try {
      fetch(`/api/groups/${groupId}/members/${targetUserId}`, { method: 'DELETE' }).catch(console.warn);
    } catch {}
  };

  const openUserProfileById = (userId: string) => {
    const foundDemo = DEMO_PRESET_USERS.find((u) => u.id === userId);
    if (foundDemo) {
      setSelectedViewProfile(foundDemo);
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
          title: mem.title || 'Membre EduVibe',
          bio: mem.bio || 'Formateur / Participant EduVibe.',
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
        isAuthLoading,
        loginWithCredentials,
        loginWithGoogle,
        loginAsGuest,
        registerUser,
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

export const useAuthAndGroup = () => {
  const context = useContext(AuthAndGroupContext);
  if (!context) {
    throw new Error('useAuthAndGroup must be used within an AuthAndGroupProvider');
  }
  return context;
};

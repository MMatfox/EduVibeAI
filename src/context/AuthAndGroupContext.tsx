import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refreshGroups: () => Promise<void>;
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

  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
    return localStorage.getItem('eduvibe_active_group_id');
  });

  const [selectedViewProfile, setSelectedViewProfile] = useState<UserProfile | null>(null);

  // Fetch groups from backend Database API
  const refreshGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (data.groups && Array.isArray(data.groups)) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch groups from DB:', err);
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
      }, 2500);

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

  // Persist active group ID
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
      if (result.success) {
        if (result.user) {
          setCurrentUser(result.user);
          await refreshGroups();
        }
        return { success: true };
      }
      return { success: false, error: result.error };
    }

    // Smart Fallback when Firebase config is not yet entered in .env
    const demoGoogleUser: UserProfile = {
      id: `google-user-${Date.now()}`,
      name: 'Google Trainer',
      email: 'trainer.google@example.com',
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

    // 1. Instant check for DEMO_PRESET_USERS (zero latency, offline/online resilient)
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

  const userGroups = groups.filter((g) =>
    currentUser ? g.members.some((m) => m.userId === currentUser.id) : false
  );

  const activeGroup = groups.find((g) => g.id === activeGroupId) || userGroups[0] || null;

  const setActiveGroup = (group: TrainingGroup | null) => {
    setActiveGroupId(group ? group.id : null);
  };

  const createGroup = async (name: string, description: string, icon: string): Promise<TrainingGroup | null> => {
    if (!currentUser) return null;
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, icon, owner: currentUser }),
      });
      const data = await res.json();
      if (res.ok && data.group) {
        await refreshGroups();
        setActiveGroupId(data.group.id);
        return data.group;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const joinGroupByCode = async (code: string): Promise<{ success: boolean; message: string; group?: TrainingGroup }> => {
    if (!currentUser) return { success: false, message: 'Veuillez vous connecter pour rejoindre un groupe.' };
    try {
      const cleanCode = code.trim().replace(/.*[?&]join=/i, '');
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, user: currentUser }),
      });
      const data = await res.json();
      if (data.success && data.group) {
        await refreshGroups();
        setActiveGroupId(data.group.id);
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur lors de la tentative d’adhésion.' };
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      await refreshGroups();
      if (activeGroupId === groupId) {
        const remaining = userGroups.filter((g) => g.id !== groupId);
        setActiveGroupId(remaining[0]?.id || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
      await refreshGroups();
      if (activeGroupId === groupId) {
        setActiveGroupId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateMemberRole = async (groupId: string, targetUserId: string, newRole: GroupRole) => {
    try {
      await fetch(`/api/groups/${groupId}/members/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      await refreshGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const removeMember = async (groupId: string, targetUserId: string) => {
    try {
      await fetch(`/api/groups/${groupId}/members/${targetUserId}`, { method: 'DELETE' });
      await refreshGroups();
    } catch (err) {
      console.error(err);
    }
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
        refreshGroups,
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

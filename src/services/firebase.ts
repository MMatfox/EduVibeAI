import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Firestore,
} from 'firebase/firestore';
import { UserProfile, TrainingGroup, GroupMember, GroupRole, CoursePayload } from '../types';

// Read config from env or localStorage
const getFirebaseConfig = () => {
  const env = ((import.meta as any).env || {}) as Record<string, string>;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || localStorage.getItem('eduvibe_fb_api_key') || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || localStorage.getItem('eduvibe_fb_auth_domain') || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || localStorage.getItem('eduvibe_fb_project_id') || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || localStorage.getItem('eduvibe_fb_storage_bucket') || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || localStorage.getItem('eduvibe_fb_messaging_sender_id') || '',
    appId: env.VITE_FIREBASE_APP_ID || localStorage.getItem('eduvibe_fb_app_id') || '',
  };
};

export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.apiKey !== 'YOUR_FIREBASE_API_KEY');
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
const googleProvider = new GoogleAuthProvider();

try {
  const config = getFirebaseConfig();
  if (config.apiKey && config.projectId && config.apiKey !== 'YOUR_FIREBASE_API_KEY') {
    app = !getApps().length ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase initialization skipped or failed:', error);
}

export { auth, db, googleProvider };

// 1. Google Sign-In
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  if (!auth || !db) {
    return {
      success: false,
      error: 'Firebase n’est pas encore configuré. Renseignez vos identifiants Firebase dans le fichier .env (voir instructions).',
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    // Check if user document already exists in Firestore
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);

    let profile: UserProfile;
    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
    } else {
      // Create new profile from Google Auth
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Utilisateur Google',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: 'Formateur & Concepteur',
        bio: 'Connecté avec un compte Google certifié sur EduVibe AI.',
        company: 'EduVibe Solutions',
        skills: ['Formation Interactive', 'Cybersécurité'],
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      await setDoc(userRef, profile);
    }

    return { success: true, user: profile };
  } catch (err: any) {
    console.error('Google Auth error:', err);
    return { success: false, error: err.message || 'Échec de la connexion Google' };
  }
};

// 2. Email & Password Sign Up
export const registerWithEmail = async (
  name: string,
  email: string,
  pass: string,
  title?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  if (!auth || !db) {
    return {
      success: false,
      error: 'Firebase non configuré. Veuillez compléter les clés VITE_FIREBASE_* dans votre .env.',
    };
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const profile: UserProfile = {
      id: res.user.uid,
      name: name.trim() || 'Formateur EduVibe',
      email: email.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: title?.trim() || 'Concepteur Pédagogique',
      bio: 'Passionné par la conception et l’animation de formations immersives.',
      company: 'EduVibe Solutions',
      skills: ['Formation Interactive', 'Pédagogie'],
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    await setDoc(doc(db, 'users', res.user.uid), profile);
    return { success: true, user: profile };
  } catch (err: any) {
    console.error('Firebase Register error:', err);
    let msg = err.message;
    if (err.code === 'auth/email-already-in-use') msg = 'Cette adresse email est déjà associée à un compte.';
    if (err.code === 'auth/weak-password') msg = 'Le mot de passe doit comporter au moins 6 caractères.';
    return { success: false, error: msg };
  }
};

// 3. Email & Password Sign In
export const loginWithEmail = async (
  email: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  if (!auth || !db) {
    return {
      success: false,
      error: 'Firebase non configuré.',
    };
  }

  try {
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const userSnap = await getDoc(doc(db, 'users', res.user.uid));
    if (userSnap.exists()) {
      return { success: true, user: userSnap.data() as UserProfile };
    }
    const fallbackProfile: UserProfile = {
      id: res.user.uid,
      name: res.user.displayName || email.split('@')[0],
      email: res.user.email || email,
      avatar: res.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Formateur',
      bio: 'Membre EduVibe AI.',
      skills: ['Formation'],
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    return { success: true, user: fallbackProfile };
  } catch (err: any) {
    let msg = err.message;
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      msg = 'Identifiants invalides (email ou mot de passe incorrect).';
    }
    return { success: false, error: msg };
  }
};

// 4. Logout
export const logoutFirebase = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

// 5. Update Profile in Firestore
export const updateFirestoreProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (err) {
    console.error('Failed to update Firestore profile:', err);
  }
};

// 6. Firestore Groups Sync
export const fetchFirestoreGroups = async (): Promise<TrainingGroup[]> => {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'groups'));
    const groups: TrainingGroup[] = [];
    querySnapshot.forEach((docSnap) => {
      groups.push(docSnap.data() as TrainingGroup);
    });
    return groups;
  } catch (err) {
    console.error('Failed to fetch Firestore groups:', err);
    return [];
  }
};

export const createFirestoreGroup = async (group: TrainingGroup): Promise<void> => {
  if (!db) return;
  try {
    await setDoc(doc(db, 'groups', group.id), group);
  } catch (err) {
    console.error('Failed to save group to Firestore:', err);
  }
};

import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Presentation,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { useAuthAndGroup, DEFAULT_USERS } from '../context/AuthAndGroupContext';
import { UserProfile } from '../types';

export const AuthScreen: React.FC = () => {
  const { login } = useAuthAndGroup();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (isRegisterMode) {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim() || 'Formateur EduVibe',
        email: email.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: title.trim() || 'Concepteur Pédagogique',
        bio: 'Passionné par la transmission du savoir et les nouvelles méthodes interactives.',
        skills: ['Formation', 'Pédagogie Interactive'],
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      login(newUser);
    } else {
      // Find matching demo user or create session user
      const found = DEFAULT_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        login(found);
      } else {
        const customUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          title: 'Formateur & Concepteur',
          bio: 'Membre actif EduVibe AI.',
          skills: ['Formation', 'Cybersécurité'],
          joinedAt: new Date().toISOString().slice(0, 10),
        };
        login(customUser);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Background glowing orbs */}
      <div className="absolute top-0 left-1/4 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-20 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6 relative z-10 text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            EduVibe AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Plateforme de conception pédagogique avec IA Gemini, animation live & espaces de formation en équipe.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          {/* Quick Demo Switcher */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Accès Rapide • Comptes de démonstration :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_USERS.slice(0, 2).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => login(u)}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 transition text-left cursor-pointer group"
                >
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 truncate">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{u.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Ou connectez-vous avec vos identifiants
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Nom Complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Alexandre Martin"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Poste / Rôle Professionnel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Formateur Cyber & IA"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{isRegisterMode ? 'Créer mon compte' : 'Accéder à la plateforme'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
            >
              {isRegisterMode
                ? 'Déjà inscrit ? Se connecter'
                : 'Pas encore de compte ? Créer un profil formateur'}
            </button>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-slate-500 text-[11px]">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sécurité & Rôles Admin</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Groupes & Équipes</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Gemini AI Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

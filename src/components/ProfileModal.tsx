import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Briefcase,
  Sparkles,
  Camera,
  Check,
  Plus,
  Trash2,
  Linkedin,
  Shield,
  Building,
  Calendar,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuthAndGroup } from '../context/AuthAndGroupContext';
import { useLanguage } from '../context/LanguageContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile?: UserProfile | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
}) => {
  const { currentUser, updateProfile, userGroups } = useAuthAndGroup();
  const { language } = useLanguage();

  const isEditingOwnProfile = !targetProfile || targetProfile.id === currentUser?.id;
  const profileToDisplay = isEditingOwnProfile ? currentUser : targetProfile;

  // Edit fields buffer
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profileToDisplay) {
      setName(profileToDisplay.name || '');
      setEmail(profileToDisplay.email || '');
      setTitle(profileToDisplay.title || '');
      setBio(profileToDisplay.bio || '');
      setCompany(profileToDisplay.company || '');
      setAvatar(profileToDisplay.avatar || PRESET_AVATARS[0]);
      setSkills(profileToDisplay.skills || []);
      setLinkedin(profileToDisplay.linkedin || '');
      setSavedSuccess(false);
    }
  }, [profileToDisplay, isOpen]);

  if (!isOpen || !profileToDisplay) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatar(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!isEditingOwnProfile) return;

    await updateProfile({
      name: name.trim() || currentUser?.name,
      email: email.trim() || currentUser?.email,
      title: title.trim(),
      bio: bio.trim(),
      company: company.trim(),
      avatar,
      skills,
      linkedin: linkedin.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner Cover Top */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative p-4 flex justify-between items-start">
          <span className="text-xs uppercase tracking-widest text-indigo-200 font-bold bg-indigo-900/40 px-3 py-1 rounded-full backdrop-blur-xs">
            {isEditingOwnProfile ? 'Mon Profil Professionnel' : 'Profil Membre'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 pt-0 space-y-6 overflow-y-auto">
          {/* Avatar & Header Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14">
            <div className="relative group">
              <img
                src={avatar || PRESET_AVATARS[0]}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-slate-100"
              />
              {isEditingOwnProfile && (
                <label className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Changer</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">{profileToDisplay.name}</h2>
              <p className="text-xs font-semibold text-indigo-600">{profileToDisplay.title || 'Formateur & Concepteur'}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3 h-3" />
                <span>{profileToDisplay.email}</span>
              </p>
            </div>
          </div>

          {/* If Editing Own Profile: Preset Avatars Picker */}
          {isEditingOwnProfile && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Ou choisir une photo prédéfinie :
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((avUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(avUrl)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${
                      avatar === avUrl ? 'border-indigo-600 ring-2 ring-indigo-500 scale-105' : 'border-slate-200 hover:opacity-80'
                    }`}
                  >
                    <img src={avUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields if Editing */}
          {isEditingOwnProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nom complet *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    placeholder="Ex: Alexandre Martin"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Titre / Rôle professionnel</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    placeholder="Ex: Lead Trainer Cybersécurité"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Entreprise / Organisation</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    placeholder="Ex: EduVibe Corp"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lien LinkedIn / Site</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    placeholder="linkedin.com/in/mon-profil"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bio / Présentation</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  placeholder="Décrivez votre expertise, vos méthodes d'animation pédagogique..."
                />
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Compétences & Spécialités</label>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                    placeholder="Ajouter une compétence (ex: Zero Trust, IA)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* View-Only Mode for Other Members */
            <div className="space-y-5">
              {profileToDisplay.bio && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">À propos</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{profileToDisplay.bio}</p>
                </div>
              )}

              {profileToDisplay.company && (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">{profileToDisplay.company}</span>
                </div>
              )}

              {profileToDisplay.skills && profileToDisplay.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Compétences</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profileToDisplay.skills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>Membre EduVibe depuis {profileToDisplay.joinedAt || '2025'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {savedSuccess ? '✅ Profil mis à jour !' : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Fermer
            </button>
            {isEditingOwnProfile && (
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Link,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  LogOut,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  MoreVertical,
  X,
  UserCheck
} from 'lucide-react';
import { useAuthAndGroup } from '../context/AuthAndGroupContext';
import { TrainingGroup, GroupRole, GroupMember } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const GroupsDashboard: React.FC = () => {
  const {
    currentUser,
    userGroups,
    activeGroup,
    setActiveGroup,
    createGroup,
    joinGroupByCode,
    leaveGroup,
    deleteGroup,
    updateMemberRole,
    removeMember,
    openUserProfileById,
  } = useAuthAndGroup();
  const { language } = useLanguage();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('🛡️');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const isCurrentOwner = activeGroup?.ownerId === currentUser?.id;
  const currentMemberRecord = activeGroup?.members.find((m) => m.userId === currentUser?.id);
  const isCurrentAdminOrOwner = isCurrentOwner || currentMemberRecord?.role === 'admin';

  const handleCopyCode = () => {
    if (!activeGroup) return;
    navigator.clipboard.writeText(activeGroup.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = () => {
    if (!activeGroup) return;
    const url = `${window.location.origin}/?join=${activeGroup.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await createGroup(newGroupName, newGroupDesc, newGroupIcon);
    setNewGroupName('');
    setNewGroupDesc('');
    setIsCreateModalOpen(false);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const result = await joinGroupByCode(joinCodeInput);
    setJoinStatus(result);
    if (result.success) {
      setTimeout(() => {
        setJoinCodeInput('');
        setJoinStatus(null);
        setIsJoinModalOpen(false);
      }, 1200);
    }
  };

  const handleLeaveGroup = () => {
    if (!activeGroup) return;
    if (isCurrentOwner && activeGroup.members.length > 1) {
      alert('En tant que créateur, veuillez transférer la propriété ou supprimer le groupe.');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir quitter le groupe "${activeGroup.name}" ?`)) {
      leaveGroup(activeGroup.id);
    }
  };

  const handleDeleteGroup = () => {
    if (!activeGroup) return;
    if (confirm(`Supprimer définitivement le groupe "${activeGroup.name}" ? Tous les membres perdront l'accès.`)) {
      deleteGroup(activeGroup.id);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Espace Équipes & Groupes de Formation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mes Groupes de Formation ({userGroups.length})
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Collaborez avec vos formateurs et apprenants, partagez vos modules de formation et administrez les accès en toute sécurité.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>Rejoindre avec un code</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un groupe</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Group Cards List + Right Active Group Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Cols: Groups Selector List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Vos Équipes</span>
            <span>{userGroups.length} groupe(s)</span>
          </div>

          {userGroups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Aucun groupe pour le moment</h4>
              <p className="text-xs text-slate-500">Rejoignez un groupe avec un code d'invitation ou créez le vôtre !</p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Créer mon premier groupe
                </button>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Rejoindre avec un code
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userGroups.map((grp) => {
                const isActive = activeGroup?.id === grp.id;
                const userRole = grp.members.find((m) => m.userId === currentUser?.id)?.role || 'member';

                return (
                  <div
                    key={grp.id}
                    onClick={() => setActiveGroup(grp)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                      isActive
                        ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                          {grp.icon || '👥'}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{grp.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              userRole === 'owner'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : userRole === 'admin'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {userRole === 'owner' ? '👑 Créateur' : userRole === 'admin' ? '🛡️ Admin' : '👤 Membre'}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {grp.description || 'Groupe de formation collaboratif.'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {grp.members.slice(0, 4).map((m, i) => (
                          <img
                            key={i}
                            src={m.avatar}
                            alt={m.name}
                            className="w-6 h-6 rounded-full object-cover border-2 border-white"
                          />
                        ))}
                      </div>
                      <span className="font-medium text-slate-600">{grp.members.length} membre(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Active Group Detail Cockpit */}
        {activeGroup ? (
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in">
            {/* Header with Title, Code & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3.5">
                <span className="text-4xl p-3 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-2xs">
                  {activeGroup.icon || '🛡️'}
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{activeGroup.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeGroup.description}</p>
                </div>
              </div>

              {/* Code & Link actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold border border-slate-200 transition cursor-pointer"
                  title="Copier le code à 6 caractères"
                >
                  <span className="text-slate-400 font-sans text-[10px]">Code :</span>
                  <span>{activeGroup.code}</span>
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                <button
                  onClick={handleCopyInviteLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition cursor-pointer"
                  title="Copier le lien d'invitation direct"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Lien copié !' : 'Lien d’invitation'}</span>
                </button>
              </div>
            </div>

            {/* Members Directory */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Membres du groupe ({activeGroup.members.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Cliquez sur un profil pour voir ses détails
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeGroup.members.map((member) => {
                  const isMe = member.userId === currentUser?.id;
                  const isMemberOwner = member.role === 'owner';
                  const isMemberAdmin = member.role === 'admin';

                  return (
                    <div
                      key={member.userId}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between gap-3 shadow-2xs"
                    >
                      {/* Left: Avatar & Info clickable to view Profile */}
                      <div
                        onClick={() => openUserProfileById(member.userId)}
                        className="flex items-center gap-3 cursor-pointer group flex-1"
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-500 transition"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                              {member.name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] text-slate-400 font-normal">(Vous)</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {member.title || 'Membre de formation'}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full inline-block ${
                              isMemberOwner
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isMemberAdmin
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-200/80 text-slate-700'
                            }`}
                          >
                            {isMemberOwner ? '👑 Créateur' : isMemberAdmin ? '🛡️ Admin' : '👤 Membre'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Creator/Admin Role Controls */}
                      {isCurrentOwner && !isMemberOwner && (
                        <div className="flex items-center gap-1">
                          {isMemberAdmin ? (
                            <button
                              onClick={() => updateMemberRole(activeGroup.id, member.userId, 'member')}
                              className="text-[11px] px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer font-medium"
                              title="Rétrograder au rôle Membre"
                            >
                              Retirer Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => updateMemberRole(activeGroup.id, member.userId, 'admin')}
                              className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer font-bold flex items-center gap-1"
                              title="Nommer Administrateur du groupe"
                            >
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              <span>Promouvoir Admin</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Retirer ${member.name} du groupe ?`)) {
                                removeMember(activeGroup.id, member.userId);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Retirer du groupe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Group Management Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Groupe créé le {activeGroup.createdAt} • ID: {activeGroup.id}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLeaveGroup}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Quitter ce groupe</span>
                </button>

                {isCurrentOwner && (
                  <button
                    onClick={handleDeleteGroup}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer le groupe</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Sélectionnez un groupe</h3>
            <p className="text-xs text-slate-500">Choisissez un groupe dans la colonne de gauche pour afficher ses membres et ses paramètres.</p>
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Créer un Nouveau Groupe</h3>
                  <p className="text-xs text-slate-500">Vous en serez automatiquement le Créateur / Propriétaire</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nom du groupe *</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Pôle Sécurité & IA 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description pédagogique</label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Objectifs du groupe, public cible, thématiques abordées..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Icône du groupe</label>
                <div className="flex items-center gap-2">
                  {['🛡️', '🚀', '💼', '🎓', '🤖', '⚡', '🌟', '📊'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewGroupIcon(emoji)}
                      className={`text-xl p-2 rounded-xl border transition cursor-pointer ${
                        newGroupIcon === emoji ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Créer le groupe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN GROUP MODAL */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Rejoindre un Groupe</h3>
                  <p className="text-xs text-slate-500">Entrez le code ou collez le lien d'invitation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setJoinStatus(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Code du groupe (6 caractères) ou Lien
                </label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Ex: CYBER9 ou https://eduvibe.ai/?join=CYBER9"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              {joinStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    joinStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {joinStatus.message}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Rejoindre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

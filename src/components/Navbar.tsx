import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Presentation,
  Video,
  HelpCircle,
  Download,
  Bot,
  ChevronDown,
  Settings,
  Key,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Check,
  Globe,
  BookOpen
} from 'lucide-react';
import { CoursePayload } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuthAndGroup } from '../context/AuthAndGroupContext';

interface NavbarProps {
  activeTab: 'generator' | 'courses' | 'slides' | 'classroom' | 'quiz' | 'groups';
  setActiveTab: (tab: 'generator' | 'courses' | 'slides' | 'classroom' | 'quiz' | 'groups') => void;
  currentCourse: CoursePayload;
  coursesList: CoursePayload[];
  onSelectCourse: (course: CoursePayload) => void;
  onExportPPTX: () => void;
  isExporting: boolean;
  onToggleTutor: () => void;
  isTutorOpen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  sessionCode: string;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  hasCustomKey?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentCourse,
  coursesList,
  onExportPPTX,
  isExporting,
  onToggleTutor,
  isTutorOpen,
  onOpenSettings,
  onOpenProfile,
  hasCustomKey = false,
}) => {
  const { language, setLanguage, t, supportedLanguages, currentLanguageInfo } = useLanguage();
  const { currentUser, logout, userGroups, activeGroup, setActiveGroup } = useAuthAndGroup();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
        setIsGroupMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'generator' as const, label: t('nav.generator'), icon: Sparkles },
    { id: 'courses' as const, label: t('nav.courses'), icon: BookOpen, badge: coursesList.length },
    { id: 'slides' as const, label: t('nav.slides'), icon: Presentation, badge: currentCourse?.slides?.length },
    { id: 'classroom' as const, label: t('nav.classroom'), icon: Video, live: true },
    { id: 'quiz' as const, label: t('nav.quiz'), icon: HelpCircle, badge: currentCourse?.quiz?.length },
    { id: 'groups' as const, label: t('nav.groups'), icon: Users, badge: userGroups.length },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Active Group Pill */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden min-[480px]:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  EduVibe
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
            </div>
          </div>

          {/* Active Group Switcher Pill */}
          {activeGroup && (
            <div className="relative hidden md:block" ref={groupMenuRef}>
              <button
                onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
                title="Changer d'équipe ou de groupe de formation"
              >
                <span>{activeGroup.icon || '👥'}</span>
                <span className="max-w-[100px] lg:max-w-[130px] truncate">{activeGroup.name}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isGroupMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGroupMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Vos Espaces de Formation
                  </div>
                  {userGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setActiveGroup(g);
                        setIsGroupMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        activeGroup.id === g.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{g.icon || '👥'}</span>
                        <span className="truncate">{g.name}</span>
                      </span>
                      {activeGroup.id === g.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setActiveTab('groups');
                        setIsGroupMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-indigo-600 font-bold hover:bg-indigo-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Gérer tous les groupes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Clean Segmented Navigation Bar (Desktop/Tablet) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.live && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {typeof item.badge === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Language & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Export to PPTX */}
          <button
            id="btn-navbar-export-pptx"
            onClick={onExportPPTX}
            disabled={isExporting}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs disabled:opacity-50 transition cursor-pointer"
            title="Exporter la présentation PowerPoint (.pptx)"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden xl:inline">{isExporting ? t('nav.exporting') : 'PPTX'}</span>
          </button>

          {/* AI Tutor Assistant Toggle */}
          <button
            id="btn-toggle-ai-tutor"
            onClick={onToggleTutor}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isTutorOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={t('nav.aiCoach')}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Coach IA</span>
          </button>

          {/* 3-Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="btn-language-selector"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title={t('nav.language')}
            >
              <span className="text-sm">{currentLanguageInfo.flag}</span>
              <span className="hidden xl:inline text-[11px] font-bold">{currentLanguageInfo.code.toUpperCase()}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition cursor-pointer ${
                      language === lang.code
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {language === lang.code && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings Modal Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition cursor-pointer relative"
            title="Paramètres & Clé API Gemini"
          >
            <Settings className="w-4 h-4" />
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 ring-1 ring-white" />
            )}
          </button>

          {/* User Profile Avatar Dropdown */}
          {currentUser && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center p-0.5 rounded-xl hover:ring-2 hover:ring-indigo-400 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200 bg-slate-100"
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {currentUser.title || 'Formateur'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenProfile();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Modifier mon profil</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('groups');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mes groupes ({userGroups.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSettings();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Clé API & Paramètres IA</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button (<lg screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            title="Ouvrir le menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.live && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                {typeof item.badge === 'number' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onExportPPTX();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter PPTX</span>
            </button>

            {activeGroup && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span>{activeGroup.icon}</span>
                <span className="font-semibold truncate max-w-[140px]">{activeGroup.name}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

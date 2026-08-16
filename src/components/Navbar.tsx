import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Presentation,
  Video,
  HelpCircle,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Bot,
  Copy,
  Check,
  BookOpen,
  Globe,
  ChevronDown,
  Settings,
  Zap,
  Key,
  Users,
  User,
  LogOut,
  UserCheck
} from 'lucide-react';
import { CoursePayload } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';
import { useAuthAndGroup } from '../context/AuthAndGroupContext';

interface NavbarProps {
  activeTab: 'generator' | 'slides' | 'classroom' | 'quiz' | 'groups';
  setActiveTab: (tab: 'generator' | 'slides' | 'classroom' | 'quiz' | 'groups') => void;
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
  onSelectCourse,
  onExportPPTX,
  isExporting,
  onToggleTutor,
  isTutorOpen,
  isFullscreen,
  onToggleFullscreen,
  sessionCode,
  onOpenSettings,
  onOpenProfile,
  hasCustomKey = false,
}) => {
  const { language, setLanguage, t, supportedLanguages, currentLanguageInfo } = useLanguage();
  const { currentUser, logout, userGroups, activeGroup, setActiveGroup } = useAuthAndGroup();

  const [copiedSession, setCopiedSession] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);

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

  const copySessionLink = () => {
    navigator.clipboard.writeText(`https://eduvibe.ai/room/${sessionCode}`);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                {t('app.title')}
              </span>
              <span className="text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('app.suiteBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-normal">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
          <button
            id="nav-tab-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">{t('nav.generator')}</span>
          </button>

          <button
            id="nav-tab-slides"
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'slides'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>{t('nav.slides')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'slides' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {currentCourse.slides.length}
            </span>
          </button>

          <button
            id="nav-tab-classroom"
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{t('nav.classroom')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5 hidden sm:block" />
          </button>

          <button
            id="nav-tab-quiz"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('nav.quiz')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'quiz' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {currentCourse.quiz.length}
            </span>
          </button>

          <button
            id="nav-tab-groups"
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('nav.groups')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'groups' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {userGroups.length}
            </span>
          </button>
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Active Group Badge & Switcher */}
          {activeGroup && (
            <div className="relative hidden xl:block" ref={groupMenuRef}>
              <button
                onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-200/80 transition cursor-pointer"
                title="Changer de groupe actif"
              >
                <span>{activeGroup.icon || '👥'}</span>
                <span className="max-w-[110px] truncate">{activeGroup.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isGroupMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Vos Groupes de Formation
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

          {/* 3-Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="btn-language-selector"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-200/70 transition shadow-2xs cursor-pointer"
              title={t('nav.language')}
            >
              <span className="text-base leading-none">{currentLanguageInfo.flag}</span>
              <span className="hidden sm:inline font-medium">{currentLanguageInfo.nativeName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  {t('nav.language')}
                </div>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    id={`lang-option-${lang.code}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export to PPTX Button */}
          <button
            id="btn-navbar-export-pptx"
            onClick={onExportPPTX}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
            title="Download PowerPoint PPTX"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">
              {isExporting ? t('nav.exporting') : t('nav.exportPptx')}
            </span>
          </button>

          {/* AI Tutor Assistant Toggle */}
          <button
            id="btn-toggle-ai-tutor"
            onClick={onToggleTutor}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isTutorOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={t('nav.aiCoach')}
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Settings / API Key Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition cursor-pointer relative"
            title="Paramètres & Clé API Gemini"
          >
            <Settings className="w-4 h-4" />
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1" />
            )}
          </button>

          {/* Fullscreen Mode */}
          <button
            id="btn-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition cursor-pointer hidden sm:block"
            title={isFullscreen ? t('nav.exitFullscreen') : t('nav.fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Profile Avatar Dropdown */}
          {currentUser && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Modifier mon profil</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('groups');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Mes groupes ({userGroups.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSettings();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-amber-500" />
                      <span>Clé API & Paramètres IA</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

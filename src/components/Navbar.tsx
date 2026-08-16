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
  ChevronDown
} from 'lucide-react';
import { CoursePayload } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: 'generator' | 'slides' | 'classroom' | 'quiz';
  setActiveTab: (tab: 'generator' | 'slides' | 'classroom' | 'quiz') => void;
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
}) => {
  const { language, setLanguage, t, supportedLanguages, currentLanguageInfo } = useLanguage();
  const [copiedSession, setCopiedSession] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
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
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* 3-Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="btn-language-selector"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-200/70 transition shadow-2xs"
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
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
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

          {/* Quick Course Selector Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={currentCourse.id}
              onChange={(e) => {
                const found = coursesList.find((c) => c.id === e.target.value);
                if (found) onSelectCourse(found);
              }}
              className="bg-transparent text-slate-700 font-medium outline-none max-w-[130px] truncate cursor-pointer"
            >
              {coursesList.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Session Code Badge */}
          <button
            id="btn-copy-session-code"
            onClick={copySessionLink}
            title={t('nav.copyLink')}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 hover:bg-slate-200/80 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{sessionCode}</span>
            {copiedSession ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {/* Export to PPTX Button */}
          <button
            id="btn-navbar-export-pptx"
            onClick={onExportPPTX}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 transition"
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
            className={`p-2 rounded-lg border transition-all ${
              isTutorOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={t('nav.aiCoach')}
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Fullscreen Mode */}
          <button
            id="btn-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
            title={isFullscreen ? t('nav.exitFullscreen') : t('nav.fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};


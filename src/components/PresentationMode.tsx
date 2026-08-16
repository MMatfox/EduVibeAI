import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Clock,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Columns,
  Workflow,
  Quote,
  Maximize2,
  Minimize2,
  Sparkles,
  MousePointer,
  RotateCcw
} from 'lucide-react';
import { CoursePayload, Slide } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { audioEffects } from '../utils/audioEffects';

interface PresentationModeProps {
  course: CoursePayload;
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onExit: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  course,
  currentSlideIndex,
  onSlideChange,
  onExit,
}) => {
  const slides = course.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;

  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [laserPointerActive, setLaserPointerActive] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [notesFontSize, setNotesFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Presentation Stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'n') {
        setShowNotes((prev) => !prev);
      } else if (e.key.toLowerCase() === 'l') {
        setLaserPointerActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  // Track mouse for laser pointer
  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserPointerActive) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
      audioEffects.playSlideClick();
      stopSpeech();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
      audioEffects.playSlideClick();
      stopSpeech();
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      stopSpeech();
    } else {
      const textToRead = currentSlide?.trainerNotes?.oralScript || currentSlide?.title;
      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      const isVietnamese = (course.language || '').toLowerCase().includes('vi');
      const isFrench = (course.language || '').toLowerCase().includes('fr');
      utterance.lang = isVietnamese ? 'vi-VN' : isFrench ? 'fr-FR' : 'en-US';
      utterance.rate = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVisualConcept = () => {
    const vc = currentSlide.visualConcept;
    if (!vc) return null;

    switch (vc.type) {
      case 'metric':
        return (
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
              {vc.badge || 'STATISTIQUE CLÉ'}
            </span>
            <div className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500">
              {vc.metric || '84%'}
            </div>
            <p className="text-sm font-semibold text-slate-300 max-w-sm">
              {vc.metricLabel || vc.title}
            </p>
            <div className="w-full pt-4 border-t border-slate-800 space-y-2 text-left">
              {vc.details?.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {vc.leftTitle || 'Mauvaises Pratiques'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(vc.leftPoints || vc.details?.slice(0, 2) || []).map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {vc.rightTitle || 'Bonnes Pratiques'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(vc.rightPoints || vc.details?.slice(2) || []).map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white space-y-4 shadow-2xl flex flex-col justify-center">
            <Quote className="w-8 h-8 text-indigo-400 opacity-60" />
            <p className="text-lg sm:text-xl font-medium italic text-slate-200 leading-relaxed">
              "{vc.details?.[0] || vc.title}"
            </p>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              — {vc.badge || 'Principe Fondamental'}
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                {vc.badge || 'MODÈLE CLÉ'}
              </span>
              <Workflow className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white">{vc.title}</h4>
            <div className="space-y-3 pt-2">
              {vc.details?.map((d, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">{d}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none overflow-hidden"
    >
      {/* Laser Pointer Dot */}
      {laserPointerActive && (
        <div
          className="fixed pointer-events-none z-50 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_#f43f5e] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        />
      )}

      {/* Top Floating Control Bar */}
      <header className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-xs font-bold tracking-wider uppercase">
            LIVE PRESENTATION
          </span>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-300 truncate max-w-[300px]">
            {course.title}
          </h2>
        </div>

        {/* Center: Slide Index & Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Slide <span className="text-white font-bold">{currentSlideIndex + 1}</span> / {slides.length}
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setLaserPointerActive(!laserPointerActive)}
            className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              laserPointerActive
                ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Laser Pointer (Touche L)"
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">Pointeur (L)</span>
          </button>

          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              showNotes
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Notes d'orateur (Touche N)"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Notes (N)</span>
          </button>

          {/* Audio Rehearsal */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isSpeaking
                ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Audio Rehearsal"
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit Fullscreen */}
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Quitter le diaporama (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Canvas Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Slide Presentation Card */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Badge & Title */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                  {currentSlide.categoryBadge || 'MODULE CONTENT'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Slide {currentSlide.slideNumber} / {slides.length}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {currentSlide.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-medium">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Content Columns: Bullets & Visual Concept */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
              {/* Left 7 Cols: Bullets */}
              <div className="lg:col-span-7 bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Points Clés & Directives</span>
                </h3>

                <ul className="space-y-4">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right 5 Cols: Visual Concept */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                {renderVisualConcept()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Speaker Teleprompter Drawer */}
        {showNotes && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 p-6 flex flex-col overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Notes & Script Orateur</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                {(['sm', 'base', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setNotesFontSize(size)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                      notesFontSize === size ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Oral Script Teleprompter */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                💬 Ce qu'il faut dire à voix haute :
              </span>
              <div
                className={`p-4 rounded-2xl bg-slate-800/90 border border-amber-500/30 text-amber-100 font-serif leading-relaxed italic ${
                  notesFontSize === 'lg' ? 'text-base' : notesFontSize === 'sm' ? 'text-xs' : 'text-sm'
                }`}
              >
                "{currentSlide.trainerNotes?.oralScript}"
              </div>
            </div>

            {/* Key talking points */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                🎯 Cibles pédagogiques :
              </span>
              <ul className="space-y-2">
                {currentSlide.trainerNotes?.keyTalkingPoints?.map((pt, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Prompt */}
            {currentSlide.trainerNotes?.interactivePrompt && (
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Question pour l'auditoire :</span>
                </span>
                <p className="text-xs text-indigo-200 font-medium">
                  {currentSlide.trainerNotes.interactivePrompt}
                </p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Floating Navigation Strip */}
      <footer className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md flex items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold transition cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Précédent</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span className="text-xs hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              onClick={() => {
                onSlideChange(i);
                audioEffects.playSlideClick();
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === i ? 'w-8 bg-indigo-500' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${i + 1}: ${s.title}`}
            />
          ))}
        </div>

        <div className="text-[11px] text-slate-500 hidden md:block">
          Touches : <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">←</kbd> <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">→</kbd> ou <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Espace</kbd> • <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Échap</kbd> quitter
        </div>
      </footer>
    </div>
  );
};

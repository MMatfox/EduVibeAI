import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Edit3,
  Check,
  Copy,
  Clock,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Columns,
  Workflow,
  Quote,
  CheckCircle2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { CoursePayload, Slide } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';

interface SlideViewerProps {
  course: CoursePayload;
  onUpdateCourse: (updatedCourse: CoursePayload) => void;
  onExportPPTX: () => void;
  isExporting: boolean;
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  course,
  onUpdateCourse,
  onExportPPTX,
  isExporting,
  currentSlideIndex,
  setCurrentSlideIndex,
}) => {
  const { language, t } = useLanguage();
  const [showTrainerNotes, setShowTrainerNotes] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isEditingSlide, setIsEditingSlide] = useState<boolean>(false);
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState<boolean>(false);
  const [trainerTimerSeconds, setTrainerTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Current Slide
  const slides = course.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;

  // Editable state buffer
  const [editTitle, setEditTitle] = useState(currentSlide?.title || '');
  const [editSubtitle, setEditSubtitle] = useState(currentSlide?.subtitle || '');
  const [editBullets, setEditBullets] = useState<string[]>(currentSlide?.bullets || []);
  const [editOralScript, setEditOralScript] = useState(currentSlide?.trainerNotes?.oralScript || '');

  useEffect(() => {
    if (currentSlide) {
      setEditTitle(currentSlide.title);
      setEditSubtitle(currentSlide.subtitle);
      setEditBullets([...currentSlide.bullets]);
      setEditOralScript(currentSlide.trainerNotes?.oralScript || '');
    }
  }, [currentSlideIndex, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when editing input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'n') {
        setShowTrainerNotes((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  // Speaker stopwatch
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTrainerTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      stopSpeech();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      stopSpeech();
    }
  };

  const handleCopyScript = () => {
    if (currentSlide?.trainerNotes?.oralScript) {
      navigator.clipboard.writeText(currentSlide.trainerNotes.oralScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  // Web Speech API for rehearsing oral notes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert(t('slides.speechUnsupported'));
      return;
    }
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    const textToSpeak = currentSlide?.trainerNotes?.oralScript;
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Choose speech synthesis language correctly based on current language or course language
    const courseLangLower = (course.language || '').toLowerCase();
    if (courseLangLower.includes('vi') || language === 'vi') {
      utterance.lang = 'vi-VN';
    } else if (courseLangLower.includes('en') || language === 'en') {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'fr-FR';
    }

    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSaveEdit = () => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      title: editTitle,
      subtitle: editSubtitle,
      bullets: editBullets.filter((b) => b.trim().length > 0),
      trainerNotes: {
        ...currentSlide.trainerNotes,
        oralScript: editOralScript,
      },
    };
    onUpdateCourse({
      ...course,
      slides: updatedSlides,
    });
    setIsEditingSlide(false);
  };

  const handleEnhanceWithAI = async () => {
    setIsEnhancingWithAI(true);
    try {
      const response = await fetch('/api/enhance-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide: currentSlide,
          language: course.language,
        }),
      });
      const data = await response.json();
      if (data.enhancedNotes) {
        const updatedSlides = [...slides];
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          trainerNotes: {
            ...currentSlide.trainerNotes,
            oralScript: data.enhancedNotes,
          },
        };
        onUpdateCourse({ ...course, slides: updatedSlides });
        setEditOralScript(data.enhancedNotes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancingWithAI(false);
    }
  };

  if (!currentSlide) {
    return (
      <div className="p-8 text-center text-slate-400">
        {t('slides.noSlide')}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4 px-4 sm:px-6">
      {/* Top Presentation Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        {/* Slide Counter & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
            <span className="font-bold text-indigo-600 text-sm">{currentSlideIndex + 1}</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold">{slides.length}</span>
          </div>

          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-900 line-clamp-1 max-w-sm">
              {course.title}
            </h2>
            <p className="text-[11px] text-slate-500">
              {currentSlide.categoryBadge || 'Slide'}
            </p>
          </div>
        </div>

        {/* Center: Slide Progress Bar */}
        <div className="w-36 sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Right Actions: Timer, PPTX Export, Edit Slide */}
        <div className="flex items-center gap-2">
          {/* Trainer Timer */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold">{formatTimer(trainerTimerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline ml-1 cursor-pointer"
            >
              {isTimerRunning ? t('slides.timerPause') : t('slides.timerStart')}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTrainerTimerSeconds(0);
              }}
              title={t('slides.timerReset')}
              className="text-slate-400 hover:text-slate-600 ml-0.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Edit Slide Button */}
          <button
            id="btn-edit-slide"
            onClick={() => setIsEditingSlide(!isEditingSlide)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isEditingSlide
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={t('slides.editSlide')}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('slides.editSlide')}</span>
          </button>

          {/* PPTX Export Button */}
          <button
            id="btn-slideviewer-pptx-export"
            onClick={onExportPPTX}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
            title="Download PPTX"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">
              {isExporting ? t('nav.exporting') : t('slides.exportPptxBtn')}
            </span>
          </button>
        </div>
      </div>

      {/* MAIN PRESENTATION CANVAS (16:9 Aspect Presentation Frame) */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs transition-all">
        {/* Top Decorative Header Accent */}
        <div
          className="h-1.5 w-full bg-indigo-600"
          style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
        />

        <div className="p-6 sm:p-10 space-y-8 min-h-[480px] flex flex-col justify-between">
          {/* Header area: Badge, Title, Subtitle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                {currentSlide.categoryBadge || 'Slide'}
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">
                Slide {currentSlide.slideNumber} / {slides.length}
              </span>
            </div>

            {isEditingSlide ? (
              <div className="space-y-2 pt-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  placeholder="Slide title"
                />
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  placeholder="Subtitle"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {currentSlide.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium italic mt-1">
                  {currentSlide.subtitle}
                </p>
              </div>
            )}
          </div>

          {/* 2-Column Content Grid: Bullets (Left) + Visual Concept Card (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch my-auto">
            {/* Left: Key Bullet Points (7 cols) */}
            <div className="md:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>{t('slides.keyPoints')}</span>
                </h3>
                {isEditingSlide && (
                  <button
                    onClick={() => setEditBullets([...editBullets, 'New point'])}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> {t('slides.addPoint')}
                  </button>
                )}
              </div>

              {isEditingSlide ? (
                <div className="space-y-2">
                  {editBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-indigo-600 font-mono font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const copy = [...editBullets];
                          copy[idx] = e.target.value;
                          setEditBullets(copy);
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                      <button
                        onClick={() => setEditBullets(editBullets.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {currentSlide.bullets.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-800 text-sm sm:text-base leading-relaxed">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs mt-0.5 bg-indigo-600"
                        style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
                      >
                        {index + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: Visual Concept / Metric / Framework Card (5 cols) */}
            <div className="md:col-span-5 flex flex-col">
              <div
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden"
              >
                {/* Visual Concept Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-white shadow-xs bg-indigo-600"
                    style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
                  >
                    {currentSlide.visualConcept.badge || currentSlide.visualConcept.type.toUpperCase()}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>

                {/* Main Concept Graphic / Metric Display */}
                <div className="space-y-2 text-center py-2">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    {currentSlide.visualConcept.title}
                  </h4>

                  {currentSlide.visualConcept.metric && (
                    <div className="space-y-1 py-1">
                      <div
                        className="text-4xl sm:text-5xl font-black tracking-tight text-indigo-600"
                        style={{ color: theme.primaryColor || '#4f46e5' }}
                      >
                        {currentSlide.visualConcept.metric}
                      </div>
                      {currentSlide.visualConcept.metricLabel && (
                        <p className="text-[11px] text-slate-600 font-medium max-w-xs mx-auto">
                          {currentSlide.visualConcept.metricLabel}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Details / 3 Pillars */}
                {currentSlide.visualConcept.details && (
                  <div className="space-y-2 bg-white rounded-xl p-3 border border-slate-200 text-left shadow-xs">
                    {currentSlide.visualConcept.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-indigo-600" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Slide Save / Cancel Actions */}
          {isEditingSlide && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsEditingSlide(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100"
              >
                {t('slides.cancelEdit')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {t('slides.saveChanges')}
              </button>
            </div>
          )}

          {/* Presentation Footer & Next/Prev Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {/* Toggle Notes Button */}
            <button
              id="btn-toggle-speaker-notes"
              onClick={() => setShowTrainerNotes(!showTrainerNotes)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                showTrainerNotes
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{showTrainerNotes ? t('slides.hideSpeakerNotes') : t('slides.showSpeakerNotes')}</span>
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-prev-slide"
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 transition shadow-xs"
                title={t('slides.prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                id="btn-next-slide"
                onClick={handleNext}
                disabled={currentSlideIndex === slides.length - 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs disabled:opacity-30 disabled:cursor-not-allowed transition"
                title={t('slides.next')}
              >
                <span>{t('slides.next')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE SPEAKER NOTES & ORAL SCRIPT DRAWER */}
      {showTrainerNotes && (
        <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-6 shadow-xs space-y-5 animate-in fade-in slide-in-from-top-2">
          {/* Header of Speaker Drawer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {t('slides.speakerNotesTitle')}
                </h3>
                <p className="text-[11px] text-amber-800">
                  {t('slides.speakerNotesSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Timing cue badge */}
              <span className="text-xs px-2.5 py-1 rounded-full bg-white text-amber-900 border border-amber-200 font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{t('slides.targetDuration')}: ~{currentSlide.trainerNotes?.timeMinutes || 8} min</span>
              </span>

              {/* Read Aloud Audio Rehearsal */}
              <button
                id="btn-speak-script"
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition ${
                  isSpeaking
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60'
                }`}
                title="Audio speech rehearsal"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700" />}
                <span>{isSpeaking ? t('slides.stopAudio') : t('slides.rehearseAudio')}</span>
              </button>

              {/* Copy Script Button */}
              <button
                id="btn-copy-trainer-script"
                onClick={handleCopyScript}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-200 text-xs font-semibold transition"
                title="Copy script"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? t('slides.copied') : t('slides.copy')}</span>
              </button>

              {/* AI Enhance Script */}
              <button
                id="btn-ai-enhance-notes"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancingWithAI}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition disabled:opacity-50"
                title="Enhance oral script with AI"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEnhancingWithAI ? 'animate-spin' : ''}`} />
                <span>{isEnhancingWithAI ? t('slides.aiEnhancing') : t('slides.aiEnhance')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left: What to Say (Oral Script) (7 cols) */}
            <div className="md:col-span-7 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                {t('slides.oralScriptLabel')}
              </span>

              {isEditingSlide ? (
                <textarea
                  value={editOralScript}
                  onChange={(e) => setEditOralScript(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
              ) : (
                <div className="bg-white rounded-xl p-4 border border-amber-200 text-slate-800 text-sm leading-relaxed italic relative shadow-xs">
                  <Quote className="w-6 h-6 text-amber-300/40 absolute top-2 right-2" />
                  "{currentSlide.trainerNotes?.oralScript}"
                </div>
              )}
            </div>

            {/* Right: Key Talking Points & Interactive Prompt (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              {/* Talking Points Checklist */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  {t('slides.talkingPoints')}
                </span>
                <ul className="space-y-1.5 bg-white rounded-xl p-3 border border-amber-200 shadow-xs">
                  {(currentSlide.trainerNotes?.keyTalkingPoints || []).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-amber-600 font-mono font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive prompt for audience */}
              {currentSlide.trainerNotes?.interactivePrompt && (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200 text-indigo-900 text-xs space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t('slides.interactivePrompt')}</span>
                  </div>
                  <p>{currentSlide.trainerNotes.interactivePrompt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* THUMBNAILS CAROUSEL STRIP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>{t('slides.slideNavigator')}</span>
          <span>{slides.length} {t('slides.totalSlides')}</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              id={`thumb-slide-${idx}`}
              onClick={() => {
                setCurrentSlideIndex(idx);
                stopSpeech();
              }}
              className={`flex-shrink-0 w-36 h-22 rounded-xl p-2.5 border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                currentSlideIndex === idx
                  ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 font-mono">
                  #{idx + 1}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[60px] font-medium border border-slate-200">
                  {s.categoryBadge || 'Slide'}
                </span>
              </div>
              <h5 className="text-[11px] font-semibold text-slate-900 line-clamp-2 leading-tight">
                {s.title}
              </h5>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


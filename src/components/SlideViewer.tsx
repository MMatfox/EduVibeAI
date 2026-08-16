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
  Save,
  ArrowUp,
  ArrowDown,
  Tv,
  Image as ImageIcon,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { CoursePayload, Slide, getSlideBullets, getSlideVisualConcept } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';
import { PresentationMode } from './PresentationMode';
import { AddSlideModal } from './AddSlideModal';
import { audioEffects } from '../utils/audioEffects';

interface SlideViewerProps {
  course: CoursePayload;
  coursesList?: CoursePayload[];
  onSelectCourse?: (course: CoursePayload) => void;
  onOpenCoursesDashboard?: () => void;
  onUpdateCourse: (updatedCourse: CoursePayload) => void;
  onExportPPTX: () => void;
  isExporting: boolean;
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  course,
  coursesList = [],
  onSelectCourse,
  onOpenCoursesDashboard,
  onUpdateCourse,
  onExportPPTX,
  isExporting,
  currentSlideIndex,
  setCurrentSlideIndex,
}) => {
  const { language, t } = useLanguage();
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState<boolean>(false);
  const [showTrainerNotes, setShowTrainerNotes] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isEditingSlide, setIsEditingSlide] = useState<boolean>(false);
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState<boolean>(false);
  const [trainerTimerSeconds, setTrainerTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Presentation & Add slide modals
  const [isPresentationModeOpen, setIsPresentationModeOpen] = useState<boolean>(false);
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState<boolean>(false);

  // Current Slide
  const slides = course.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;

  const slideBullets = getSlideBullets(currentSlide);
  const visualConcept = getSlideVisualConcept(currentSlide);

  // Editable state buffer
  const [editTitle, setEditTitle] = useState(currentSlide?.title || '');
  const [editSubtitle, setEditSubtitle] = useState(currentSlide?.subtitle || '');
  const [editBullets, setEditBullets] = useState<string[]>(getSlideBullets(currentSlide));
  const [editOralScript, setEditOralScript] = useState(currentSlide?.trainerNotes?.oralScript || '');
  const [editImageUrl, setEditImageUrl] = useState(currentSlide?.imageUrl || '');
  const [editImagePrompt, setEditImagePrompt] = useState(currentSlide?.imagePrompt || '');

  useEffect(() => {
    if (currentSlide) {
      setEditTitle(currentSlide.title);
      setEditSubtitle(currentSlide.subtitle);
      setEditBullets(getSlideBullets(currentSlide));
      setEditOralScript(currentSlide.trainerNotes?.oralScript || '');
      setEditImageUrl(currentSlide.imageUrl || '');
      setEditImagePrompt(currentSlide.imagePrompt || '');
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
      } else if (e.key.toLowerCase() === 'p') {
        setIsPresentationModeOpen(true);
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
      audioEffects.playSlideClick();
      stopSpeech();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      audioEffects.playSlideClick();
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
      imageUrl: editImageUrl.trim() || currentSlide.imageUrl,
      imagePrompt: editImagePrompt.trim() || currentSlide.imagePrompt,
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
      const customKey = localStorage.getItem('eduvibe_gemini_api_key') || '';
      const response = await fetch('/api/enhance-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customKey,
        },
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

  // Add Slide
  const handleAddSlide = (newSlide: Slide) => {
    const updated = [...slides, newSlide];
    onUpdateCourse({
      ...course,
      slides: updated,
    });
    setCurrentSlideIndex(updated.length - 1);
  };

  // Delete Slide
  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      alert('Un module doit comporter au moins 1 diapositive.');
      return;
    }
    if (confirm(`Supprimer la slide "${currentSlide.title}" ?`)) {
      const updated = slides
        .filter((_, idx) => idx !== currentSlideIndex)
        .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      onUpdateCourse({
        ...course,
        slides: updated,
      });
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };

  // Move Slide Up
  const handleMoveUp = () => {
    if (currentSlideIndex <= 0) return;
    const copy = [...slides];
    const temp = copy[currentSlideIndex];
    copy[currentSlideIndex] = copy[currentSlideIndex - 1];
    copy[currentSlideIndex - 1] = temp;

    const renumbered = copy.map((s, i) => ({ ...s, slideNumber: i + 1 }));
    onUpdateCourse({ ...course, slides: renumbered });
    setCurrentSlideIndex(currentSlideIndex - 1);
  };

  // Move Slide Down
  const handleMoveDown = () => {
    if (currentSlideIndex >= slides.length - 1) return;
    const copy = [...slides];
    const temp = copy[currentSlideIndex];
    copy[currentSlideIndex] = copy[currentSlideIndex + 1];
    copy[currentSlideIndex + 1] = temp;

    const renumbered = copy.map((s, i) => ({ ...s, slideNumber: i + 1 }));
    onUpdateCourse({ ...course, slides: renumbered });
    setCurrentSlideIndex(currentSlideIndex + 1);
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
      {/* Fullscreen Presentation Mode Modal */}
      {isPresentationModeOpen && (
        <PresentationMode
          course={course}
          currentSlideIndex={currentSlideIndex}
          onSlideChange={setCurrentSlideIndex}
          onExit={() => setIsPresentationModeOpen(false)}
        />
      )}

      {/* Add Slide Modal */}
      <AddSlideModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setIsAddSlideModalOpen(false)}
        courseTopic={course.topic}
        nextSlideNumber={slides.length + 1}
        onAddSlide={handleAddSlide}
      />

      {/* Top Presentation Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        {/* Slide Counter & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
            <span className="font-bold text-indigo-600 text-sm">{currentSlideIndex + 1}</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold">{slides.length}</span>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 max-w-xs sm:max-w-sm" title={course.title}>
                  {course.title}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {currentSlide.categoryBadge || 'Slide'}
                </p>
              </div>

              {coursesList.length > 1 && (
                <button
                  onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                  title={t('courses.switcherTitle')}
                >
                  <span>{t('courses.switcher')} ({coursesList.length})</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {isCourseDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  {t('courses.switcherTitle')}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
                  {coursesList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (onSelectCourse) onSelectCourse(c);
                        setIsCourseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                        c.id === course.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{c.title}</span>
                      {c.id === course.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>

                {onOpenCoursesDashboard && (
                  <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        onOpenCoursesDashboard();
                        setIsCourseDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-indigo-600 font-bold hover:bg-indigo-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t('courses.manageAll')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Slide Progress Bar */}
        <div className="w-36 sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Right Actions: Presentation Mode, Timer, Edit Slide, PPTX Export */}
        <div className="flex items-center gap-2">
          {/* Launch Fullscreen Presentation Mode */}
          <button
            id="btn-presentation-mode"
            onClick={() => setIsPresentationModeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title="Diaporama plein écran pour le direct (Touche P)"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Diaporama (P)</span>
          </button>

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
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
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
              <div className="flex items-center gap-2">
                {/* Slide reordering buttons */}
                <button
                  onClick={handleMoveUp}
                  disabled={currentSlideIndex === 0}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  title="Déplacer vers la gauche / avant"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleMoveDown}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  title="Déplacer vers la droite / après"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteSlide}
                  disabled={slides.length <= 1}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer ml-1"
                  title="Supprimer cette diapositive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-400 font-mono font-medium ml-2">
                  Slide {currentSlide.slideNumber} / {slides.length}
                </span>
              </div>
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
                    onClick={() => setEditBullets([...editBullets, 'Nouveau point clé'])}
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
                  {slideBullets.map((point, index) => (
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

            {/* Right: Visual Concept / Metric / Thematic Image Card (5 cols) */}
            <div className="md:col-span-5 flex flex-col space-y-3">
              {/* Thematic Slide Photo / Illustration */}
              {currentSlide.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 group aspect-video max-h-48">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.imagePrompt || currentSlide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
                  
                  {/* Floating AI Vision Pill */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-semibold text-white/95 truncate max-w-[80%] drop-shadow-md">
                      {currentSlide.imagePrompt || currentSlide.categoryBadge}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-300 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-indigo-500/30">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      <span>Visuel IA</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Visual Card with Concept / Metric */}
              <div
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden"
              >
                {/* Visual Concept Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md text-white shadow-xs bg-indigo-600"
                    style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
                  >
                    {visualConcept?.badge || visualConcept?.type?.toUpperCase() || 'CONCEPT'}
                  </span>
                  <div className="text-slate-400">
                    {visualConcept?.type === 'metric' && <TrendingUp className="w-4 h-4" />}
                    {visualConcept?.type === 'comparison' && <Columns className="w-4 h-4" />}
                    {visualConcept?.type === 'framework' && <Workflow className="w-4 h-4" />}
                    {visualConcept?.type === 'quote' && <Quote className="w-4 h-4" />}
                  </div>
                </div>

                {/* Concept Main Visual Graphic */}
                <div className="space-y-2 my-auto text-center">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {visualConcept?.title}
                  </h4>

                  {/* Metric Display if type == metric */}
                  {visualConcept?.metric && (
                    <div className="space-y-0.5">
                      <div
                        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-600"
                        style={{ color: theme.primaryColor || '#4f46e5' }}
                      >
                        {visualConcept.metric}
                      </div>
                      {visualConcept.metricLabel && (
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                          {visualConcept.metricLabel}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Details Bullet List */}
                  {visualConcept?.details && visualConcept.details.length > 0 && (
                    <div className="space-y-1.5 text-left pt-2 border-t border-slate-200/80">
                      {visualConcept.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-600"
                            style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
                          />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit Mode Image Fields */}
                {isEditingSlide && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-indigo-600" />
                      <span>URL de l'image & Thème</span>
                    </label>
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={editImagePrompt}
                      onChange={(e) => setEditImagePrompt(e.target.value)}
                      placeholder="Description du visuel IA..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-600"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Mode Save Button */}
          {isEditingSlide && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsEditingSlide(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer la slide</span>
              </button>
            </div>
          )}
        </div>

        {/* Floating Slide Navigation Controls (Prev / Next) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            id="btn-prev-slide"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('viewer.prevSlide')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddSlideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-indigo-700 hover:bg-indigo-50/50 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('slides.addSlideBtn')}</span>
            </button>

            <button
              id="btn-toggle-trainer-notes"
              onClick={() => setShowTrainerNotes(!showTrainerNotes)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                showTrainerNotes
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{showTrainerNotes ? t('viewer.hideNotes') : t('viewer.showNotes')}</span>
            </button>
          </div>

          <button
            id="btn-next-slide"
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 transition cursor-pointer shadow-xs"
          >
            <span>{t('viewer.nextSlide')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE TRAINER NOTES & ORAL SCRIPT DRAWER */}
      {showTrainerNotes && (
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  {t('slides.speakerNotesHeader')}
                </h3>
                <p className="text-[11px] text-amber-800">
                  {t('slides.rehearsalGuide')} • ~{currentSlide.trainerNotes?.timeMinutes || 8} min
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio Speech Synthesis rehearsal */}
              <button
                id="btn-speech-rehearsal"
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                    : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60'
                }`}
                title="Listen to oral script"
              >
                {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? t('slides.speaking') : t('slides.listenScript')}</span>
              </button>

              {/* Copy Script */}
              <button
                id="btn-copy-script"
                onClick={handleCopyScript}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer"
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
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
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
                <div className="bg-white rounded-xl p-4 border border-amber-200 text-slate-800 text-sm leading-relaxed italic relative shadow-xs font-serif">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddSlideModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Ajouter une slide</span>
            </button>
            <span>•</span>
            <span>{slides.length} {t('slides.totalSlides')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              id={`thumb-slide-${idx}`}
              onClick={() => {
                setCurrentSlideIndex(idx);
                audioEffects.playSlideClick();
                stopSpeech();
              }}
              className={`flex-shrink-0 w-40 h-24 rounded-xl p-2.5 border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                currentSlideIndex === idx
                  ? 'bg-indigo-50/90 border-indigo-600 shadow-xs ring-2 ring-indigo-600'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 font-mono">
                  #{idx + 1}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[70px] font-medium border border-slate-200">
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

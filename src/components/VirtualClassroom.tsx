import React, { useState, useEffect } from 'react';
import {
  Video,
  Users,
  Copy,
  Check,
  Layout,
  Presentation,
  Hand,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  MessageSquare,
  Clock,
  Radio,
  Cast,
  Eye,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { CoursePayload, Slide } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';
import { useAuthAndGroup } from '../context/AuthAndGroupContext';

interface VirtualClassroomProps {
  course: CoursePayload;
  coursesList: CoursePayload[];
  onSelectCourse: (course: CoursePayload) => void;
  sessionCode: string;
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
}

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({
  course,
  coursesList,
  onSelectCourse,
  sessionCode,
  currentSlideIndex,
  setCurrentSlideIndex,
}) => {
  const { language, t } = useLanguage();
  const { currentUser, activeGroup, userGroups, setActiveGroup } = useAuthAndGroup();

  const [layoutMode, setLayoutMode] = useState<'split' | 'slide-focus' | 'video-focus'>('split');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isPrompterOpen, setIsPrompterOpen] = useState<boolean>(true);
  const [activeTabPanel, setActiveTabPanel] = useState<'slide' | 'poll' | 'notes'>('slide');
  const [scratchpadNote, setScratchpadNote] = useState<string>(
    `📝 Notes de session partagées :\n- Formation : "${course.title}"\n- Animateur : ${currentUser?.name || 'Formateur'}\n- Durée estimée : ~${course.estimatedDuration} min`
  );

  // Poll state
  const [activePoll, setActivePoll] = useState<{
    question: string;
    options: { text: string; votes: number }[];
  }>({
    question: t('classroom.pollQuestion'),
    options: [
      { text: t('classroom.voteYes'), votes: 8 },
      { text: t('classroom.voteRare'), votes: 2 },
      { text: t('classroom.voteNever'), votes: 4 },
    ],
  });
  const [userVotedIndex, setUserVotedIndex] = useState<number | null>(null);

  // Room Identifier: Group-based or Session Code
  const groupRoomId = activeGroup ? `EduVibe-Group-${activeGroup.code}` : `EduVibe-${sessionCode}`;
  const meetingUrl = `https://meet.jit.si/${encodeURIComponent(groupRoomId)}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  const currentSlide = course.slides[currentSlideIndex] || course.slides[0];
  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;

  const totalVotes = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleVote = (idx: number) => {
    if (userVotedIndex !== null) return;
    const copy = { ...activePoll };
    copy.options[idx].votes += 1;
    setActivePoll(copy);
    setUserVotedIndex(idx);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < course.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 py-4 px-4 sm:px-6 animate-in fade-in">
      {/* Top Session & Group Live Cockpit Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Meeting Status & Group Room */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping absolute" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 relative z-10" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                {t('classroom.header')}
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>{t('classroom.statusLive')}</span>
              </span>

              {activeGroup && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                  <span>{activeGroup.icon || '👥'}</span>
                  <span>{activeGroup.name}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Salle : <strong className="font-mono text-slate-800">{groupRoomId}</strong></span>
              <span>•</span>
              <span>Présentateur : <strong className="text-indigo-600">{currentUser?.name || 'Formateur'}</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Controls & Course Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          {/* Module Presenter Selector */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 hidden sm:inline" />
            <select
              value={course.id}
              onChange={(e) => {
                const found = coursesList.find((c) => c.id === e.target.value);
                if (found) onSelectCourse(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs max-w-[200px] truncate"
              title="Choisir le module de formation à projeter aux participants"
            >
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Layout Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setLayoutMode('split')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'split' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vue Mixte : Visio + Slide synchronisée"
            >
              Mixte
            </button>
            <button
              onClick={() => setLayoutMode('slide-focus')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'slide-focus' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Focus Diapositive : Grand format"
            >
              Slides Focus
            </button>
            <button
              onClick={() => setLayoutMode('video-focus')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'video-focus' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Focus Visio : Plein écran webcam"
            >
              Visio Focus
            </button>
          </div>

          {/* Copy Meeting Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Lien copié !' : 'Inviter'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Classroom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIDEO STREAM (Jitsi Meet iframe) */}
        <div
          className={`bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col transition-all ${
            layoutMode === 'video-focus'
              ? 'lg:col-span-12 h-[680px]'
              : layoutMode === 'slide-focus'
              ? 'lg:col-span-4 h-[420px]'
              : 'lg:col-span-6 h-[540px] lg:h-[620px]'
          }`}
        >
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                Salle Visio Interactive
              </span>
            </div>
            <a
              href={meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Plein écran externe</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex-1 w-full h-full relative bg-slate-950">
            <iframe
              src={meetingUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              className="w-full h-full border-0"
              title="EduVibe Live Virtual Classroom"
            />
          </div>
        </div>

        {/* PRESENTER SLIDE & INTERACTIVE COCKPIT */}
        <div
          className={`space-y-4 transition-all ${
            layoutMode === 'video-focus'
              ? 'lg:col-span-12'
              : layoutMode === 'slide-focus'
              ? 'lg:col-span-8'
              : 'lg:col-span-6'
          }`}
        >
          {/* Active Slide Presentation Card */}
          <div
            className="rounded-3xl border p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[360px] relative overflow-hidden transition-all"
            style={{
              backgroundColor: theme.cardBg || '#ffffff',
              borderColor: theme.borderAccent || '#e2e8f0',
            }}
          >
            {/* Background subtle gradient glow */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: theme.primaryColor }}
            />

            {/* Slide Header */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs"
                  style={{
                    backgroundColor: theme.badgeBg || '#eef2ff',
                    color: theme.badgeText || '#4338ca',
                    borderColor: theme.borderAccent || '#c7d2fe',
                  }}
                >
                  {currentSlide.categoryBadge || 'Slide Présentateur'}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200">
                  <span>Slide</span>
                  <span className="text-slate-900">{currentSlideIndex + 1}</span>
                  <span>/</span>
                  <span>{course.slides.length}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {currentSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Slide Bullets & Visual Concept Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 relative z-10 items-stretch">
              {/* Left Bullets */}
              <div className="md:col-span-7 space-y-2">
                {currentSlide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Visual Concept Box */}
              {currentSlide.visualConcept && (
                <div
                  className="md:col-span-5 p-4 rounded-2xl border bg-white/90 shadow-xs flex flex-col justify-between"
                  style={{ borderColor: theme.borderAccent || '#e2e8f0' }}
                >
                  <div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{
                        backgroundColor: theme.badgeBg || '#eef2ff',
                        color: theme.badgeText || '#4338ca',
                      }}
                    >
                      {currentSlide.visualConcept.badge || 'CONCEPT CLÉ'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      {currentSlide.visualConcept.title}
                    </h4>

                    {currentSlide.visualConcept.metric && (
                      <div className="my-2">
                        <span
                          className="text-2xl font-black tracking-tight"
                          style={{ color: theme.primaryColor }}
                        >
                          {currentSlide.visualConcept.metric}
                        </span>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {currentSlide.visualConcept.metricLabel}
                        </p>
                      </div>
                    )}

                    <ul className="space-y-1 mt-2 text-[11px] text-slate-600">
                      {currentSlide.visualConcept.details?.map((det, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span className="line-clamp-2">{det}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 relative z-10">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédente</span>
              </button>

              <div className="flex items-center gap-1">
                {course.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      currentSlideIndex === i
                        ? 'w-6 bg-indigo-600'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === course.slides.length - 1}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <span>Suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRESENTER TELEPROMPTER & INTERACTIVE PANELS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Panel Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 pt-2 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTabPanel('slide')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTabPanel === 'slide'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Prompteur & Script Oral</span>
                </button>

                <button
                  onClick={() => setActiveTabPanel('poll')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTabPanel === 'poll'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Sondage Live ({totalVotes} votes)</span>
                </button>

                <button
                  onClick={() => setActiveTabPanel('notes')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTabPanel === 'notes'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Notes Partagées</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                <span>~{currentSlide.trainerNotes?.timeMinutes || 8} min recommandées</span>
              </span>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-5">
              {/* TAB 1: TELEPROMPTER */}
              {activeTabPanel === 'slide' && (
                <div className="space-y-4">
                  {/* Oral Speech Script */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                      💬 Ce que le présentateur dit en direct (Script mot-à-mot) :
                    </span>
                    <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium">
                      "{currentSlide.trainerNotes?.oralScript || 'Présentez les concepts clés de cette slide en insistant sur les exemples pratiques.'}"
                    </p>
                  </div>

                  {/* Talking points & Question */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">🎯 Objectifs à faire retenir :</span>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {currentSlide.trainerNotes?.keyTalkingPoints?.map((pt, i) => (
                          <li key={i}>• {pt}</li>
                        )) || <li>• Rendre le concept actionnable</li>}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-900 block">❓ Question pour relancer l'audience :</span>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {currentSlide.trainerNotes?.interactivePrompt || 'Demandez aux participants comment ce principe s’applique dans leur quotidien.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE POLL */}
              {activeTabPanel === 'poll' && (
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {activePoll.question}
                  </h4>

                  <div className="space-y-2">
                    {activePoll.options.map((opt, i) => {
                      const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const hasVoted = userVotedIndex === i;

                      return (
                        <button
                          key={i}
                          onClick={() => handleVote(i)}
                          className={`w-full p-3 rounded-2xl border text-left transition relative overflow-hidden cursor-pointer ${
                            hasVoted
                              ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        >
                          {/* Progress bar background */}
                          <div
                            className="absolute inset-y-0 left-0 bg-indigo-100/70 transition-all duration-500 pointer-events-none"
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900">{opt.text}</span>
                            <span className="font-bold text-indigo-700 font-mono">
                              {percentage}% ({opt.votes})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SHARED NOTES */}
              {activeTabPanel === 'notes' && (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={scratchpadNote}
                    onChange={(e) => setScratchpadNote(e.target.value)}
                    placeholder="Écrivez vos notes de session..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Ces notes peuvent être partagées ou exportées à l'issue de la visio.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

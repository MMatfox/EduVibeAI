import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  Users,
  Copy,
  Check,
  Layout,
  Presentation,
  MessageSquare,
  Sparkles,
  Hand,
  ThumbsUp,
  Share2,
  ExternalLink,
  PenTool,
  CheckCircle2,
  Clock,
  RotateCw
} from 'lucide-react';
import { CoursePayload } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';

interface VirtualClassroomProps {
  course: CoursePayload;
  sessionCode: string;
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
}

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({
  course,
  sessionCode,
  currentSlideIndex,
  setCurrentSlideIndex,
}) => {
  const { language, t } = useLanguage();
  const [layoutMode, setLayoutMode] = useState<'split' | 'video-only' | 'presentation-focus'>('split');
  const [customRoomName, setCustomRoomName] = useState(`EduVibe-${sessionCode}`);
  const [isMeetingStarted, setIsMeetingStarted] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [scratchpadNote, setScratchpadNote] = useState<string>(
    `📝 Notes :\n- Session "${course.title}".\n- ~${course.estimatedDuration} min.`
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

  // Simulated attendees
  const [attendees] = useState([
    { name: 'Alexandre M. (Host)', role: 'Host', isHandRaised: false, avatar: 'AM' },
    { name: 'Sophie Laurent', role: 'Participant', isHandRaised: true, avatar: 'SL' },
    { name: 'David Chen', role: 'Participant', isHandRaised: false, avatar: 'DC' },
    { name: 'Camille Dupont', role: 'Participant', isHandRaised: false, avatar: 'CD' },
    { name: 'Lucas Martin', role: 'Participant', isHandRaised: true, avatar: 'LM' },
  ]);

  const currentSlide = course.slides[currentSlideIndex] || course.slides[0];
  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;

  const meetingUrl = `https://meet.jit.si/${encodeURIComponent(customRoomName)}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 py-4 px-4 sm:px-6">
      {/* Top Session Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Meeting Info */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{t('classroom.header')}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                {t('classroom.statusLive')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-slate-800 font-medium">{course.title}</span>
            </p>
          </div>
        </div>

        {/* Center: Layout Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setLayoutMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              layoutMode === 'split'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('classroom.layoutSplit')}</span>
            <span className="sm:hidden">Split</span>
          </button>

          <button
            onClick={() => setLayoutMode('video-only')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              layoutMode === 'video-only'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('classroom.layoutVideo')}</span>
            <span className="sm:hidden">Video</span>
          </button>

          <button
            onClick={() => setLayoutMode('presentation-focus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              layoutMode === 'presentation-focus'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('classroom.layoutSlide')}</span>
            <span className="sm:hidden">Slide</span>
          </button>
        </div>

        {/* Right: Room Code & Share URL */}
        <div className="flex items-center gap-2">
          <button
            id="btn-copy-classroom-url"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? t('classroom.copied') : `${t('classroom.inviteParticipants')} (${sessionCode})`}</span>
          </button>

          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
            title="Open Jitsi Meet in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div
        className={`grid gap-6 transition-all ${
          layoutMode === 'split'
            ? 'grid-cols-1 lg:grid-cols-12'
            : 'grid-cols-1'
        }`}
      >
        {/* JITSI MEET VIDEO ROOM CONTAINER */}
        {(layoutMode === 'split' || layoutMode === 'video-only') && (
          <div
            className={`${
              layoutMode === 'split' ? 'lg:col-span-7' : 'w-full'
            } bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs flex flex-col min-h-[520px]`}
          >
            {/* Visio Frame Header */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-300 font-bold">
                  meet.jit.si/{customRoomName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" /> 5 {t('classroom.participants')}
                </span>
              </div>
            </div>

            {/* Embedded Jitsi Meet Iframe */}
            <div className="flex-1 relative bg-black">
              {isMeetingStarted ? (
                <iframe
                  id="jitsi-meet-iframe"
                  src={meetingUrl}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write; speaker"
                  className="w-full h-full min-h-[460px] border-0"
                  title="Jitsi Meet Virtual Classroom"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950">
                  <div className="p-4 rounded-full bg-slate-900 text-indigo-400 border border-slate-800">
                    <Video className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Video Paused</h3>
                  <button
                    onClick={() => setIsMeetingStarted(true)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs cursor-pointer"
                  >
                    Join video
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIVE SYNCHRONIZED PRESENTATION SLIDE & TRAINER PROMPTER */}
        {(layoutMode === 'split' || layoutMode === 'presentation-focus') && (
          <div
            className={`${
              layoutMode === 'split' ? 'lg:col-span-5' : 'w-full'
            } space-y-4`}
          >
            {/* Synchronized Slide Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t('classroom.layoutSlide')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => currentSlideIndex > 0 && setCurrentSlideIndex(currentSlideIndex - 1)}
                    disabled={currentSlideIndex === 0}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold disabled:opacity-30 cursor-pointer"
                  >
                    {t('viewer.prevSlide')}
                  </button>
                  <span className="text-xs font-mono text-indigo-600 font-bold px-1.5">
                    {currentSlideIndex + 1}/{course.slides.length}
                  </span>
                  <button
                    onClick={() => currentSlideIndex < course.slides.length - 1 && setCurrentSlideIndex(currentSlideIndex + 1)}
                    disabled={currentSlideIndex === course.slides.length - 1}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold disabled:opacity-30 cursor-pointer"
                  >
                    {t('viewer.nextSlide')}
                  </button>
                </div>
              </div>

              {/* Mini Slide Content */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentSlide.categoryBadge || 'Slide'}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {currentSlide.title}
                </h3>
                <p className="text-xs text-slate-500 italic">
                  {currentSlide.subtitle}
                </p>

                <ul className="space-y-2 pt-2">
                  {currentSlide.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trainer Live Teleprompter (Oral Script) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('classroom.teleprompter')} :</span>
                </span>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 italic leading-relaxed shadow-xs">
                  "{currentSlide.trainerNotes?.oralScript}"
                </div>
              </div>
            </div>

            {/* Quick Live Poll & Interactive Whiteboard Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Live Poll Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t('classroom.livePoll')}</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Live</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{activePoll.question}</p>

                <div className="space-y-1.5">
                  {activePoll.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleVote(oIdx)}
                      className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        userVotedIndex === oIdx
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{opt.text}</span>
                      <span className="font-mono text-indigo-600 font-bold text-[11px] ml-2">
                        {opt.votes}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raised Hands Queue */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Hand className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('classroom.raisedHands')}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {attendees
                    .filter((a) => a.isHandRaised)
                    .map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                            {att.avatar}
                          </span>
                          <span className="font-semibold text-amber-950">{att.name}</span>
                        </div>
                        <span className="text-[10px] text-amber-800 font-semibold">{t('classroom.raiseHand')}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Classroom Whiteboard & Collaborative Scratchpad */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">{t('classroom.whiteboard')}</h3>
          </div>
        </div>
        <textarea
          value={scratchpadNote}
          onChange={(e) => setScratchpadNote(e.target.value)}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
          placeholder={t('classroom.notesPlaceholder')}
        />
      </div>
    </div>
  );
};


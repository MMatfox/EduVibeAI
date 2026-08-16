import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Award,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  Trophy,
  Share2,
  Printer,
  Flame,
  Volume2,
  VolumeX,
  Eye,
  Check,
  Timer,
  Zap,
  Star
} from 'lucide-react';
import { CoursePayload, QuizQuestion } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';
import { useAuthAndGroup } from '../context/AuthAndGroupContext';
import { audioEffects } from '../utils/audioEffects';

interface InteractiveQuizProps {
  course: CoursePayload;
  onRetakeQuiz?: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ course }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuthAndGroup();
  const questions = course.quiz || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ questionIndex: number; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [score, setScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [showReviewMode, setShowReviewMode] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(() => currentUser?.name || 'Alexandre Martin');
  const [isMuted, setIsMuted] = useState<boolean>(() => audioEffects.getIsMuted());

  // Timed mode
  const [isTimedMode, setIsTimedMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;
  const currentQuestion: QuizQuestion | undefined = questions[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    if (!isTimedMode || isQuizCompleted || showExplanation || !currentQuestion) return;

    if (timeLeft <= 0) {
      // Time expired: auto-select nothing / mark incorrect
      handleSelectOption(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedMode, timeLeft, isQuizCompleted, showExplanation, currentQuestionIndex]);

  // Sync user name if currentUser changes
  useEffect(() => {
    if (currentUser?.name) {
      setUserName(currentUser.name);
    }
  }, [currentUser]);

  const handleSelectOption = (index: number) => {
    if (selectedOptionIndex !== null || isQuizCompleted) return;

    setSelectedOptionIndex(index);
    setShowExplanation(true);

    const isCorrect = index === currentQuestion?.correctOptionIndex;
    setUserAnswers((prev) => [...prev, { questionIndex: currentQuestionIndex, selectedIndex: index, isCorrect }]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const earnedXp = 100 + newStreak * 25 + (isTimedMode ? timeLeft * 5 : 0);
      setTotalXp((prev) => prev + earnedXp);

      audioEffects.playCorrect();
    } else {
      setCurrentStreak(0);
      audioEffects.playIncorrect();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
      setShowHint(false);
      setTimeLeft(30);
    } else {
      setIsQuizCompleted(true);
      audioEffects.playFanfare();
      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setUserAnswers([]);
    setScore(0);
    setCurrentStreak(0);
    setTotalXp(0);
    setTimeLeft(30);
    setShowHint(false);
    setIsQuizCompleted(false);
    setShowReviewMode(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const toggleSound = () => {
    const muted = audioEffects.toggleMute();
    setIsMuted(muted);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-slate-100 text-indigo-600 w-16 h-16 mx-auto flex items-center justify-center border border-slate-200">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('quiz.noQuiz')}</h2>
        <p className="text-sm text-slate-500">
          {t('quiz.generatePrompt')}
        </p>
      </div>
    );
  }

  const scorePercentage = Math.round((score / questions.length) * 100);

  const getLocaleDate = () => {
    if (language === 'vi') return new Date().toLocaleDateString('vi-VN');
    if (language === 'en') return new Date().toLocaleDateString('en-US');
    return new Date().toLocaleDateString('fr-FR');
  };

  const certVerificationCode = `EDUVIBE-${Math.abs(
    course.title.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 8)}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      {!isQuizCompleted ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 animate-in fade-in">
          {/* Header & Controls */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {t('quiz.title')}
                  </h2>
                  <p className="text-xs text-slate-500">{course.title}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Timed Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsTimedMode(!isTimedMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    isTimedMode
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Activer/Désactiver le chronomètre par question"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{isTimedMode ? `${timeLeft}s` : t('quiz.timerMode')}</span>
                </button>

                {/* Streak Badge */}
                {currentStreak > 1 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold flex items-center gap-1 animate-bounce">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>x{currentStreak} {t('quiz.streak')}</span>
                  </span>
                )}

                {/* XP Badge */}
                {totalXp > 0 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>+{totalXp} XP</span>
                  </span>
                )}

                {/* Sound Toggle */}
                <button
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                </button>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                  {t('quiz.question')} <span className="text-indigo-600 font-bold">{currentQuestionIndex + 1}</span> / {questions.length}
                </span>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                  {score} / {questions.length}
                </span>
              </div>
            </div>

            {/* Progress Bar & Timer bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
              {isTimedMode && !showExplanation && (
                <div className="w-full h-1 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {t('quiz.level')}: {currentQuestion?.difficulty || 'General'}
              </span>

              {/* Hint Trigger */}
              {currentQuestion?.hint && !showHint && !showExplanation && (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('quiz.hintBtn')}</span>
                </button>
              )}
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion?.question}
            </h3>

            {/* Revealed Hint */}
            {showHint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2 animate-in fade-in shadow-2xs">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-amber-800">{t('quiz.hintLabel')}:</strong> {currentQuestion?.hint}</span>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQuestion?.options.map((option, optIdx) => {
              const isSelected = selectedOptionIndex === optIdx;
              const isCorrect = optIdx === currentQuestion.correctOptionIndex;

              let optionStyle = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs';
              if (showExplanation) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500 font-semibold';
                } else if (isSelected) {
                  optionStyle = 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs ring-1 ring-red-500 font-semibold';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  id={`quiz-option-${optIdx}`}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={showExplanation}
                  className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-start justify-between gap-3 cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {showExplanation && (
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div
              className={`p-5 rounded-2xl border space-y-2 animate-in fade-in shadow-xs ${
                selectedOptionIndex === currentQuestion?.correctOptionIndex
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {selectedOptionIndex === currentQuestion?.correctOptionIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800">{t('quiz.correctFeedback')}</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-800">{t('quiz.explanationLabel')}</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                {currentQuestion?.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <div className="flex justify-end pt-2">
              <button
                id="btn-quiz-next-question"
                onClick={handleNextQuestion}
                className="py-3 px-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <span>
                  {currentQuestionIndex < questions.length - 1
                    ? t('quiz.nextQuestion')
                    : t('quiz.seeResults')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ COMPLETED: RESULTS & CERTIFICATE */
        <div className="space-y-8 animate-in fade-in">
          {/* Results Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center space-y-6 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
              <Trophy className="w-10 h-10 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('quiz.completedTitle')}
              </h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                {t('quiz.congratsPrefix')} "{course.title}".
              </p>
            </div>

            {/* Score Metric Cards */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-slate-50 px-8 py-5 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <div className="text-3xl font-black text-indigo-600 font-mono">
                  {score} / {questions.length}
                </div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">
                  {t('quiz.correctAnswers')}
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-slate-200" />
              <div>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  {scorePercentage}%
                </div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">
                  {t('quiz.passRate')}
                </div>
              </div>
              {maxStreak > 1 && (
                <>
                  <div className="hidden sm:block w-px h-10 bg-slate-200" />
                  <div>
                    <div className="text-3xl font-black text-amber-600 font-mono flex items-center justify-center gap-1">
                      <span>{maxStreak}</span>
                      <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      Max Streak
                    </div>
                  </div>
                </>
              )}
              {totalXp > 0 && (
                <>
                  <div className="hidden sm:block w-px h-10 bg-slate-200" />
                  <div>
                    <div className="text-3xl font-black text-purple-600 font-mono">
                      +{totalXp}
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      XP Total
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="btn-quiz-restart"
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('quiz.retakeQuiz')}</span>
              </button>

              <button
                onClick={() => setShowReviewMode(!showReviewMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition cursor-pointer ${
                  showReviewMode
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showReviewMode ? 'Masquer la révision' : t('quiz.reviewMode')}</span>
              </button>

              <button
                id="btn-quiz-print"
                onClick={handlePrintCertificate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('quiz.printCertificate')}</span>
              </button>
            </div>
          </div>

          {/* QUESTION REVIEW MODE */}
          {showReviewMode && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <span>{t('quiz.reviewMode')}</span>
              </h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const userAns = userAnswers.find((a) => a.questionIndex === idx);
                  const isCorrect = userAns?.isCorrect;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                        isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {idx + 1}. {q.question}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isCorrect ? '✓ Correct' : '✕ Erreur'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-1.5 ${
                              optIdx === q.correctOptionIndex
                                ? 'bg-emerald-100 border-emerald-400 font-semibold text-emerald-950 shadow-2xs'
                                : userAns?.selectedIndex === optIdx && !isCorrect
                                ? 'bg-rose-100 border-rose-400 font-semibold text-rose-950'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {optIdx === q.correctOptionIndex && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200 leading-relaxed">
                        💡 <strong>{t('quiz.explanationLabel')}</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OFFICIAL CERTIFICATE OF COMPLETION CARD */}
          <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl border-2 border-indigo-600 p-8 sm:p-12 shadow-md relative overflow-hidden text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <Award className="w-9 h-9" />
              <span className="text-xs uppercase tracking-widest font-black text-indigo-700">
                {t('quiz.certHeader')}
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                EduVibe AI Certificate of Mastery
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {t('quiz.certSub')}
              </p>
            </div>

            <div className="py-4 space-y-3 max-w-lg mx-auto">
              <p className="text-xs text-slate-500">{t('quiz.awardedTo')}</p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-center font-extrabold text-2xl sm:text-3xl text-indigo-950 bg-transparent border-b-2 border-dashed border-indigo-300 pb-1 focus:outline-none focus:border-indigo-600 w-full"
                title="Nom de l'apprenant"
              />
              <p className="text-xs text-slate-600 leading-relaxed pt-2">
                {t('quiz.forCompleting')}
              </p>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 px-4 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                {course.title}
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs text-slate-600 max-w-md mx-auto font-medium">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('quiz.certDate')}</span>
                <span className="font-mono text-slate-800 font-bold">{getLocaleDate()}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('quiz.certScore')}</span>
                <span className="font-mono text-emerald-600 font-bold">{scorePercentage}% ({score}/{questions.length})</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('quiz.certAuth')}</span>
                <span className="font-mono text-indigo-600 font-bold">{certVerificationCode}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

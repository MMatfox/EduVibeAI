import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { CoursePayload, QuizQuestion } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';

interface InteractiveQuizProps {
  course: CoursePayload;
  onRetakeQuiz?: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ course }) => {
  const { language, t } = useLanguage();
  const questions = course.quiz || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [score, setScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Alexandre Martin');

  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;
  const currentQuestion: QuizQuestion | undefined = questions[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (selectedOptionIndex !== null || isQuizCompleted) return;

    setSelectedOptionIndex(index);
    setShowExplanation(true);

    const isCorrect = index === currentQuestion?.correctOptionIndex;
    setUserAnswers([...userAnswers, isCorrect]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      setIsQuizCompleted(true);
      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
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
    setShowHint(false);
    setIsQuizCompleted(false);
  };

  const handlePrintCertificate = () => {
    window.print();
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      {!isQuizCompleted ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header & Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t('quiz.title')}
                  </h2>
                  <p className="text-xs text-slate-500">{course.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                  {t('quiz.question')} <span className="text-indigo-600 font-bold">{currentQuestionIndex + 1}</span> / {questions.length}
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                  {t('quiz.score')}: {score} pts
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {t('quiz.level')}: {currentQuestion.difficulty || 'General'}
              </span>

              {/* Hint Trigger */}
              {currentQuestion.hint && !showHint && !showExplanation && (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{t('quiz.hintBtn')}</span>
                </button>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Revealed Hint */}
            {showHint && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-2 animate-in fade-in shadow-xs">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-amber-800">{t('quiz.hintLabel')}:</strong> {currentQuestion.hint}</span>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedOptionIndex === optIdx;
              const isCorrect = optIdx === currentQuestion.correctOptionIndex;

              let optionStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';
              if (showExplanation) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500 font-semibold';
                } else if (isSelected) {
                  optionStyle = 'bg-red-50 border-red-500 text-red-950 shadow-xs ring-1 ring-red-500 font-semibold';
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
                  className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start justify-between gap-3 cursor-pointer ${optionStyle}`}
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
                        <XCircle className="w-5 h-5 text-red-600" />
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
              className={`p-5 rounded-xl border space-y-2 animate-in fade-in shadow-xs ${
                selectedOptionIndex === currentQuestion.correctOptionIndex
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {selectedOptionIndex === currentQuestion.correctOptionIndex ? (
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
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <div className="flex justify-end pt-2">
              <button
                id="btn-quiz-next-question"
                onClick={handleNextQuestion}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6 shadow-xs">
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

            {/* Score Metric Card */}
            <div className="inline-flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="text-3xl font-black text-indigo-600 font-mono">
                  {score} / {questions.length}
                </div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">
                  {t('quiz.correctAnswers')}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  {scorePercentage}%
                </div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">
                  {t('quiz.passRate')}
                </div>
              </div>
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
                id="btn-quiz-print"
                onClick={handlePrintCertificate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('quiz.printCertificate')}</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL CERTIFICATE OF COMPLETION CARD */}
          <div className="bg-white rounded-2xl border-2 border-indigo-600 p-8 sm:p-12 shadow-xs relative overflow-hidden text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <Award className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-700">
                {t('quiz.certHeader')}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                EduVibe AI Certificate
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
                className="text-center font-bold text-xl sm:text-2xl text-indigo-950 bg-transparent border-b-2 border-dashed border-indigo-300 pb-1 focus:outline-none focus:border-indigo-600 w-full"
                title="Name"
              />
              <p className="text-xs text-slate-600 leading-relaxed pt-2">
                {t('quiz.forCompleting')}
              </p>
              <h4 className="text-base font-bold text-slate-900 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                {course.title}
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs text-slate-600 max-w-md mx-auto font-medium">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('quiz.certDate')}</span>
                <span className="font-mono text-slate-700">{getLocaleDate()}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('quiz.certScore')}</span>
                <span className="font-mono text-emerald-600 font-bold">{scorePercentage}%</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('quiz.certAuth')}</span>
                <span className="font-mono text-indigo-600 font-semibold">EDUVIBE-OK</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


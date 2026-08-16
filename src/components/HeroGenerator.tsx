import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  Video,
  Presentation,
  Palette,
  Globe,
  Briefcase,
  Layers,
  Sliders,
  Target,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CoursePayload, CourseTheme } from '../types';
import { COURSE_THEMES, DEFAULT_COURSES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';
import {
  generateCourseWithClientGemini,
  generateSmartFallbackCourse,
  CourseGeneratorOptions
} from '../utils/courseGenerator';

interface HeroGeneratorProps {
  onCourseGenerated: (course: CoursePayload) => void;
  currentCourse: CoursePayload;
}

export const HeroGenerator: React.FC<HeroGeneratorProps> = ({ onCourseGenerated, currentCourse }) => {
  const { language, t } = useLanguage();
  const [topic, setTopic] = useState<string>('');
  const [audienceLevel, setAudienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [moduleLang, setModuleLang] = useState<string>('Français');
  const [industry, setIndustry] = useState<string>('Technologie & Digital');
  const [selectedTheme, setSelectedTheme] = useState<CourseTheme['id']>('indigo');

  // Advanced customization states
  const [objective, setObjective] = useState<string>('skills');
  const [tone, setTone] = useState<string>('interactive');
  const [sessionFormat, setSessionFormat] = useState<string>('workshop');
  const [customDirectives, setCustomDirectives] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const topicSuggestions = [
    'Cybersécurité & Hygiène Numérique',
    'IA Générative & Prompting en Entreprise',
    'Management Hybride & Feedback',
    'Négociation Commerciale Complexe',
    'Conformité RGPD & Données Sensibles',
    'Gestion de Crise & Résilience',
  ];

  const industrySuggestions = [
    'Technologie & Digital',
    'Banque, Finance & Assurance',
    'Santé & Industrie Pharma',
    'Conseil & Services B2B',
    'Commerce & E-commerce',
    'Ressources Humaines & Management',
    'Industrie & Énergie',
    'Secteur Public & Éducation',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);

    const steps = [
      t('generator.step1'),
      t('generator.step2'),
      t('generator.step3'),
      t('generator.step4'),
      t('generator.step5'),
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 1200);

    try {
      const customKey = localStorage.getItem('eduvibe_gemini_api_key') || '';
      const customModel = localStorage.getItem('eduvibe_gemini_model') || 'gemini-3.5-flash';

      let generatedCourse: CoursePayload | null = null;
      let isFallbackResult = false;
      let noticeMsg = '';

      const generatorParams: CourseGeneratorOptions = {
        topic,
        audienceLevel,
        slideCount,
        language: moduleLang,
        industry,
        themeId: selectedTheme,
        objective,
        tone,
        sessionFormat,
        customDirectives,
      };

      // 1. Try server API endpoint
      try {
        const response = await fetch('/api/generate-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': customKey,
          },
          body: JSON.stringify({
            ...generatorParams,
            model: customModel,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.course) {
            generatedCourse = data.course;
            isFallbackResult = Boolean(data.isFallback);
            noticeMsg = data.errorNotice || '';
          }
        }
      } catch (fetchErr) {
        console.warn('Server endpoint /api/generate-course unavailable, switching to client generator:', fetchErr);
      }

      // 2. Client-side generator fallback if server was unavailable / static deployment
      if (!generatedCourse) {
        if (customKey) {
          try {
            // Direct browser call to Gemini if API key is provided
            generatedCourse = await generateCourseWithClientGemini(customKey, {
              ...generatorParams,
              model: customModel,
            });
            isFallbackResult = false;
          } catch (geminiClientErr: any) {
            console.warn('Client Gemini call failed, using client smart fallback:', geminiClientErr);
            generatedCourse = generateSmartFallbackCourse(
              topic,
              audienceLevel,
              slideCount,
              moduleLang,
              industry,
              selectedTheme,
              objective,
              tone,
              sessionFormat,
              customDirectives
            );
            isFallbackResult = true;
            noticeMsg = geminiClientErr?.message;
          }
        } else {
          // Smart offline generator
          generatedCourse = generateSmartFallbackCourse(
            topic,
            audienceLevel,
            slideCount,
            moduleLang,
            industry,
            selectedTheme,
            objective,
            tone,
            sessionFormat,
            customDirectives
          );
          isFallbackResult = true;
        }
      }

      clearInterval(interval);

      if (generatedCourse) {
        onCourseGenerated(generatedCourse);
        setStatusMessage({
          type: 'success',
          text: isFallbackResult
            ? (noticeMsg ? `${t('generator.generatedSuccessFallback')} (${noticeMsg})` : t('generator.generatedSuccessFallback'))
            : t('generator.generatedSuccessGemini'),
        });
      } else {
        throw new Error('Course generation could not be completed.');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: t('generator.generatedError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xs">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-indigo-50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-96 h-96 rounded-full bg-slate-100 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t('hero.title')}{' '}
            <span className="text-indigo-600">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Quick stats / Features pills */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('hero.feat1')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{t('hero.feat2')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{t('hero.feat3')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('hero.feat4')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Generator Form & Customization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('generator.paramsTitle')}</h2>
                <p className="text-xs text-slate-500">{t('generator.paramsSubtitle')}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
              Gemini 3.7 Flash
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label htmlFor="course-topic-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t('generator.topicLabel')} *
              </label>
              <div className="relative">
                <input
                  id="course-topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t('generator.topicPlaceholder')}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base font-medium shadow-xs"
                />
              </div>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 mr-1">{t('generator.quickSuggestions')}</span>
                {topicSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 border border-slate-200 font-medium transition cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Level & Slide Volume Customizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Audience Level */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('generator.levelLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
                    const levelLabel =
                      lvl === 'Beginner'
                        ? t('level.beginner')
                        : lvl === 'Intermediate'
                        ? t('level.intermediate')
                        : t('level.advanced');
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setAudienceLevel(lvl)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          audienceLevel === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {levelLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slide Count Customizer with Interactive Range & Pills */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>{t('generator.slidesVolume')}</span>
                  <span className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {slideCount} {t('generator.slidesUnit')} (~{slideCount * 8} min)
                  </span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[3, 5, 8, 10, 12].map((count) => {
                    const desc = {
                      3: '3 Flash',
                      5: '5 Standard',
                      8: '8 Approfondi',
                      10: '10 Complet',
                      12: '12 Master',
                    };
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSlideCount(count)}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          slideCount === count
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {desc[count as keyof typeof desc]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Language & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="course-language-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('generator.moduleLang')}</span>
                </label>
                <select
                  id="course-language-select"
                  value={moduleLang}
                  onChange={(e) => setModuleLang(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs cursor-pointer"
                >
                  <option value="Français">🇫🇷 Français</option>
                  <option value="English">🇬🇧 English</option>
                  <option value="Tiếng Việt">🇻🇳 Tiếng Việt</option>
                  <option value="Español">🇪🇸 Español</option>
                  <option value="Deutsch">🇩🇪 Deutsch</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="course-industry-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('generator.industryLabel')}</span>
                </label>
                <select
                  id="course-industry-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs cursor-pointer"
                >
                  {industrySuggestions.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Customization Collapsible Accordion */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Personnalisation Pédagogique Avancée (Objectif, Ton, Format & Directives)</span>
                </div>
                {showAdvancedOptions ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showAdvancedOptions && (
                <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in">
                  {/* Objective & Tone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t('generator.objectiveLabel')}</span>
                      </label>
                      <select
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 shadow-xs cursor-pointer"
                      >
                        <option value="skills">{t('generator.objSkills')}</option>
                        <option value="awareness">{t('generator.objAwareness')}</option>
                        <option value="leadership">{t('generator.objLeadership')}</option>
                        <option value="sales">{t('generator.objSales')}</option>
                        <option value="crisis">{t('generator.objCrisis')}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t('generator.toneLabel')}</span>
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 shadow-xs cursor-pointer"
                      >
                        <option value="interactive">{t('generator.toneInteractive')}</option>
                        <option value="executive">{t('generator.toneExecutive')}</option>
                        <option value="operational">{t('generator.toneOperational')}</option>
                        <option value="educational">{t('generator.toneEducational')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Format & Duration */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{t('generator.formatLabel')}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'micro', label: t('generator.formatMicro') },
                        { id: 'demo', label: t('generator.formatDemo') },
                        { id: 'workshop', label: t('generator.formatWorkshop') },
                        { id: 'intensive', label: t('generator.formatIntensive') },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setSessionFormat(fmt.id)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                            sessionFormat === fmt.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Free text custom directives */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('generator.customDirectivesLabel')}
                    </label>
                    <textarea
                      rows={2}
                      value={customDirectives}
                      onChange={(e) => setCustomDirectives(e.target.value)}
                      placeholder={t('generator.customDirectivesPlaceholder')}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('generator.themeLabel')}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.values(COURSE_THEMES).map((thm) => (
                  <button
                    key={thm.id}
                    type="button"
                    onClick={() => setSelectedTheme(thm.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTheme === thm.id
                        ? 'bg-indigo-50/60 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
                      style={{ backgroundColor: thm.primaryColor }}
                    />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {thm.name.split(' ')[0]} {thm.name.split(' ')[1] || ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
                  statusMessage.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>{loadingStep || t('generator.submitLoading')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                  <span>{t('generator.submitBtn')} ({slideCount} slides)</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Sidebar (1 col): Preset Courses & Active Course */}
        <div className="space-y-6">
          {/* Active Course Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {t('sidebar.activeCourse')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentCourse.estimatedDuration} {t('sidebar.minutes')}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 line-clamp-2">{currentCourse.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{currentCourse.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Presentation className="w-4 h-4 text-indigo-600" />
                <span>{currentCourse.slides.length} slides</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{currentCourse.quiz.length} questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Live Ready</span>
              </div>
            </div>
          </div>

          {/* Preset Courses List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{t('sidebar.presetTitle')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('sidebar.presetDesc')}</p>
            </div>

            <div className="space-y-3">
              {DEFAULT_COURSES.map((crs) => (
                <div
                  key={crs.id}
                  onClick={() => onCourseGenerated(crs)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    currentCourse.id === crs.id
                      ? 'bg-indigo-50/60 border-indigo-600 shadow-2xs ring-1 ring-indigo-600'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{crs.title}</span>
                    <span className="text-[10px] text-indigo-600 font-semibold flex-shrink-0 ml-2">
                      {crs.slides.length} slides
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{crs.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

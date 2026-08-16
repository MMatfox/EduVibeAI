import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Clock,
  Globe,
  Briefcase,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play,
  RotateCw
} from 'lucide-react';
import { CoursePayload, CourseTheme } from '../types';
import {
  COURSE_THEMES,
  PRESET_COURSES,
  TOPIC_SUGGESTIONS_BY_LANG,
  INDUSTRIES_BY_LANG,
} from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';

interface HeroGeneratorProps {
  onCourseGenerated: (course: CoursePayload) => void;
  onSelectPreset: (course: CoursePayload) => void;
  currentCourse: CoursePayload;
}

export const HeroGenerator: React.FC<HeroGeneratorProps> = ({
  onCourseGenerated,
  onSelectPreset,
  currentCourse,
}) => {
  const { language: currentLang, t } = useLanguage();

  const [topic, setTopic] = useState('');
  const [audienceLevel, setAudienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [moduleLang, setModuleLang] = useState<string>('Français');
  const [industry, setIndustry] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<CourseTheme['id']>('indigo');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  // Synchronize suggestions & defaults when global language changes
  useEffect(() => {
    const defaultTopicMap = {
      fr: 'Cybersécurité en télétravail : Phishing & VPN',
      en: 'Remote Work Cybersecurity: Phishing & VPNs',
      vi: 'An toàn thông tin & Kỹ năng làm việc từ xa',
    };
    const defaultLangMap = {
      fr: 'Français',
      en: 'English',
      vi: 'Tiếng Việt',
    };
    const defaultIndustryMap = {
      fr: 'Général & Tertiaire',
      en: 'General & Corporate Services',
      vi: 'Tổng hợp & Dịch vụ Doanh nghiệp',
    };

    setTopic(defaultTopicMap[currentLang] || defaultTopicMap.fr);
    setModuleLang(defaultLangMap[currentLang] || 'Français');
    setIndustry(defaultIndustryMap[currentLang] || 'General');
  }, [currentLang]);

  const topicSuggestions = TOPIC_SUGGESTIONS_BY_LANG[currentLang] || TOPIC_SUGGESTIONS_BY_LANG.en;
  const industrySuggestions = INDUSTRIES_BY_LANG[currentLang] || INDUSTRIES_BY_LANG.en;

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
      const customModel = localStorage.getItem('eduvibe_gemini_model') || 'gemini-3.7-flash';

      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customKey,
        },
        body: JSON.stringify({
          topic,
          audienceLevel,
          slideCount,
          language: moduleLang,
          industry,
          themeId: selectedTheme,
          model: customModel,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.course) {
        onCourseGenerated(data.course);
        setStatusMessage({
          type: 'success',
          text: data.isFallback
            ? (data.errorNotice ? `${t('generator.generatedSuccessFallback')} (${data.errorNotice})` : t('generator.generatedSuccessFallback'))
            : t('generator.generatedSuccessGemini'),
        });
      } else {
        throw new Error(data.error || 'Generation failed');
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
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xs">
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('generator.paramsTitle')}</h2>
                <p className="text-xs text-slate-500">{t('generator.paramsSubtitle')}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
              Gemini 3.7 Flash
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label htmlFor="course-topic-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t('generator.topicLabel')}
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
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 border border-slate-200 font-medium transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Level & Slide Count */}
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
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
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

              {/* Slide Count */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>{t('generator.slidesVolume')}</span>
                  <span className="text-indigo-600 font-mono font-bold">{slideCount} {t('generator.slidesUnit')}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 8].map((count) => {
                    const desc = {
                      3: t('generator.volumeExpress'),
                      5: t('generator.volumeStandard'),
                      8: t('generator.volumeComplete'),
                    };
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSlideCount(count)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                          slideCount === count
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {count} ({desc[count as keyof typeof desc]})
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
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs"
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
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs"
                >
                  {industrySuggestions.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
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
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
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
                <span className="font-medium">{statusMessage.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-generate-training"
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 transition active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>{loadingStep || t('generator.submitLoading')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t('generator.submitBtn')}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Sidebar: Active Course Card & Preset Library */}
        <div className="space-y-6">
          {/* Active Course Card Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                {t('sidebar.activeCourse')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                {currentCourse.audienceLevel}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                {currentCourse.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {currentCourse.tagline || currentCourse.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentCourse.slides.length} {t('generator.slidesUnit')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>~{currentCourse.estimatedDuration} {t('sidebar.minutes')}</span>
              </div>
            </div>
          </div>

          {/* Preset Modules Library */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">{t('sidebar.presetTitle')}</h3>
            </div>
            <p className="text-xs text-slate-500">
              {t('sidebar.presetDesc')}
            </p>

            <div className="space-y-2.5">
              {PRESET_COURSES.map((preset) => (
                <div
                  key={preset.id}
                  id={`preset-card-${preset.id}`}
                  onClick={() => onSelectPreset(preset)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    currentCourse.id === preset.id
                      ? 'bg-indigo-50/70 border-indigo-600 shadow-xs ring-1 ring-indigo-600/30'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {preset.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-medium flex-shrink-0">
                      {preset.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {preset.topic} • {preset.slides.length} {t('generator.slidesUnit')} • {preset.quiz.length} Qs
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


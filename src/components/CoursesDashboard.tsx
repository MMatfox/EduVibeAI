import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Presentation,
  Video,
  HelpCircle,
  Edit3,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Save,
  Layers,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Radio,
  Check
} from 'lucide-react';
import { CoursePayload } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';
import { useLanguage } from '../context/LanguageContext';

interface CoursesDashboardProps {
  coursesList: CoursePayload[];
  currentCourse: CoursePayload;
  onSelectCourse: (course: CoursePayload) => void;
  onUpdateCourse: (updated: CoursePayload) => void;
  onDeleteCourse: (courseId: string) => void;
  onDuplicateCourse: (course: CoursePayload) => void;
  onCreateNewCourse: () => void;
  onOpenSlides: (course: CoursePayload) => void;
  onOpenClassroom: (course: CoursePayload) => void;
  onOpenQuiz: (course: CoursePayload) => void;
}

export const CoursesDashboard: React.FC<CoursesDashboardProps> = ({
  coursesList,
  currentCourse,
  onSelectCourse,
  onUpdateCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onCreateNewCourse,
  onOpenSlides,
  onOpenClassroom,
  onOpenQuiz,
}) => {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'slides'>('recent');

  // Edit Modal State
  const [editingCourse, setEditingCourse] = useState<CoursePayload | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editDuration, setEditDuration] = useState(30);
  const [editAudience, setEditAudience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [editThemeId, setEditThemeId] = useState<keyof typeof COURSE_THEMES>('indigo');

  // Delete Confirm Modal State
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    coursesList.forEach((c) => {
      if (c.industry) set.add(c.industry);
      if (c.topic) set.add(c.topic);
    });
    return Array.from(set);
  }, [coursesList]);

  // Filter & Sort Courses
  const filteredCourses = useMemo(() => {
    return coursesList
      .filter((c) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.subtitle || c.description || c.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
          selectedCategory === 'all' ||
          c.industry === selectedCategory ||
          c.topic === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'slides') {
          return (b.slides?.length || 0) - (a.slides?.length || 0);
        }
        // recent by default (keeps original list order or id timestamp)
        return 0;
      });
  }, [coursesList, searchQuery, selectedCategory, sortBy]);

  // Open Edit Modal
  const handleOpenEdit = (course: CoursePayload) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditSubtitle(course.subtitle || course.description || course.tagline || '');
    setEditTopic(course.topic || '');
    setEditDuration(course.estimatedDuration || 30);
    setEditAudience(course.audienceLevel || 'Intermediate');
    setEditThemeId((course.themeId as any) || 'indigo');
  };

  // Save Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const sub = editSubtitle.trim() || editingCourse.subtitle || editingCourse.description || '';

    const updated: CoursePayload = {
      ...editingCourse,
      title: editTitle.trim() || editingCourse.title,
      subtitle: sub,
      description: sub,
      tagline: sub,
      topic: editTopic.trim() || editingCourse.topic,
      estimatedDuration: Number(editDuration) || 30,
      audienceLevel: editAudience,
      themeId: editThemeId,
    };

    onUpdateCourse(updated);
    setEditingCourse(null);
  };

  // Total stats
  const totalSlides = useMemo(
    () => coursesList.reduce((acc, curr) => acc + (curr.slides?.length || 0), 0),
    [coursesList]
  );
  const totalQuizzes = useMemo(
    () => coursesList.reduce((acc, curr) => acc + (curr.quiz?.length || 0), 0),
    [coursesList]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wider uppercase border border-indigo-500/30 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t('courses.title')}</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {coursesList.length} {t('courses.statTotal').toLowerCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('courses.title')}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Create New Module CTA */}
        <button
          onClick={onCreateNewCourse}
          className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('courses.btnCreate')}</span>
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('courses.statTotal')}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{coursesList.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('courses.statSlides')}</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{totalSlides}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('courses.statQuizzes')}</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalQuizzes}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('courses.statActive')}</div>
          <div className="text-sm font-bold text-slate-800 truncate mt-1.5" title={currentCourse.title}>
            {currentCourse.title}
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Category Filters, Sort */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('courses.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Trier :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="recent">{t('courses.sortRecent')}</option>
              <option value="title">{t('courses.sortTitle')}</option>
              <option value="slides">{t('courses.sortSlides')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('courses.allCategories')} ({coursesList.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t('courses.noCoursesFound')}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('courses.noCoursesFoundDesc')}
          </p>
          <button
            onClick={onCreateNewCourse}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('courses.btnCreate')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCurrent = course.id === currentCourse.id;
            const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;
            const coverImage =
              course.slides?.[0]?.imageUrl ||
              course.slides?.find((s) => s.imageUrl)?.imageUrl ||
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80';

            return (
              <div
                key={course.id}
                className={`bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isCurrent ? 'ring-2 ring-indigo-600 border-indigo-300' : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Cover Header with Thematic Image */}
                  <div className="relative aspect-video max-h-44 w-full bg-slate-900 overflow-hidden group">
                    <img
                      src={coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs backdrop-blur-md"
                        style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
                      >
                        {course.industry || course.topic || 'Formation'}
                      </span>

                      {isCurrent ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-lg flex items-center gap-1.5 ring-2 ring-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('courses.activeBadge')}</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCourse(course);
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 hover:bg-indigo-600 text-slate-800 hover:text-white shadow-md backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/60 hover:border-indigo-600 cursor-pointer group"
                          title={t('courses.setActiveBtn')}
                        >
                          <Radio className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" />
                          <span>{t('courses.activateBtn')}</span>
                        </button>
                      )}
                    </div>

                    {/* Level & Duration Pill */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                      <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        🎯 {course.audienceLevel || t('courses.allLevels')}
                      </span>
                      <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>~{course.estimatedDuration || 30} min</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3">
                    {/* Active Status Pill / Switcher Button */}
                    {isCurrent ? (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('courses.activeBanner')}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-md">
                          {t('courses.inProgress')}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 hover:border-indigo-600 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                      >
                        <Radio className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" />
                        <span>{t('courses.setActiveBtn')}</span>
                      </button>
                    )}

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2" title={course.title}>
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2" title={course.subtitle || course.description || course.tagline}>
                      {course.subtitle || course.description || course.tagline}
                    </p>

                    {/* Metrics Count */}
                    <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-slate-600 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{course.slides?.length || 0} {t('courses.slidesCount')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{course.quiz?.length || 0} {t('courses.quizCount')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 space-y-2.5">
                  {/* Primary Action Button */}
                  <button
                    onClick={() => {
                      onSelectCourse(course);
                      onOpenSlides(course);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>{t('courses.openSlides')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Secondary Quick Action Row */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSelectCourse(course);
                        onOpenClassroom(course);
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      title={t('courses.visioTooltip')}
                    >
                      <Video className="w-3 h-3 text-indigo-600" />
                      <span className="hidden sm:inline">{t('courses.visio')}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectCourse(course);
                        onOpenQuiz(course);
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      title={t('courses.quizTooltip')}
                    >
                      <HelpCircle className="w-3 h-3 text-emerald-600" />
                      <span className="hidden sm:inline">{t('courses.quiz')}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      title={t('courses.editTooltip')}
                    >
                      <Edit3 className="w-3 h-3 text-slate-600" />
                      <span className="hidden sm:inline">{t('courses.edit')}</span>
                    </button>

                    <button
                      onClick={() => onDuplicateCourse(course)}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      title={t('courses.duplicateTooltip')}
                    >
                      <Copy className="w-3 h-3 text-slate-600" />
                      <span className="hidden sm:inline">{t('courses.duplicate')}</span>
                    </button>
                  </div>

                  {/* Delete Option (Disabled if only 1 course left) */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setDeletingCourseId(course.id)}
                      disabled={coursesList.length <= 1}
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={t('courses.deleteTooltip')}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t('courses.delete')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t('courses.editModalTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('courses.editTooltip')}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {t('courses.editTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {t('courses.editSubtitleLabel')}
                </label>
                <textarea
                  rows={2}
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {t('courses.editTopicLabel')}
                  </label>
                  <input
                    type="text"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {t('courses.editAudienceLabel')}
                  </label>
                  <select
                    value={editAudience}
                    onChange={(e) => setEditAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {t('courses.editDurationLabel')}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {t('courses.editThemeLabel')}
                  </label>
                  <select
                    value={editThemeId}
                    onChange={(e) => setEditThemeId(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="indigo">Indigo Tech</option>
                    <option value="emerald">Emerald Nature</option>
                    <option value="violet">Violet Futuriste</option>
                    <option value="amber">Amber Energy</option>
                    <option value="rose">Rose Coral</option>
                    <option value="slate">Slate Minimal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('courses.btnCancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('courses.btnSave')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">{t('courses.deleteModalTitle')}</h3>
              <p className="text-xs text-slate-500">
                {t('courses.deleteModalDesc')}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCourseId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('courses.btnCancel')}
              </button>
              <button
                onClick={() => {
                  onDeleteCourse(deletingCourseId);
                  setDeletingCourseId(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('courses.deleteConfirmBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

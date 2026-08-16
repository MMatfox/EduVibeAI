import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Layers,
  FileText,
  RotateCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Slide, VisualConcept } from '../types';

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTopic: string;
  nextSlideNumber: number;
  onAddSlide: (newSlide: Slide) => void;
}

export const AddSlideModal: React.FC<AddSlideModalProps> = ({
  isOpen,
  onClose,
  courseTopic,
  nextSlideNumber,
  onAddSlide,
}) => {
  const { language, t } = useLanguage();
  const [tab, setTab] = useState<'ai' | 'manual'>('ai');

  // AI generator subtopic
  const [subtopic, setSubtopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubtitle, setManualSubtitle] = useState('');
  const [manualCategory, setManualCategory] = useState('Focus Opérationnel');
  const [manualBullets, setManualBullets] = useState<string>('Point clé 1\nPoint clé 2\nPoint clé 3');
  const [manualConceptType, setManualConceptType] = useState<VisualConcept['type']>('framework');
  const [manualConceptTitle, setManualConceptTitle] = useState('Modèle Pédagogique');
  const [manualConceptDetails, setManualConceptDetails] = useState('Étape 1\nÉtape 2\nÉtape 3');
  const [manualOralScript, setManualOralScript] = useState('');

  if (!isOpen) return null;

  const handleGenerateAISlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const customKey = localStorage.getItem('eduvibe_gemini_api_key') || '';
      const resp = await fetch('/api/generate-single-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customKey,
        },
        body: JSON.stringify({
          courseTopic,
          subtopic: subtopic.trim() || 'Pratiques recommandées & Étude de cas',
          slideNumber: nextSlideNumber,
          language: language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'English' : 'Français',
        }),
      });

      const data = await resp.json();
      if (data.slide) {
        onAddSlide(data.slide);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération de la slide.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      slideNumber: nextSlideNumber,
      title: manualTitle,
      subtitle: manualSubtitle || 'Module d’approfondissement',
      categoryBadge: manualCategory || 'Focus Thématique',
      bullets: manualBullets
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean),
      visualConcept: {
        type: manualConceptType,
        title: manualConceptTitle || 'Concept Clé',
        badge: 'SYNTHÈSE',
        details: manualConceptDetails
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean),
      },
      trainerNotes: {
        timeMinutes: 8,
        keyTalkingPoints: [
          'Introduire clairement le sujet',
          'Donner un exemple vécu',
          'Vérifier la bonne compréhension de l’auditoire',
        ],
        oralScript: manualOralScript || `Passons maintenant à ce volet essentiel : ${manualTitle}.`,
        interactivePrompt: 'Avez-vous déjà fait face à cette situation dans votre quotidien professionnel ?',
      },
    };

    onAddSlide(newSlide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'vi' ? 'Thêm Slide Mới Vào Bài Học' : language === 'en' ? 'Add New Slide to Course' : 'Ajouter une Nouvelle Diapositive'}
              </h3>
              <p className="text-xs text-slate-500">
                Slide #{nextSlideNumber} • {courseTopic}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === 'ai'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Générer avec l’IA</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === 'manual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Création Manuelle</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {tab === 'ai' ? (
            <form onSubmit={handleGenerateAISlide} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <p>
                  Indiquez un sous-thème ou un angle spécifique (ex: <em>"Gestion de crise et communication"</em>, <em>"Checklist avant déploiement"</em>, <em>"Étude de cas client"</em>). Gemini créera une slide complète avec visuels et notes d’orateur.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Angle ou Sujet de la Slide
                </label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder="Ex: Checklist sécurité pour les déplacements professionnels..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Génération IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Créer la Slide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddManualSlide} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Titre de la slide *</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ex: Les 4 Piliers de la Résilience"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sous-titre explicatif</label>
                <input
                  type="text"
                  value={manualSubtitle}
                  onChange={(e) => setManualSubtitle(e.target.value)}
                  placeholder="Ex: Méthodologie d'application pratique en équipe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Points Clés (1 par ligne)</label>
                <textarea
                  rows={3}
                  value={manualBullets}
                  onChange={(e) => setManualBullets(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Script Oral pour le Formateur</label>
                <textarea
                  rows={2}
                  value={manualOralScript}
                  onChange={(e) => setManualOralScript(e.target.value)}
                  placeholder="Ce que le formateur doit dire à haute voix..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!manualTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Ajouter au module
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Shield,
  Zap,
  Cpu,
  Database,
  Flame
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioEffects } from '../utils/audioEffects';
import { CoursePayload } from '../types';
import { isFirebaseConfigured } from '../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coursesList: CoursePayload[];
  onImportCourses: (courses: CoursePayload[]) => void;
  onResetCourses: () => void;
  onApiKeyChange?: (hasKey: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  coursesList,
  onImportCourses,
  onResetCourses,
  onApiKeyChange,
}) => {
  const { language, t } = useLanguage();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'gemini' | 'firebase' | 'data'>('gemini');

  // Gemini state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('eduvibe_gemini_api_key') || '';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('eduvibe_gemini_model') || 'gemini-3.7-flash';
  });
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  }>({
    tested: false,
    valid: false,
    message: '',
  });

  // Firebase state
  const [fbApiKey, setFbApiKey] = useState<string>(() => localStorage.getItem('eduvibe_fb_api_key') || '');
  const [fbAuthDomain, setFbAuthDomain] = useState<string>(() => localStorage.getItem('eduvibe_fb_auth_domain') || '');
  const [fbProjectId, setFbProjectId] = useState<string>(() => localStorage.getItem('eduvibe_fb_project_id') || '');
  const [fbAppId, setFbAppId] = useState<string>(() => localStorage.getItem('eduvibe_fb_app_id') || '');

  const [isMuted, setIsMuted] = useState<boolean>(() => audioEffects.getIsMuted());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('eduvibe_gemini_api_key') || '';
      setApiKey(savedKey);
      setFbApiKey(localStorage.getItem('eduvibe_fb_api_key') || '');
      setFbAuthDomain(localStorage.getItem('eduvibe_fb_auth_domain') || '');
      setFbProjectId(localStorage.getItem('eduvibe_fb_project_id') || '');
      setFbAppId(localStorage.getItem('eduvibe_fb_app_id') || '');
      setKeyStatus({ tested: false, valid: false, message: '' });
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setKeyStatus({ tested: false, valid: false, message: '' });

    try {
      const resp = await fetch('/api/check-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await resp.json();

      setKeyStatus({
        tested: true,
        valid: Boolean(data.valid),
        message: data.valid
          ? 'Clé API valide et connectée à Google Gemini !'
          : data.message || 'Clé API invalide ou refusée.',
      });
    } catch (err: any) {
      setKeyStatus({
        tested: true,
        valid: false,
        message: 'Erreur lors du test de connexion.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('eduvibe_gemini_api_key', apiKey.trim());
    localStorage.setItem('eduvibe_gemini_model', selectedModel);

    // Save Firebase keys
    if (fbApiKey) localStorage.setItem('eduvibe_fb_api_key', fbApiKey.trim());
    if (fbAuthDomain) localStorage.setItem('eduvibe_fb_auth_domain', fbAuthDomain.trim());
    if (fbProjectId) localStorage.setItem('eduvibe_fb_project_id', fbProjectId.trim());
    if (fbAppId) localStorage.setItem('eduvibe_fb_app_id', fbAppId.trim());

    if (onApiKeyChange) {
      onApiKeyChange(Boolean(apiKey.trim()));
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleToggleMute = () => {
    const nextState = audioEffects.toggleMute();
    setIsMuted(nextState);
  };

  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(coursesList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eduvibe-courses-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportCourses(parsed);
          alert(`${parsed.length} module(s) importé(s) avec succès !`);
        } else if (parsed && parsed.id && parsed.slides) {
          onImportCourses([parsed]);
          alert('Module importé avec succès !');
        } else {
          alert('Fichier JSON invalide pour EduVibe.');
        }
      } catch {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  const fbConfigured = isFirebaseConfigured() || Boolean(fbApiKey && fbProjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Paramètres & Connexions Cloud</h3>
              <p className="text-xs text-slate-500">Google Gemini AI • Firebase Database • Préférences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveSettingsTab('gemini')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSettingsTab === 'gemini'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Google Gemini AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSettingsTab('firebase')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSettingsTab === 'firebase'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase Database</span>
            {fbConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSettingsTab('data')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSettingsTab === 'data'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Audio & Sauvegarde</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* TAB 1: GEMINI AI */}
          {activeSettingsTab === 'gemini' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="gemini-api-key-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Clé API Gemini (Google AI Studio)</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <span>Obtenir une clé gratuite</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="gemini-api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={isTestingKey || !apiKey.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition disabled:opacity-50 cursor-pointer shadow-2xs flex-shrink-0"
                  >
                    {isTestingKey ? 'Test...' : 'Tester'}
                  </button>
                </div>

                {keyStatus.tested && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      keyStatus.valid
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {keyStatus.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">{keyStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Model Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Modèle Gemini Sélectionné</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Recommandé • Ultra-rapide & Stable' },
                    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', desc: 'Haute performance & Précision' },
                    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', desc: 'Dernière mise à jour Google AI' },
                    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'Raisonnement Avancé' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        selectedModel === m.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{m.name}</span>
                        {selectedModel === m.id && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIREBASE DATABASE & AUTH */}
          {activeSettingsTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Google Firebase (Auth & Firestore)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Renseignez vos identifiants Firebase pour synchroniser vos utilisateurs et groupes en temps réel dans le Cloud Google. (Vous pouvez aussi les configurer dans le fichier <code>.env</code>).
                </p>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 underline pt-1"
                >
                  <span>Ouvrir la Console Firebase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Firebase API Key (apiKey)</label>
                  <input
                    type="text"
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Project ID</label>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      placeholder="eduvibe-app-123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Auth Domain</label>
                    <input
                      type="text"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      placeholder="eduvibe-app-123.firebaseapp.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">App ID</label>
                  <input
                    type="text"
                    value={fbAppId}
                    onChange={(e) => setFbAppId(e.target.value)}
                    placeholder="1:123456789012:web:abcdef123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA & AUDIO */}
          {activeSettingsTab === 'data' && (
            <div className="space-y-6">
              {/* Audio Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isMuted ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Effets sonores interactifs</h4>
                    <p className="text-[11px] text-slate-500">Sons lors des quiz, clics et célébrations</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isMuted
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                  }`}
                >
                  {isMuted ? 'Muet' : 'Activé'}
                </button>
              </div>

              <hr className="border-slate-100" />

              {/* Data Backup & Restore */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sauvegarde & Bibliothèque de cours</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportAllJSON}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exporter en JSON ({coursesList.length})</span>
                  </button>

                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importer un JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Voulez-vous réinitialiser les formations avec les modèles d’usine ?')) {
                        onResetCourses();
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold border border-rose-200 transition cursor-pointer flex items-center gap-1.5 ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {savedSuccess ? '✅ Modifications enregistrées !' : 'EduVibe AI • Google Cloud & Gemini'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

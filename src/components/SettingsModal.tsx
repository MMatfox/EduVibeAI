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
  Cpu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioEffects } from '../utils/audioEffects';
import { CoursePayload } from '../types';

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
  const [isMuted, setIsMuted] = useState<boolean>(() => audioEffects.getIsMuted());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('eduvibe_gemini_api_key') || '';
      setApiKey(savedKey);
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
        message: data.message || (data.valid ? 'API Key validated successfully!' : 'Invalid API key.'),
      });

      if (data.valid) {
        audioEffects.playCorrect();
      } else {
        audioEffects.playIncorrect();
      }
    } catch (err: any) {
      setKeyStatus({
        tested: true,
        valid: false,
        message: err.message || 'Connection error. Please verify network.',
      });
      audioEffects.playIncorrect();
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveSettings = () => {
    if (apiKey.trim()) {
      localStorage.setItem('eduvibe_gemini_api_key', apiKey.trim());
      onApiKeyChange?.(true);
    } else {
      localStorage.removeItem('eduvibe_gemini_api_key');
      onApiKeyChange?.(false);
    }

    localStorage.setItem('eduvibe_gemini_model', selectedModel);
    setSavedSuccess(true);
    audioEffects.playSlideClick();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleToggleMute = () => {
    const newMuted = audioEffects.toggleMute();
    setIsMuted(newMuted);
  };

  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(coursesList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EduVibe_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].slides) {
            onImportCourses(parsed);
            alert(`${parsed.length} courses imported successfully!`);
          } else if (parsed.slides) {
            onImportCourses([parsed]);
            alert('Course imported successfully!');
          } else {
            alert('Invalid EduVibe course file.');
          }
        } catch {
          alert('Error parsing JSON file.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'vi' ? 'Cài Đặt & Cấu Hình Gemini AI' : language === 'en' ? 'Settings & Gemini AI Config' : 'Paramètres & Configuration Gemini AI'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'vi' ? 'Quản lý API Key, mô hình AI và dữ liệu cá nhân' : language === 'en' ? 'Manage your API key, AI model, and course data' : 'Gérez votre clé API, le modèle IA et la sauvegarde'}
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

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Gemini API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
              >
                <span>{language === 'vi' ? 'Lấy key miễn phí' : language === 'en' ? 'Get free key' : 'Obtenir une clé gratuite'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey || !apiKey.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isTestingKey ? 'Test en cours...' : 'Tester la connexion'}</span>
              </button>

              {keyStatus.tested && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    keyStatus.valid ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {keyStatus.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span className="truncate max-w-[280px]">{keyStatus.message}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 {language === 'vi' 
                ? 'Key được lưu an toàn trong trình duyệt (localStorage). Nếu không có key, hệ thống sẽ sử dụng bộ sinh dự phòng thông minh.'
                : language === 'en'
                ? 'Your key is saved locally in your browser. If empty, the smart offline engine produces realistic sample courses.'
                : 'Votre clé est stockée localement dans votre navigateur. Si elle est vide, le moteur hors-ligne intelligent génère des modules complets.'}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'vi' ? 'Mô hình Gemini mặc định' : language === 'en' ? 'Default Gemini Model' : 'Modèle Gemini par défaut'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'gemini-3.7-flash',
                  name: 'Gemini 3.7 Flash',
                  desc: 'Recommandé • Ultra-rapide & Raisonnement créatif',
                },
                {
                  id: 'gemini-2.5-flash',
                  name: 'Gemini 2.5 Flash',
                  desc: 'Haute efficacité • Génération instantanée',
                },
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

          <hr className="border-slate-100" />

          {/* Audio & Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isMuted ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {language === 'vi' ? 'Hiệu ứng âm thanh sinh động' : language === 'en' ? 'Interactive Sound FX' : 'Effets sonores interactifs'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'vi' ? 'Âm thanh khi trả lời quiz đúng/sai và hoàn thành' : language === 'en' ? 'Audio cues for quiz feedback & achievements' : 'Sons lors des quiz, clics et célébrations'}
                </p>
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
              <span>{language === 'vi' ? 'Sao lưu & Phục hồi khóa học' : language === 'en' ? 'Course Backup & Library' : 'Sauvegarde & Bibliothèque de cours'}</span>
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

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {savedSuccess ? '✅ Modifications enregistrées !' : 'EduVibe AI v2.0 Production'}
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

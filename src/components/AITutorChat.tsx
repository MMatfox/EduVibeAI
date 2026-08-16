import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RotateCw,
  Volume2,
  VolumeX,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, CoursePayload, Slide } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AITutorChatProps {
  isOpen: boolean;
  onClose: () => void;
  course: CoursePayload;
  currentSlide: Slide;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  isOpen,
  onClose,
  course,
  currentSlide,
}) => {
  const { language, t } = useLanguage();

  const getQuickPrompts = () => {
    return [
      `💡 ${t('tutor.quickExplain')}`,
      `🏢 ${t('tutor.quickExample')}`,
      `🎯 ${t('tutor.quickQuizPrep')}`,
      `🎭 ${t('tutor.quickRoleplay')}`,
    ];
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('tutor.welcome'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when language changes if no other messages
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            content: t('tutor.welcome'),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relatedSlideNumber: currentSlide?.slideNumber,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInputText('');
    setIsLoading(true);

    try {
      const customKey = localStorage.getItem('eduvibe_gemini_api_key') || '';
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customKey,
        },
        body: JSON.stringify({
          message: textToSend,
          language: language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'English' : 'Français',
          courseContext: {
            title: course.title,
            topic: course.topic,
            audienceLevel: course.audienceLevel,
            currentSlide: {
              title: currentSlide?.title,
              bullets: currentSlide?.bullets,
              oralScript: currentSlide?.trainerNotes?.oralScript,
            },
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || (language === 'vi' ? 'Tôi sẵn sàng giải thích thêm về chủ đề này cùng bạn.' : language === 'en' ? 'I am here to help you dive deeper into this topic.' : 'Je suis à votre écoute pour approfondir ce sujet.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Désolé, une erreur s'est produite lors de la communication. Réessayez dans un instant.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'vi' ? 'vi-VN' : language === 'en' ? 'en-US' : 'fr-FR';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-4 sm:inset-10 max-w-4xl max-h-[85vh] mx-auto'
          : 'bottom-4 right-4 w-full sm:w-[440px] max-h-[600px]'
      } bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5`}
    >
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900">{t('tutor.title')}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
              {t('tutor.slideContext')} {currentSlide?.slideNumber} : {currentSlide?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  role: 'assistant',
                  content: t('tutor.welcome'),
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-200 transition cursor-pointer"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.content}
              </div>

              <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-slate-400">
                <span>{msg.timestamp}</span>

                {!isUser && (
                  <>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-slate-700 cursor-pointer flex items-center gap-0.5"
                      title="Copier le texte"
                    >
                      {copiedMsgId === msg.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                    </button>

                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      className={`hover:text-indigo-600 cursor-pointer flex items-center gap-0.5 ${
                        speakingMsgId === msg.id ? 'text-indigo-600 animate-pulse font-bold' : ''
                      }`}
                      title="Écouter la réponse"
                    >
                      {speakingMsgId === msg.id ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-indigo-700 max-w-[70%] shadow-xs">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>{t('tutor.thinking')}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-3 py-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {getQuickPrompts().map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 border border-slate-200 font-medium transition cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t('tutor.inputPlaceholder')}
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        <button
          id="btn-send-tutor-message"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shadow-xs cursor-pointer"
          title={t('tutor.send')}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

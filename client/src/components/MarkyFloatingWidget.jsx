'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Send,
  X,
  Maximize2,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Award,
  ChevronDown
} from 'lucide-react';
import api from '@/lib/api';
import SoundWaveVisualizer from './SoundWaveVisualizer';
import {
  getInitialMarkyMessages,
  saveMarkyMessages,
  clearMarkyMemory
} from '@/lib/markyMemory';

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' }
];

export default function MarkyFloatingWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].id);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamingIntervalRef = useRef(null);

  // Load short-term memory on mount & listen to sync events
  useEffect(() => {
    setMessages(getInitialMarkyMessages());

    const handleSync = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMessages(e.detail);
      }
    };

    window.addEventListener('marky-memory-sync', handleSync);
    return () => {
      window.removeEventListener('marky-memory-sync', handleSync);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll when messages update
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Adjust textarea height
  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  // Word-by-word streaming effect like ChatGPT
  const streamMessage = (fullText, modelDisplay) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: 'model',
        content: '',
        model: modelDisplay,
        isStreaming: true,
        timestamp: time
      }
    ]);

    const tokens = fullText.split(/(\s+)/);
    let tokenIdx = 0;
    let accumulated = '';

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    const interval = setInterval(() => {
      const step = tokens.length > 250 ? 3 : tokens.length > 100 ? 2 : 1;
      for (let i = 0; i < step && tokenIdx < tokens.length; i++) {
        accumulated += tokens[tokenIdx];
        tokenIdx++;
      }

      const stillStreaming = tokenIdx < tokens.length;
      let completedMessages = null;

      setMessages((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (lastIdx >= 0 && next[lastIdx].role === 'model') {
          next[lastIdx] = {
            ...next[lastIdx],
            content: accumulated,
            isStreaming: stillStreaming
          };
          if (!stillStreaming) {
            completedMessages = next;
          }
        }
        return next;
      });

      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      if (!stillStreaming) {
        clearInterval(interval);
        streamingIntervalRef.current = null;
        if (completedMessages) {
          saveMarkyMessages(completedMessages);
        }
      }
    }, 18);

    streamingIntervalRef.current = interval;
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: text, timestamp: time };
    const updatedHistory = [...messages, userMsg];

    setMessages(updatedHistory);
    saveMarkyMessages(updatedHistory);
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const activeBrandId = typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : null;
      const res = await api.sendChatMessage(updatedHistory, 'Marky', activeBrandId, selectedModel);

      if (res.success) {
        const currentModelObj = GEMINI_MODELS.find(m => m.id === selectedModel) || { label: 'Gemini 2.5 Flash' };
        const modelDisplay = res.model ? (GEMINI_MODELS.find(m => m.id === res.model)?.label || res.model) : currentModelObj.label;
        streamMessage(res.reply, modelDisplay);
      } else {
        setLoading(false);
        const errMsg = [
          ...updatedHistory,
          {
            role: 'model',
            content: `### ⚠️ Advisory Engine Notice\n${res.error || 'Failed to generate advisory response.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        setMessages(errMsg);
        saveMarkyMessages(errMsg);
      }
    } catch (err) {
      setLoading(false);
      const connErrMsg = [
        ...updatedHistory,
        {
          role: 'model',
          content: `### ⚠️ Connectivity Notice\nMarky could not connect: ${err.message}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(connErrMsg);
      saveMarkyMessages(connErrMsg);
    }
  };

  // Simple, easy 1-click microphone recording with Groq Whisper & sound wave
  const toggleSpeechRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        alert('Microphone access is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });

        if (audioBlob.size < 500) return;

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result.split(',')[1];
              const res = await api.transcribeAudio(base64Audio, audioBlob.type);
              if (res.success && res.text) {
                const transcribed = res.text.trim();
                setInputMessage((prev) => (prev.trim() ? `${prev.trim()} ${transcribed}` : transcribed));
              }
            } catch (err) {
              console.warn('Groq Whisper transcription error:', err);
            } finally {
              setIsTranscribing(false);
            }
          };
        } catch (err) {
          console.error('Audio processing error:', err);
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
      setIsRecording(false);
      setIsTranscribing(false);
      setAudioStream(null);
    }
  };

  const handleClearChat = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setActiveSpeakingIdx(null);
    setLoading(false);
    const reset = clearMarkyMemory();
    if (reset) setMessages(reset);
    setShowClearConfirm(false);
  };

  const navigateToFullScreen = () => {
    setIsOpen(false);
    router.push('/ai-chat');
  };

  // Do not render floating widget when already on the full /ai-chat page
  if (pathname === '/ai-chat') {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING LAUNCHER LOGO BUTTON (Every Page) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open Marky (Marketing Intelligence)"
            className="relative w-14 h-14 rounded-full p-1 bg-gradient-to-br from-[#4239C4] via-[#7A5DBB] to-[#F0A09F] shadow-xl marky-shadow-glow hover:scale-108 active:scale-95 transition-all duration-300 group cursor-pointer border-2 border-white/90"
          >
            <div className="w-full h-full rounded-full bg-[#0B091B] overflow-hidden flex items-center justify-center p-1.5">
              <img
                src="/marky-avatar.png"
                alt="Marky"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Glowing online badge */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full shadow-md">
              <span className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-75"></span>
            </span>
          </button>
        </div>
      )}

      {/* 2. SMALL OPEN TAB (COMPACT POPUP / DRAWER) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl border border-[#ECE8E3] flex flex-col overflow-hidden animate-fadeIn marky-shadow-elevated">
          
          {/* Header with Marky Brand Gradient Accent Line */}
          <div className="h-1 bg-marky-gradient w-full" />
          <div className="px-4 py-3 border-b border-[#ECE8E3] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0B091B] p-1 border border-white/10 shrink-0 flex items-center justify-center">
                <img src="/marky-avatar.png" alt="Marky" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[#141226] leading-none">Marky</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                    Marketing AI
                  </span>
                </div>
                <p className="text-[10px] text-[#6C6782] font-medium mt-0.5">Strategy Memory Active</p>
              </div>
            </div>

            {/* Header Actions: Fullscreen, Clear, Close */}
            <div className="flex items-center gap-1">
              {/* Fullscreen button to navigate to the big AI Chat page */}
              <button
                type="button"
                onClick={navigateToFullScreen}
                title="Expand to Fullscreen Page"
                className="p-1.5 text-[#6C6782] hover:text-[#4239C4] hover:bg-[#F7F6FA] rounded-lg transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Clear conversation memory */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Clear chat history"
                className="p-1.5 text-[#6C6782] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close / Minimize */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Marky"
                className="p-1.5 text-[#6C6782] hover:text-[#141226] hover:bg-[#F7F6FA] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFBFA] text-xs">
            {messages.map((m, idx) => {
              const isModel = m.role === 'model';
              return (
                <div key={idx} className={`flex items-start gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}>
                  {isModel && (
                    <div className="w-7 h-7 rounded-xl bg-[#0B091B] p-1 shrink-0 mt-0.5 border border-white/10 flex items-center justify-center shadow-xs">
                      <img src="/marky-avatar.png" alt="Marky" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      isModel
                        ? 'bg-white text-[#141226] border border-[#ECE8E3] marky-shadow-subtle'
                        : 'bg-[#4239C4] text-white font-medium shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {m.content}
                      {m.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-[#7A5DBB] animate-pulse ml-1 align-middle rounded-2xs" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking three bouncing dots */}
            {loading && (
              <div className="flex items-start gap-2.5 animate-fadeIn">
                <div className="w-7 h-7 rounded-xl bg-[#0B091B] p-1 shrink-0 mt-0.5 border border-white/10 flex items-center justify-center">
                  <img src="/marky-avatar.png" alt="Marky" className="w-full h-full object-contain" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-2.5 border border-[#ECE8E3] marky-shadow-subtle flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A5DBB] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A73B9D] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97FA5] animate-bounce"></span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6C6782]">Marky is synthesizing advice...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Composer with Sound Wave & Easy Mic */}
          <div className="p-3 bg-white border-t border-[#ECE8E3] shrink-0 space-y-2">
            
            {/* Live Audio Sound Wave Banner while Recording */}
            {isRecording && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#4239C4]/8 border border-[#4239C4]/25 text-[#4239C4] text-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-[11px] font-bold">Listening:</span>
                </div>
                {/* Real-time Dynamic Wave Line Visualizer */}
                <SoundWaveVisualizer stream={audioStream} isRecording={isRecording} />
                <button
                  type="button"
                  onClick={toggleSpeechRecording}
                  className="text-[11px] font-bold underline hover:text-[#141226] cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {isTranscribing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#4239C4]/8 border border-[#4239C4]/20 text-[#4239C4] text-xs animate-pulse">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#4239C4] border-t-transparent animate-spin"></div>
                <span className="text-[11px] font-bold">Transcribing with Groq Whisper...</span>
              </div>
            )}

            <div className="flex items-end gap-1.5 bg-[#F7F6FA] rounded-xl p-1.5 border border-[#ECE8E3] focus-within:border-[#7A5DBB] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4239C4]/15 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Marky anything about marketing..."
                className="flex-1 bg-transparent border-0 resize-none px-2 py-1 text-xs text-[#141226] placeholder-[#9894AD] focus:outline-hidden max-h-24 leading-relaxed"
              />

              <div className="flex items-center gap-1 shrink-0 pb-0.5">
                {/* 1-Click Simple Mic Button with Sound Wave */}
                <button
                  type="button"
                  onClick={toggleSpeechRecording}
                  title={isRecording ? 'Stop Recording' : 'Speak to Marky'}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-[#6C6782] hover:text-[#4239C4] hover:bg-[#4239C4]/10'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputMessage.trim()}
                  className="p-2 rounded-lg marky-btn-primary disabled:opacity-40 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 bg-[#0B091B]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl p-4 shadow-xl border border-[#ECE8E3] max-w-xs w-full space-y-3">
                <h4 className="text-xs font-bold text-[#141226]">Clear chat history?</h4>
                <p className="text-[11px] text-[#6C6782] leading-relaxed">
                  This will wipe short-term memory for Marky across all pages.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6C6782] hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  >
                    Clear Memory
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}

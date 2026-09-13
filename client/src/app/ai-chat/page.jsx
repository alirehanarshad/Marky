'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Copy,
  Check,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Cpu,
  TrendingUp,
  Target,
  ShieldAlert,
  Zap,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Layers,
  ArrowRight,
  Compass,
  AlertTriangle,
  Flame,
  Award,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import SoundWaveVisualizer from '@/components/SoundWaveVisualizer';
import UpPromptButton from '@/components/ui/UpPromptButton';
import {
  getInitialMarkyMessages,
  saveMarkyMessages,
  clearMarkyMemory
} from '@/lib/markyMemory';

const CONSULTANT_CAPABILITIES = [
  {
    id: 'marketing-strategy',
    title: 'Marketing Strategy',
    prompt: 'Analyze my marketing strategy: demand trends, acquisition channels, budget allocation, and scale roadmap.',
    desc: 'Acquisition velocity, channel allocation, and scalable growth engine.',
    icon: Compass,
    badge: 'Strategy'
  },
  {
    id: 'campaign-plan',
    title: 'Campaign Plan',
    prompt: 'Build a full campaign launch plan: offer structure, 30-day phased rollout, ad creatives, and ROAS milestones.',
    desc: 'Phased 30-day budget rollout, creative angles, and acquisition sequence.',
    icon: TrendingUp,
    badge: 'Campaigns'
  },
  {
    id: 'target-audience',
    title: 'Target Audience (ICP)',
    prompt: 'Define my Ideal Customer Profile (ICP): demographics, psychographics, emotional triggers, and purchase objections.',
    desc: 'Psychographics, pain triggers, objection handling, and buying friction.',
    icon: Layers,
    badge: 'Targeting'
  },
  {
    id: 'competitor-teardown',
    title: 'Competitor Teardown',
    prompt: 'Conduct a competitive teardown of my biggest rivals: identify their positioning gaps, creative hooks, and how to win.',
    desc: 'Vulnerability mapping, ad creative gap analysis, and margin comparison.',
    icon: Target,
    badge: 'Competitive'
  },
  {
    id: 'paid-ad-engine',
    title: 'Paid Ads Engine',
    prompt: 'Build a high-ROAS Meta Advantage+ and TikTok advertising strategy: 3-second viral hooks, testing matrix, and scale budget.',
    desc: 'Direct-response hooks, Advantage+ budget allocation, and ROAS targets.',
    icon: Zap,
    badge: 'Paid Ads'
  },
  {
    id: 'content-engine',
    title: 'Content Strategy',
    prompt: 'Build a 30-day viral content plan: UGC video angles, authority building, and organic customer acquisition flywheel.',
    desc: 'High-velocity UGC pillars, viral scripts, and organic community flywheel.',
    icon: Flame,
    badge: 'Organic'
  },
  {
    id: 'growth-audit',
    title: 'Funnel & Landing Page',
    prompt: 'Audit my current marketing funnel and landing page: diagnose customer acquisition bottlenecks, COD return risks, and conversion leaks.',
    desc: 'Conversion leak diagnosis, offer testing, and COD delivery margin buffers.',
    icon: BarChart3,
    badge: 'Audit'
  },
  {
    id: 'pricing-margins',
    title: 'Pricing & Margins',
    prompt: 'Determine an optimal pricing and bundle strategy: protect gross margins, absorb courier shipping, and maximize AOV.',
    desc: 'Contribution margin modeling, multi-tier bundling, and COD risk buffers.',
    icon: DollarSign,
    badge: 'Economics'
  }
];

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'High Reasoning' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', badge: 'Next-Gen Flash' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite', badge: 'Ultra-Fast' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', badge: 'Deep Strategy' }
];

const INITIAL_WELCOME = `Hey, I'm Marky.
Your AI marketing consultant.

Tell me what you're building, what you're trying to sell, or what you're trying to solve — and I'll help you figure out the strategy.`;

export default function AIChatPage() {
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].id);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeBrandName, setActiveBrandName] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamingIntervalRef = useRef(null);

  // Initialize brand name & load short-term memory on mount
  useEffect(() => {
    setMessages(getInitialMarkyMessages());

    if (typeof window !== 'undefined') {
      const activeBrand = localStorage.getItem('marketpulse_active_brand_name') || 'Lumina Skincare PK';
      setActiveBrandName(activeBrand);
    }

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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll on messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  // Toggle Voice Recording with real Groq Whisper Speech-to-Text & SoundWaveVisualizer
  const toggleSpeechRecording = async () => {
    if (isRecording) {
      // User clicked stop: stop recorder and send audio to Groq Whisper
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported in this browser. Please use Chrome or Edge.');
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
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });

        if (audioBlob.size < 500) {
          // Audio was too short
          return;
        }

        setIsTranscribing(true);
        try {
          // Convert Blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result.split(',')[1];
              const res = await api.transcribeAudio(base64Audio, audioBlob.type);
              if (res.success && res.text) {
                const transcribed = res.text.trim();
                setInputMessage((prev) => {
                  const cleaned = prev.trim();
                  return cleaned ? `${cleaned} ${transcribed}` : transcribed;
                });
              } else if (res.error) {
                console.warn('Whisper STT note:', res.error);
              }
            } catch (postErr) {
              console.warn('Transcription request error:', postErr.message);
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
      console.error('Failed to access microphone:', err);
      alert('Could not access microphone: ' + err.message);
      setIsRecording(false);
      setIsTranscribing(false);
      setAudioStream(null);
    }
  };

  // Toggle Text-to-Speech playback for a message
  const toggleSpeechPlayback = (text, idx) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis is not available in your browser.');
      return;
    }

    if (activeSpeakingIdx === idx) {
      window.speechSynthesis.cancel();
      setActiveSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for smooth speech
    const cleanText = text
      .replace(/[*#_`~>|]/g, ' ')
      .replace(/MARKY'S VERDICT/gi, "Marky's Strategic Verdict")
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setActiveSpeakingIdx(null);
    utterance.onerror = () => setActiveSpeakingIdx(null);

    setActiveSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // Word-by-word streaming effect like ChatGPT / Gemini
  const streamMessage = (fullText, modelDisplay) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Turn off loading thinking indicator and initialize streaming message
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

    // Split into tokens (preserving words and whitespace)
    const tokens = fullText.split(/(\s+)/);
    let tokenIdx = 0;
    let accumulated = '';

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    const interval = setInterval(() => {
      // Stream 1 to 3 tokens per tick for smooth, snappy typewriter pace
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

      // Smoothly auto-scroll to follow typing
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

  // Send message to Marky backend
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    // Stop recording if active
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

        // Stream reply word-by-word like ChatGPT
        streamMessage(res.reply, modelDisplay);
      } else {
        setLoading(false);
        const errMsg = [
          ...updatedHistory,
          {
            role: 'model',
            content: `### ⚠️ Advisory Engine Notice\n${res.error || 'Failed to generate advisory response. Please verify backend connectivity.'}`,
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
          content: `### ⚠️ Connectivity Notice\nMarky could not connect to the advisory engine: ${err.message}. Ensure backend is operational.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(connErrMsg);
      saveMarkyMessages(connErrMsg);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeakingIdx(null);
    setLoading(false);
    const reset = clearMarkyMemory();
    if (reset) {
      setMessages(reset);
    }
    setShowClearConfirm(false);
  };

  // Keyboard navigation: Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isFreshSession = messages.length <= 1;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white rounded-3xl overflow-hidden border border-[#ECE8E3] marky-shadow-card relative">
      
      {/* ========================================================================= */}
      {/* 1. TOP SECTION / HEADER: MARKY BRANDING & MINIMAL CONTROLS                */}
      {/* ========================================================================= */}
      <div className="px-6 py-3.5 border-b border-[#ECE8E3] bg-white/95 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3.5">
          {/* Avatar with circular frame, soft border, subtle glow, and status dot */}
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/30 shadow-xs group-hover:shadow-[0_0_18px_rgba(122,93,187,0.25)] transition-all duration-300">
              <div className="w-full h-full rounded-2xl bg-[#0B091B] overflow-hidden flex items-center justify-center border border-white/20 p-1">
                <img
                  src="/marky-avatar.png"
                  alt="Marky"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            {/* Pulsing online status indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full shadow-xs">
              <span className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-75"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#141226] tracking-tight leading-none">
                Marky
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4239C4]"></span>
                Marketing Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-[#6C6782]">
                Strategic Marketing Partner
              </span>
              {activeBrandName && (
                <>
                  <span className="text-[#9894AD] text-xs">•</span>
                  <span className="text-xs text-[#6C6782] font-medium">
                    Workspace: <span className="text-[#141226] font-semibold">{activeBrandName}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions: Model Switcher & Reset Session */}
        <div className="flex items-center gap-2">
          {/* Gemini Model Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs font-semibold text-[#3E3A52] shadow-2xs hover:bg-[#F2F0F7] transition-colors">
            <Cpu className="w-3.5 h-3.5 text-[#7A5DBB]" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-[#141226] focus:outline-hidden cursor-pointer"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.badge})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            title="Reset conversation history"
            className="flex items-center gap-1.5 text-xs font-medium text-[#6C6782] hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50/60 transition-colors border border-transparent hover:border-red-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SCROLLABLE CONVERSATION AREA                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-[#FCFBFA]">
        
        {/* Fresh Session Greeting & Suggestion Showcase */}
        {isFreshSession && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Hero Greeting Box with Marky Brand Styling */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ECE8E3] marky-shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#4239C4]/8 via-[#A73B9D]/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20"></div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#0B091B] p-2 border border-white/10 shrink-0 shadow-lg flex items-center justify-center">
                  <img src="/marky-avatar.png" alt="Marky" className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4239C4]/8 border border-[#4239C4]/20 text-[#4239C4] text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4239C4] animate-pulse"></span>
                    Marketing Strategy Partner
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#141226] tracking-tight">
                    Meet Marky
                  </h2>
                  <p className="text-xs md:text-sm font-semibold text-[#4239C4]">
                    Your marketing strategy partner.
                  </p>
                  <p className="text-xs md:text-sm text-[#5F5B73] font-normal leading-relaxed max-w-2xl">
                    Turn ideas, campaigns, and customer data into clearer marketing decisions. Tell me what you're building, what you're trying to sell, or what you're trying to solve — and I'll help you figure out the strategy.
                  </p>
                </div>
              </div>
            </div>

            {/* "What can Marky analyze?" Suggestion Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#4239C4]" />
                  <h3 className="text-xs font-bold text-[#141226] uppercase tracking-wider">
                    What can Marky analyze?
                  </h3>
                </div>
                <span className="text-[11px] text-[#6C6782] font-medium">
                  Select a strategic capability to begin
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CONSULTANT_CAPABILITIES.map((cap) => {
                  const Icon = cap.icon;
                  return (
                    <button
                      key={cap.id}
                      onClick={() => handleSendMessage(cap.prompt)}
                      className="group p-4 bg-white hover:bg-[#FDFCFB] rounded-2xl border border-[#ECE8E3] hover:border-[#7A5DBB]/40 marky-shadow-subtle hover:marky-shadow-card transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center group-hover:bg-[#4239C4] group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C6782] group-hover:text-[#4239C4] transition-colors">
                            {cap.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#141226] group-hover:text-[#4239C4] transition-colors">
                          {cap.title}
                        </h4>
                        <p className="text-[11px] text-[#6C6782] line-clamp-2 mt-1 leading-normal">
                          {cap.desc}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-[#F3F0EC] flex items-center justify-between text-[11px] font-semibold text-[#4239C4] group-hover:translate-x-0.5 transition-transform">
                        <span>Run Analysis</span>
                        <ArrowRight className="w-3 h-3 text-[#7A5DBB]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Existing Messages Stream */}
        {!isFreshSession && (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((m, idx) => {
              const isModel = m.role === 'model';

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 ${isModel ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  {/* Marky Avatar on Left */}
                  {isModel && (
                    <div className="w-9 h-9 rounded-xl bg-[#0B091B] p-1 border border-white/10 shrink-0 shadow-sm mt-1 flex items-center justify-center">
                      <img
                        src="/marky-avatar.png"
                        alt="Marky"
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                      />
                    </div>
                  )}

                  {/* Message Body Container */}
                  <div
                    className={`max-w-3xl rounded-2xl text-xs md:text-sm leading-relaxed ${
                      isModel
                        ? 'bg-white text-[#141226] border border-[#ECE8E3] marky-shadow-card p-5 md:p-6 w-full'
                        : 'bg-[#4239C4] text-white font-medium shadow-sm px-5 py-3.5 rounded-br-xs'
                    }`}
                  >
                    {/* Model Message Header */}
                    {isModel && (
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F3F0EC]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#141226] text-xs tracking-tight">
                            Marky
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                            {m.model || 'Gemini 2.5 Flash'}
                          </span>
                          {m.timestamp && (
                            <span className="text-[11px] text-[#9894AD] ml-1 font-normal">
                              {m.timestamp}
                            </span>
                          )}
                        </div>

                        {/* Speech & Copy Action Controls */}
                        {m.isStreaming ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 border border-[#4239C4]/20 text-[11px] font-bold text-[#4239C4] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7A5DBB] animate-ping"></span>
                            <span>Typing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => toggleSpeechPlayback(m.content, idx)}
                              title={activeSpeakingIdx === idx ? 'Stop voice playback' : 'Listen to Marky’s advice'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                activeSpeakingIdx === idx
                                  ? 'bg-[#4239C4]/10 text-[#4239C4] font-bold'
                                  : 'text-[#9894AD] hover:text-[#4239C4] hover:bg-[#F7F6FA]'
                              }`}
                            >
                              {activeSpeakingIdx === idx ? (
                                <VolumeX className="w-3.5 h-3.5 animate-pulse text-[#4239C4]" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(m.content, idx)}
                              title="Copy advisory text"
                              className="p-1.5 text-[#9894AD] hover:text-[#4239C4] hover:bg-[#F7F6FA] rounded-lg transition-colors cursor-pointer"
                            >
                              {copiedIdx === idx ? (
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Consulting Content Formatted Output with Typewriter Caret */}
                    <div className="space-y-3">
                      {isModel ? (
                        <div className="relative">
                          <ConsultingReportRenderer content={m.content} />
                          {m.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-[#7A5DBB] animate-pulse ml-1 align-middle rounded-xs" />
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Thinking / Three Bouncing Dots Indicator */}
            {loading && (
              <div className="flex items-start gap-3.5 animate-fadeIn">
                <div className="w-9 h-9 rounded-xl bg-[#0B091B] p-1 border border-white/10 shrink-0 shadow-sm mt-1 flex items-center justify-center">
                  <img src="/marky-avatar.png" alt="Marky" className="w-full h-full object-contain" />
                </div>
                <div className="bg-white rounded-2xl px-5 py-3.5 border border-[#ECE8E3] marky-shadow-subtle flex items-center gap-3">
                  <div className="flex items-center gap-1.5 py-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4239C4] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7A5DBB] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97FA5] animate-bounce"></span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-[#ECE8E3] pl-3">
                    <span className="text-xs font-semibold text-[#141226]">Marky is thinking</span>
                    <span className="text-[11px] text-[#6C6782] font-medium hidden sm:inline">• synthesizing strategy</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PERSISTENT FLOATING CHAT COMPOSER WITH LIVE VOICE INPUT                */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white border-t border-[#ECE8E3] shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* Recording & Groq Whisper Transcribing Banner + Wave Line Visualizer */}
          {isRecording && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#4239C4]/8 border border-[#4239C4]/25 text-[#4239C4] text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4239C4] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4239C4]"></span>
                  </span>
                  <span className="font-semibold">Listening to your voice... Tap Done to transcribe with Whisper</span>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeechRecording}
                  className="px-3 py-1 rounded-lg bg-[#4239C4] hover:bg-[#372EB3] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
              {/* Dynamic Sound Wave line reacting directly to user voice */}
              <SoundWaveVisualizer stream={audioStream} isRecording={isRecording} />
            </div>
          )}

          {isTranscribing && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#4239C4]/8 border border-[#4239C4]/20 text-[#4239C4] text-xs animate-pulse shadow-xs">
              <div className="w-4 h-4 rounded-full border-2 border-[#4239C4] border-t-transparent animate-spin"></div>
              <span className="font-bold">Transcribing audio via Groq Whisper Large v3 Turbo...</span>
            </div>
          )}

          <div className="flex items-end gap-2 bg-[#F7F6FA] rounded-2xl p-2 border border-[#ECE8E3] focus-within:border-[#7A5DBB] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4239C4]/15 transition-all shadow-xs">
            
            {/* Auto-expanding Multiline Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask Marky anything about marketing, campaigns, pricing, or growth strategy…"
              className="flex-1 bg-transparent border-0 resize-none px-3 py-2 text-xs md:text-sm text-[#141226] placeholder-[#9894AD] focus:outline-hidden max-h-40 leading-relaxed"
            />

            {/* Action Buttons: Up-Prompt + Microphone + Send */}
            <div className="flex items-center gap-1.5 shrink-0 pb-1 pr-1">
              {/* Up-Prompt Enhancement Button */}
              <UpPromptButton
                value={inputMessage}
                onChange={(enhanced) => setInputMessage(enhanced)}
                type="text"
                context="Strategic marketing consultation query"
                compact
              />

              {/* Real Interactive Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeechRecording}
                title={isRecording ? 'Stop recording voice' : 'Speak to Marky (Voice Input)'}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20 scale-105'
                    : 'text-[#6C6782] hover:text-[#4239C4] hover:bg-[#4239C4]/10'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4 animate-bounce" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Send Button with Marky Brand Gradient */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="marky-btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Micro-caption helper */}
          <div className="flex items-center justify-between px-2 text-[11px] text-[#9894AD]">
            <span>Press <kbd className="font-sans px-1 py-0.5 rounded bg-[#ECE8E3] text-[#3E3A52] font-semibold">Enter</kbd> to send · <kbd className="font-sans px-1 py-0.5 rounded bg-[#ECE8E3] text-[#3E3A52] font-semibold">Shift + Enter</kbd> for newline</span>
            <span className="hidden sm:inline">Marky Decision & Strategic Intelligence Enabled</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CLEAR CHAT CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-[#0B091B]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#ECE8E3] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#141226]">Clear this conversation?</h4>
                <p className="text-xs text-[#6C6782] mt-0.5">Your current strategic chat session will be wiped.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C6782] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =============================================================================
// CONSULTING REPORT RENDERER COMPONENT
// Formats Marky's responses with rich hierarchy, Decision Panels, Badges & Tables
// =============================================================================
function ConsultingReportRenderer({ content }) {
  if (!content) return null;

  // Split into lines/blocks to detect markdown structures
  const lines = content.split('\n');
  const renderedElements = [];
  let inTable = false;
  let tableRows = [];
  let inVerdict = false;
  let verdictLines = [];

  const flushVerdict = (key) => {
    if (verdictLines.length > 0) {
      renderedElements.push(
        <div
          key={`verdict-${key}`}
          className="my-4 rounded-2xl bg-gradient-to-br from-[#0B091B] via-[#130F2A] to-[#1D163C] text-white p-5 md:p-6 border border-[#7A5DBB]/40 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/10">
            <Award className="w-4 h-4 text-[#D97FA5] shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#DCD7FF]">
              Marky's Strategic Verdict
            </span>
          </div>
          <div className="space-y-2 text-xs md:text-sm leading-relaxed text-[#D2CEE6]">
            {verdictLines.map((vLine, vIdx) => {
              const clean = vLine.replace(/^[>#\s*]+/, '').trim();
              if (!clean) return null;

              // Check for highlight items
              if (clean.toLowerCase().includes('best opportunity:')) {
                return (
                  <div key={vIdx} className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-[#4239C4]/30">
                    <span className="font-bold text-[#A59FFF] shrink-0">Best Opportunity:</span>
                    <span>{clean.replace(/best opportunity:/i, '').trim()}</span>
                  </div>
                );
              }
              if (clean.toLowerCase().includes('main advantage:')) {
                return (
                  <div key={vIdx} className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-[#7A5DBB]/30">
                    <span className="font-bold text-[#D1C3FF] shrink-0">Main Advantage:</span>
                    <span>{clean.replace(/main advantage:/i, '').trim()}</span>
                  </div>
                );
              }
              if (clean.toLowerCase().includes('biggest risk:')) {
                return (
                  <div key={vIdx} className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-[#F0A09F]/30">
                    <span className="font-bold text-[#F0A09F] shrink-0">Biggest Risk:</span>
                    <span>{clean.replace(/biggest risk:/i, '').trim()}</span>
                  </div>
                );
              }
              if (clean.toLowerCase().includes('expected challenge:')) {
                return (
                  <div key={vIdx} className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-[#D97FA5]/30">
                    <span className="font-bold text-[#FFB6CF] shrink-0">Expected Challenge:</span>
                    <span>{clean.replace(/expected challenge:/i, '').trim()}</span>
                  </div>
                );
              }
              if (clean.toLowerCase().includes('recommendation') || clean.toLowerCase().includes('recommended next move:')) {
                return (
                  <div key={vIdx} className="mt-3 pt-2.5 border-t border-white/10 flex items-start gap-2 text-[#F3C5A8] font-medium">
                    <span className="font-bold text-white shrink-0">Recommendation:</span>
                    <span>{clean.replace(/recommended next move:/i, '').replace(/recommendation:/i, '').trim()}</span>
                  </div>
                );
              }

              return <p key={vIdx}>{clean}</p>;
            })}
          </div>
        </div>
      );
      verdictLines = [];
      inVerdict = false;
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const rows = tableRows.slice(1).filter((r) => !r.every((c) => c.includes('---')));

      renderedElements.push(
        <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-[#ECE8E3] shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F6FA] border-b border-[#ECE8E3]">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-2.5 font-bold text-[#141226]">
                    {h.replace(/[*_]/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-[#F3F0EC] hover:bg-[#FAF9FC]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-[#3E3A52]">
                      {cell.replace(/[*_]/g, '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for start of Verdict Block
    if (trimmed.includes("MARKY'S VERDICT") || trimmed.includes("MARKY’S VERDICT")) {
      flushTable(index);
      inVerdict = true;
      verdictLines.push(trimmed);
      return;
    }

    if (inVerdict) {
      if (trimmed.startsWith('###') && !trimmed.includes('VERDICT')) {
        flushVerdict(index);
      } else {
        verdictLines.push(trimmed);
        return;
      }
    }

    // Check for Markdown Table Rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // Dividers
    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(<hr key={index} className="my-4 border-[#ECE8E3]" />);
      return;
    }

    // H3 / H4 Section Titles
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace('### ', '');
      renderedElements.push(
        <h3 key={index} className="text-sm md:text-base font-bold text-[#141226] pt-3 pb-1 border-b border-[#F3F0EC] flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#4239C4] to-[#7A5DBB]"></span>
          <span>{headingText}</span>
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      const headingText = trimmed.replace('#### ', '');
      renderedElements.push(
        <h4 key={index} className="text-xs md:text-sm font-bold text-[#3E3A52] pt-2 pb-0.5">
          {headingText}
        </h4>
      );
      return;
    }

    // Specialized Badges: FACT, ASSUMPTION, ESTIMATE, RECOMMENDATION
    if (trimmed.startsWith('- **FACT:**') || trimmed.startsWith('**FACT:**')) {
      const rest = trimmed.replace(/[-*]*\s*\*\*FACT:\*\*/, '').trim();
      renderedElements.push(
        <div key={index} className="my-1.5 flex items-start gap-2 p-2.5 rounded-xl bg-[#4239C4]/6 border border-[#4239C4]/20 text-[#141226] text-xs">
          <span className="px-2 py-0.5 rounded-md bg-[#4239C4] text-white font-bold text-[10px] tracking-wider uppercase shrink-0">
            FACT
          </span>
          <span className="leading-relaxed">{rest}</span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('- **ASSUMPTION:**') || trimmed.startsWith('**ASSUMPTION:**')) {
      const rest = trimmed.replace(/[-*]*\s*\*\*ASSUMPTION:\*\*/, '').trim();
      renderedElements.push(
        <div key={index} className="my-1.5 flex items-start gap-2 p-2.5 rounded-xl bg-[#A73B9D]/6 border border-[#A73B9D]/20 text-[#141226] text-xs">
          <span className="px-2 py-0.5 rounded-md bg-[#A73B9D] text-white font-bold text-[10px] tracking-wider uppercase shrink-0">
            ASSUMPTION
          </span>
          <span className="leading-relaxed">{rest}</span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('- **ESTIMATE:**') || trimmed.startsWith('**ESTIMATE:**')) {
      const rest = trimmed.replace(/[-*]*\s*\*\*ESTIMATE:\*\*/, '').trim();
      renderedElements.push(
        <div key={index} className="my-1.5 flex items-start gap-2 p-2.5 rounded-xl bg-[#4A4BCF]/6 border border-[#4A4BCF]/20 text-[#141226] text-xs">
          <span className="px-2 py-0.5 rounded-md bg-[#4A4BCF] text-white font-bold text-[10px] tracking-wider uppercase shrink-0">
            ESTIMATE
          </span>
          <span className="leading-relaxed">{rest}</span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('- **RECOMMENDATION:**') || trimmed.startsWith('**RECOMMENDATION:**')) {
      const rest = trimmed.replace(/[-*]*\s*\*\*RECOMMENDATION:\*\*/, '').trim();
      renderedElements.push(
        <div key={index} className="my-1.5 flex items-start gap-2 p-2.5 rounded-xl bg-[#7A5DBB]/6 border border-[#7A5DBB]/20 text-[#141226] text-xs">
          <span className="px-2 py-0.5 rounded-md bg-[#7A5DBB] text-white font-bold text-[10px] tracking-wider uppercase shrink-0">
            RECOMMENDATION
          </span>
          <span className="leading-relaxed">{rest}</span>
        </div>
      );
      return;
    }

    // Winning Factors / Risk Factors / Failure Points Callout Cards
    if (trimmed.includes('**WINNING FACTORS') || trimmed.includes('WINNING FACTORS:')) {
      renderedElements.push(
        <div key={index} className="mt-2 text-xs font-bold text-[#4239C4] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{trimmed.replace(/[*_]/g, '')}</span>
        </div>
      );
      return;
    }

    if (trimmed.includes('**RISK FACTORS') || trimmed.includes('RISK FACTORS:')) {
      renderedElements.push(
        <div key={index} className="mt-2 text-xs font-bold text-[#F0A09F] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{trimmed.replace(/[*_]/g, '')}</span>
        </div>
      );
      return;
    }

    if (trimmed.includes('**FAILURE POINTS') || trimmed.includes('FAILURE POINTS:')) {
      renderedElements.push(
        <div key={index} className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{trimmed.replace(/[*_]/g, '')}</span>
        </div>
      );
      return;
    }

    // Bullet Points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 text-[#3E3A52] my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A5DBB] shrink-0 mt-2"></span>
          <span className="leading-relaxed">{renderInlineMarkdown(bulletText)}</span>
        </div>
      );
      return;
    }

    // Numbered List
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^\d+/)[0];
      const rest = trimmed.replace(/^\d+\.\s*/, '');
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 text-[#3E3A52] my-1 pl-1">
          <span className="text-xs font-bold text-[#4239C4] shrink-0 mt-0.5">{num}.</span>
          <span className="leading-relaxed">{renderInlineMarkdown(rest)}</span>
        </div>
      );
      return;
    }

    // Regular paragraphs / text
    if (trimmed.length > 0) {
      renderedElements.push(
        <p key={index} className="text-slate-700 leading-relaxed my-1">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  // Flush any remaining tables or verdicts
  flushVerdict('end');
  flushTable('end');

  return <div className="space-y-1">{renderedElements}</div>;
}

// Helper to format inline bold, italic, and tags
function renderInlineMarkdown(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  Copy,
  Check,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

export default function LeadDetailPanel({
  lead,
  stages = [],
  isOpen,
  onClose,
  onLeadUpdated
}) {
  const [activeTab, setActiveTab] = useState('ai_intel'); // 'ai_intel' | 'outreach' | 'tasks' | 'activities'
  const [currentLead, setCurrentLead] = useState(lead);
  const [loadingAction, setLoadingAction] = useState(false);
  const [copied, setCopied] = useState(false);

  // Outreach state
  const [outreachChannel, setOutreachChannel] = useState('whatsapp');
  const [outreachMessage, setOutreachMessage] = useState('');
  const [outreachSubject, setOutreachSubject] = useState('');
  const [outreachLoading, setOutreachLoading] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasksLoading, setTasksLoading] = useState(false);

  // Activities state
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setCurrentLead(lead);
      loadTasks(lead.id);
      loadActivities(lead.id);
      // If lead already has pre-generated outreach or AI json, set it
      if (lead.ai_research_json) {
        try {
          const parsed = typeof lead.ai_research_json === 'string' ? JSON.parse(lead.ai_research_json) : lead.ai_research_json;
          if (parsed.initial_outreach_draft) {
            setOutreachMessage(parsed.initial_outreach_draft);
          }
        } catch (e) {}
      }
    }
  }, [lead]);

  const loadTasks = async (leadId) => {
    setTasksLoading(true);
    try {
      const res = await api.getLeadTasks(leadId);
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setTasksLoading(false);
    }
  };

  const loadActivities = async (leadId) => {
    setActivitiesLoading(true);
    try {
      const res = await api.getLeadActivities(leadId);
      if (res.success) {
        setActivities(res.data || []);
      }
    } catch (e) {
      console.error('Failed to load activities:', e);
    } finally {
      setActivitiesLoading(false);
    }
  };

  if (!isOpen || !currentLead) return null;

  // Helpers
  const formatScore = (num) => {
    const val = Number(num) || (currentLead.lead_score === 'A' ? 88 : currentLead.lead_score === 'B' ? 68 : 45);
    return Math.min(100, Math.max(0, Math.round(val)));
  };
  const scoreNum = formatScore(currentLead.lead_score_numeric);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-[#4239C4] bg-[#4239C4]/10 border-[#4239C4]/20';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const cleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  // Stage update
  const handleStageChange = async (e) => {
    const newStageId = e.target.value;
    const stageObj = stages.find((s) => String(s.id) === String(newStageId));
    try {
      const res = await api.updateLeadStage(currentLead.id, newStageId, stageObj?.name);
      if (res.success) {
        const updated = { ...currentLead, stage_id: Number(newStageId), status: stageObj?.name || currentLead.status };
        setCurrentLead(updated);
        if (onLeadUpdated) onLeadUpdated(updated);
        loadActivities(currentLead.id);
      }
    } catch (err) {
      alert(`Error moving stage: ${err.message}`);
    }
  };

  // Re-score with AI
  const handleRescore = async () => {
    setLoadingAction(true);
    try {
      const res = await api.scoreLead(currentLead.id);
      if (res.success && res.data) {
        const updated = {
          ...currentLead,
          lead_score_numeric: res.data.score,
          lead_score: res.data.grade || currentLead.lead_score,
          lead_score_explanation: res.data.explanation || currentLead.lead_score_explanation,
          ai_research_json: res.data.research || currentLead.ai_research_json
        };
        setCurrentLead(updated);
        if (onLeadUpdated) onLeadUpdated(updated);
        loadActivities(currentLead.id);
      }
    } catch (err) {
      alert(`Re-score error: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Generate Outreach Copy
  const handleGenerateOutreach = async () => {
    setOutreachLoading(true);
    try {
      const res = await api.generateOutreach(currentLead.id, outreachChannel);
      if (res.success && res.data) {
        setOutreachMessage(res.data.message || res.data.body || '');
        setOutreachSubject(res.data.subject || '');
        loadActivities(currentLead.id);
      }
    } catch (err) {
      alert(`Outreach generation error: ${err.message}`);
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleCopyOutreach = () => {
    const textToCopy = outreachSubject ? `Subject: ${outreachSubject}\n\n${outreachMessage}` : outreachMessage;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tasks actions
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await api.createLeadTask(currentLead.id, {
        title: newTaskTitle.trim(),
        task_type: 'follow_up'
      });
      if (res.success) {
        setNewTaskTitle('');
        loadTasks(currentLead.id);
      }
    } catch (err) {
      alert(`Error creating task: ${err.message}`);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const nextCompleted = !task.is_completed;
      await api.toggleLeadTask(task.id, nextCompleted);
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, is_completed: nextCompleted } : t)));
    } catch (err) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  // Suggest Next Action with AI
  const handleSuggestAction = async () => {
    setLoadingAction(true);
    try {
      const res = await api.suggestLeadAction(currentLead.id);
      if (res.success && res.data) {
        const updated = { ...currentLead, next_action: res.data.next_action };
        setCurrentLead(updated);
        if (onLeadUpdated) onLeadUpdated(updated);
        loadTasks(currentLead.id);
      }
    } catch (err) {
      alert(`Action suggestion error: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Add note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.addLeadActivity(currentLead.id, {
        activity_type: 'Note',
        summary: newNote.trim(),
        details: 'Added via Lead Intelligence Panel',
        performed_by: 'Operator'
      });
      setNewNote('');
      loadActivities(currentLead.id);
    } catch (err) {
      alert(`Error adding note: ${err.message}`);
    }
  };

  // Parse research JSON
  let researchData = null;
  try {
    if (currentLead.ai_research_json) {
      researchData = typeof currentLead.ai_research_json === 'string'
        ? JSON.parse(currentLead.ai_research_json)
        : currentLead.ai_research_json;
    }
  } catch (e) {}

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="px-6 py-5 border-b border-[#ECE8E3] bg-[#FDFCFB] flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getScoreColor(scoreNum)}`}>
                AI Score: {scoreNum}/100 (Grade {currentLead.lead_score || 'B'})
              </span>

              {currentLead.source && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {currentLead.source}
                </span>
              )}

              {currentLead.value && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                  <DollarSign className="w-3 h-3" />
                  <span>PKR {Number(currentLead.value).toLocaleString()}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-[#141226] tracking-tight">{currentLead.name}</h2>
            <div className="flex items-center gap-3 text-xs text-[#6C6782] mt-1 flex-wrap">
              {currentLead.company && currentLead.company !== currentLead.name && (
                <span className="font-bold text-[#141226]">{currentLead.company}</span>
              )}
              {currentLead.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentLead.city}{currentLead.country ? `, ${currentLead.country}` : ''}</span>
                </span>
              )}
              {currentLead.category && (
                <span className="bg-[#4239C4]/5 text-[#4239C4] px-1.5 py-0.5 rounded font-bold text-[11px]">
                  {currentLead.category}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact & Stage Switcher Strip */}
        <div className="px-6 py-3 bg-[#F7F6FA] border-b border-[#ECE8E3] flex items-center justify-between gap-3 flex-wrap">
          {/* Stage Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6C6782]">Stage:</span>
            <select
              value={currentLead.stage_id || ''}
              onChange={handleStageChange}
              className="marky-input text-xs font-bold py-1 px-2.5 bg-white cursor-pointer"
            >
              {stages.length > 0 ? (
                stages.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({Math.round(st.probability * 100)}%)
                  </option>
                ))
              ) : (
                <option value="">{currentLead.status || 'Active'}</option>
              )}
            </select>
          </div>

          {/* Quick Contact Actions */}
          <div className="flex items-center gap-1.5">
            {currentLead.phone && (
              <>
                <a
                  href={`https://wa.me/${cleanPhone(currentLead.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${cleanPhone(currentLead.phone)}`}
                  className="p-1.5 rounded-lg bg-white border border-[#ECE8E3] text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                  title="Call Phone"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4239C4]" />
                </a>
              </>
            )}

            {currentLead.email && (
              <a
                href={`mailto:${currentLead.email}`}
                className="p-1.5 rounded-lg bg-white border border-[#ECE8E3] text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
              </a>
            )}

            {currentLead.website && (
              <a
                href={currentLead.website.startsWith('http') ? currentLead.website : `https://${currentLead.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white border border-[#ECE8E3] text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                title="Visit Website"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#ECE8E3] flex items-center gap-6 bg-white shrink-0">
          {[
            { id: 'ai_intel', label: 'AI Intelligence & Score', icon: Bot },
            { id: 'outreach', label: 'AI Outreach Copy', icon: Sparkles },
            { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckCircle2 },
            { id: 'activities', label: `Activity Log (${activities.length})`, icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#4239C4] text-[#4239C4]'
                    : 'border-transparent text-[#6C6782] hover:text-[#141226]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI INTEL & SCORE */}
          {activeTab === 'ai_intel' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Score breakdown card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1F1841] text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-extrabold tracking-wider uppercase text-white/80">
                      Multi-Factor ICP Assessment
                    </span>
                  </div>
                  <button
                    onClick={handleRescore}
                    disabled={loadingAction}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
                    <span>Re-score with AI</span>
                  </button>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-black">{scoreNum}</span>
                  <span className="text-xs text-white/60 font-medium">/ 100 ICP Fit Index</span>
                  <span className="ml-auto text-xs font-black px-2 py-0.5 rounded bg-white/20 text-white">
                    Grade {currentLead.lead_score || 'B'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-teal-400 via-[#4239C4] to-amber-300 h-full transition-all duration-700"
                    style={{ width: `${scoreNum}%` }}
                  />
                </div>

                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  {currentLead.lead_score_explanation ||
                    researchData?.fit_explanation ||
                    'Lead demonstrates strong geographic alignment, verified retail presence, and high purchasing intent.'}
                </p>
              </div>

              {/* Next Action AI Recommendation */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#4239C4]">
                    <TrendingUp className="w-4 h-4" />
                    <span>AI Recommended Next Step</span>
                  </div>
                  <button
                    onClick={handleSuggestAction}
                    disabled={loadingAction}
                    className="text-[11px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>
                <p className="text-xs text-[#141226] font-medium leading-relaxed">
                  {currentLead.next_action || 'Send introductory WhatsApp message with seasonal wholesale catalog and bulk discount tiers.'}
                </p>
              </div>

              {/* Research Insights: Why Qualified vs Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                  <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strong Buying Signals</span>
                  </span>
                  <ul className="text-xs text-emerald-950 space-y-1.5 list-disc pl-4">
                    {researchData?.why_qualified ? (
                      researchData.why_qualified.map((item, idx) => <li key={idx}>{item}</li>)
                    ) : (
                      <>
                        <li>Active business with phone verification</li>
                        <li>High Google Maps customer sentiment ({currentLead.rating || 4.8}★)</li>
                        <li>Target geographic market match</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <span className="text-xs font-black text-amber-800 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Information Gaps / Risks</span>
                  </span>
                  <ul className="text-xs text-amber-950 space-y-1.5 list-disc pl-4">
                    {researchData?.missing_signals ? (
                      researchData.missing_signals.map((item, idx) => <li key={idx}>{item}</li>)
                    ) : (
                      <>
                        <li>Exact store floor manager name pending confirmation</li>
                        <li>Monthly re-order velocity unverified until 1st order</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Core Details Grid */}
              <div className="p-4 rounded-2xl bg-white border border-[#ECE8E3] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#141226] block">
                  Lead Profile Records
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6C6782] block text-[11px]">Contact Phone</span>
                    <span className="font-bold text-[#141226]">{currentLead.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#6C6782] block text-[11px]">Email Address</span>
                    <span className="font-bold text-[#141226]">{currentLead.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#6C6782] block text-[11px]">Website Domain</span>
                    <span className="font-bold text-[#141226]">{currentLead.website || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#6C6782] block text-[11px]">Discovered Via</span>
                    <span className="font-bold text-[#141226]">{currentLead.source || 'Apify Maps Engine'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI OUTREACH GENERATOR */}
          {activeTab === 'outreach' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#141226]">AI Personalized Outreach Copywriter</h4>
                  <p className="text-[11px] text-[#6C6782] mt-0.5">
                    Generates tailored high-converting outreach referencing {currentLead.name}&apos;s niche & location.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#ECE8E3]">
                  <button
                    onClick={() => setOutreachChannel('whatsapp')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      outreachChannel === 'whatsapp' ? 'bg-[#4239C4] text-white' : 'text-[#6C6782]'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setOutreachChannel('email')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      outreachChannel === 'email' ? 'bg-[#4239C4] text-white' : 'text-[#6C6782]'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#141226]">
                  {outreachChannel === 'whatsapp' ? 'WhatsApp Direct Message' : 'B2B Cold Email Message'}
                </span>
                <button
                  onClick={handleGenerateOutreach}
                  disabled={outreachLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4239C4] hover:bg-[#352CA8] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${outreachLoading ? 'animate-spin' : 'text-amber-300'}`} />
                  <span>{outreachLoading ? 'Drafting Copy...' : 'Draft with AI'}</span>
                </button>
              </div>

              {outreachChannel === 'email' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#6C6782] mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={outreachSubject}
                    onChange={(e) => setOutreachSubject(e.target.value)}
                    placeholder="e.g. Exclusive Wholesale Sidr Honey for your store"
                    className="marky-input w-full p-2.5 text-xs font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#6C6782] mb-1">Message Body</label>
                <textarea
                  rows={8}
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  placeholder="Click 'Draft with AI' to compose an intelligent message based on this lead..."
                  className="marky-input w-full p-3.5 text-xs leading-relaxed font-sans"
                />
              </div>

              {/* Action Buttons for Outreach */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCopyOutreach}
                  disabled={!outreachMessage}
                  className="flex items-center gap-1.5 px-4 py-2 marky-btn-secondary text-xs font-bold cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
                </button>

                {outreachChannel === 'whatsapp' && currentLead.phone && (
                  <a
                    href={`https://wa.me/${cleanPhone(currentLead.phone)}?text=${encodeURIComponent(outreachMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send via WhatsApp Web</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Add task bar */}
              <form onSubmit={handleAddTask} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new follow-up action or call reminder..."
                  className="marky-input flex-1 p-2.5 text-xs"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2.5 marky-btn-primary text-xs font-bold cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Tasks List */}
              <div className="space-y-2">
                {tasksLoading ? (
                  <p className="text-xs text-[#6C6782] text-center py-6">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-[#ECE8E3]">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#141226]">All caught up!</p>
                    <p className="text-[11px] text-[#6C6782] mt-0.5">No pending action items for this lead.</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        task.is_completed
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-[#ECE8E3] hover:border-[#4239C4]/40 text-[#141226]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {task.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 hover:text-[#4239C4] shrink-0" />
                        )}
                        <span className="text-xs font-semibold">{task.title}</span>
                      </div>

                      {task.due_date && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Due: {task.due_date}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOG */}
          {activeTab === 'activities' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Add note */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log an interaction, phone call recap, or WhatsApp summary..."
                  className="marky-input w-full p-2.5 text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 marky-btn-primary text-xs font-bold cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Log Note</span>
                  </button>
                </div>
              </form>

              {/* Timeline */}
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                {activitiesLoading ? (
                  <p className="text-xs text-[#6C6782] py-4">Loading timeline...</p>
                ) : activities.length === 0 ? (
                  <p className="text-xs text-[#6C6782] py-4">No logged interactions yet.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#4239C4] flex items-center justify-center" />
                      <div className="p-3 rounded-xl bg-slate-50 border border-[#ECE8E3]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-extrabold text-[#4239C4]">{act.activity_type}</span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(act.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#141226] font-medium">{act.summary}</p>
                        {act.details && act.details !== act.summary && (
                          <p className="text-[11px] text-[#6C6782] mt-1">{act.details}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

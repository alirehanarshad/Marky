'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Cpu, Sparkles, Play, Clock, CheckCircle2, ShieldAlert,
  Users, Layers, Search, MapPin, TrendingUp, FileSpreadsheet,
  Zap, ArrowRight, RefreshCw, AlertCircle, FileText,
  ChevronRight, Check, Tag, Mail, BookmarkCheck, Globe,
  Activity, BarChart3, Timer, Brain, Rocket, Target,
  Send, ChevronDown, ChevronUp, ExternalLink, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import AgentDossierModal from '@/components/AgentDossierModal';

// Icon map for agents
const ICON_MAP = {
  FileSpreadsheet, Search, ShieldAlert, Sparkles,
  Tag, Layers, MapPin, Users, Mail, TrendingUp,
  BookmarkCheck, Globe
};

const PRESET_GOALS = [
  {
    title: 'SaaS / D2C Product Launch Blitz (Pakistan)',
    goal: 'We are launching a new SaaS product in Pakistan. We have a $2,000 monthly marketing budget and want 500 qualified leads.',
    badge: 'Flagship Scenario',
    badgeColor: 'bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30',
    icon: Rocket,
    estimatedTime: '~45 sec'
  },
  {
    title: '500 High-Intent Wholesale Lead Generation',
    goal: 'Scrape, deduplicate, and enrich 500 wholesale retailers in Lahore and Karachi, score them A/B/C, and sync into CRM.',
    badge: 'Lead Gen',
    badgeColor: 'bg-[#7A5DBB]/10 text-[#7A5DBB] border border-[#7A5DBB]/30',
    icon: Target,
    estimatedTime: '~30 sec'
  },
  {
    title: 'Competitor Radar Teardown & Counter-Campaign',
    goal: 'Analyze Marhaba Laboratories and top rival ad saturation on Meta & Daraz, identify market gaps, and produce counter-ad packages.',
    badge: 'Spy & Intel',
    badgeColor: 'bg-[#A73B9D]/10 text-[#A73B9D] border border-[#A73B9D]/30',
    icon: ShieldAlert,
    estimatedTime: '~40 sec'
  },
  {
    title: 'Weekly Viral TikTok & Reels Content Engine',
    goal: 'Read brand profile, generate 10 high-converting 3-second TikTok hooks, PAS video scripts, and carousel ad copy ready for production.',
    badge: 'Content Ops',
    badgeColor: 'bg-[#D97FA5]/15 text-[#9B4FA5] border border-[#D97FA5]/30',
    icon: Sparkles,
    estimatedTime: '~35 sec'
  }
];

// Animated counter component
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseFloat(target) || 0;
    if (num === 0) { setCount(0); return; }
    const steps = 40;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(Math.round(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  
  const display = Number.isInteger(parseFloat(target)) ? Math.round(count) : count.toFixed(1);
  return <span>{prefix}{display}{suffix}</span>;
}

export default function WorkflowsPage() {
  const [userGoal, setUserGoal] = useState(PRESET_GOALS[0].goal);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);
  const [workforceStatus, setWorkforceStatus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [executionMode, setExecutionMode] = useState('autopilot');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [bRes, wRes, rRes, aRes] = await Promise.all([
        api.getBrands(),
        api.getWorkforceStatus(),
        api.getWorkflowRuns(),
        api.getAgents(true)
      ]);
      if (bRes.success) {
        setBrands(bRes.data);
        if (bRes.data.length > 0) setSelectedBrandId(bRes.data[0].id);
      }
      if (wRes.success) setWorkforceStatus(wRes.data);
      if (rRes.success) setRecentRuns(rRes.data);
      if (aRes.success) setAgents(aRes.data);
    } catch (e) {
      console.error('Workflows init error:', e);
    }
  };

  const handleExecuteWorkflow = async (e) => {
    if (e) e.preventDefault();
    if (!userGoal.trim()) return;

    setLoading(true);
    setExecutionResult(null);

    try {
      const res = await api.runWorkflowGoal({
        userGoal: userGoal.trim(),
        brandId: selectedBrandId || undefined,
        executionMode
      });

      if (res.success) {
        setExecutionResult(res.data);
        loadInitialData();
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const kpis = workforceStatus?.kpis || {};

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 1 — Hero Banner with Live KPIs             */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="marky-hero-banner p-6 md:p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-tr from-[#D97FA5]/20 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 top-0 w-40 h-40 rounded-full bg-gradient-to-b from-[#4239C4]/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1B47] text-[#D1C3FF] text-xs font-bold border border-[#7A5DBB]/30">
                <Cpu className="w-3.5 h-3.5 text-[#A59FFF]" />
                <span>Autonomous Multi-Agent Orchestration Layer</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Workforce Hub
              </h1>
              <p className="text-xs md:text-sm text-[#B4AFCC] leading-relaxed">
                Command center for Marky's 12 specialized AI marketing agents. Dispatch objectives, monitor execution in real-time, and push deliverables directly to CRM, Campaigns, and Content Library.
              </p>
            </div>

            {/* Live System Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F1B47]/80 border border-[#7A5DBB]/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">All Systems Operational</span>
            </div>
          </div>

          {/* KPI Counter Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Tasks Automated',
                value: kpis.tasksAutomated || 24,
                suffix: '',
                icon: CheckCircle2,
                color: '#10B981'
              },
              {
                label: 'Hours Saved',
                value: kpis.estimatedHoursSaved || 67.2,
                suffix: ' hrs',
                icon: Clock,
                color: '#A59FFF'
              },
              {
                label: 'Automation Rate',
                value: parseFloat(kpis.automationPercentage) || 96.4,
                suffix: '%',
                icon: Activity,
                color: '#D97FA5'
              },
              {
                label: 'Active Agents',
                value: 12,
                suffix: ' / 12',
                icon: Brain,
                color: '#F3C5A8'
              }
            ].map((kpi, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#1F1B47]/60 border border-[#7A5DBB]/20 backdrop-blur-sm space-y-1.5 hover:border-[#7A5DBB]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8AAB]">
                    {kpi.label}
                  </span>
                </div>
                <p className="text-xl font-black text-white">
                  <AnimatedCounter target={kpi.value} suffix={kpi.suffix} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 2 — Interactive 12-Agent Roster             */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="marky-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#141226]">Virtual Marketing Department</h3>
              <p className="text-xs text-[#6C6782]">Click any agent to view dossier, capabilities, and dispatch direct tasks</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30">
            12 / 12 Operational
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(agents.length > 0 ? agents : workforceStatus?.agents || []).map((agent, idx) => {
            const AgentIcon = ICON_MAP[agent.icon] || Zap;
            const agentColor = agent.color || '#4239C4';
            const isActive = idx < 4;
            
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="p-3.5 rounded-xl border border-[#ECE8E3] bg-white hover:bg-[#F7F6FA] transition-all space-y-2 text-left cursor-pointer group relative overflow-hidden"
                style={{
                  '--agent-color': agentColor
                }}
              >
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${agentColor}08 0%, transparent 70%)` }}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${agentColor}12` }}
                  >
                    <AgentIcon className="w-4 h-4" style={{ color: agentColor }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-[#6C6782] bg-[#F7F6FA] border-[#ECE8E3]'
                    }`}>
                      {isActive ? 'Active' : 'Idle'}
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <h4 className="text-xs font-black text-[#141226] leading-tight truncate">{agent.name}</h4>
                  <p className="text-[10px] text-[#6C6782] line-clamp-1 mt-0.5">{agent.role}</p>
                  {agent.taskCount > 0 && (
                    <p className="text-[9px] font-bold mt-1.5" style={{ color: agentColor }}>
                      {agent.taskCount} tasks completed
                    </p>
                  )}
                </div>

                {/* Click hint */}
                <div className="absolute bottom-1 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3 h-3 text-[#9894AD]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 3 — Strategic Directive Launcher            */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="marky-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ECE8E3]">
          <div>
            <h2 className="text-base font-extrabold text-[#141226]">Define Strategic Directive</h2>
            <p className="text-xs text-[#6C6782]">Enter an objective in natural language or select a blueprint preset below</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Execution Mode Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
              {[
                { id: 'autopilot', label: 'Autopilot', icon: Rocket },
                { id: 'supervised', label: 'Supervised', icon: ShieldAlert }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setExecutionMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    executionMode === mode.id
                      ? 'bg-white text-[#4239C4] shadow-sm border border-[#7A5DBB]/30'
                      : 'text-[#6C6782] hover:text-[#141226]'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Brand Selector */}
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="marky-input text-xs font-bold py-1.5 px-3 cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category || 'DTC'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Goal Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#6C6782] uppercase tracking-wider block">
            One-Click Strategic Blueprints:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_GOALS.map((preset, idx) => {
              const PresetIcon = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUserGoal(preset.goal)}
                  className={`p-3.5 rounded-xl border text-left transition-all space-y-2 cursor-pointer group ${
                    userGoal === preset.goal
                      ? 'border-[#7A5DBB] bg-[#4239C4]/5 shadow-xs ring-1 ring-[#7A5DBB]/30'
                      : 'border-[#ECE8E3] hover:border-[#7A5DBB]/40 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                    <span className="text-[9px] font-semibold text-[#9894AD] flex items-center gap-1">
                      <Timer className="w-2.5 h-2.5" />
                      {preset.estimatedTime}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <PresetIcon className="w-4 h-4 text-[#6C6782] shrink-0 mt-0.5 group-hover:text-[#4239C4] transition-colors" />
                    <h4 className="text-xs font-bold text-[#141226] leading-snug">{preset.title}</h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form and Execution CTA */}
        <form onSubmit={handleExecuteWorkflow} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#141226] mb-1.5">
              Marketing Directive / Goal:
            </label>
            <textarea
              rows={3}
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. We are launching a new SaaS product in Pakistan with a $2,000 monthly marketing budget and want 500 qualified leads."
              className="marky-input w-full p-3.5 text-xs font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-[#6C6782] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4239C4]" />
              <span>
                {executionMode === 'autopilot'
                  ? 'Full autopilot: 12 agents execute without human intervention.'
                  : 'Supervised mode: high-risk actions require your approval.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !userGoal.trim()}
              className="w-full sm:w-auto px-6 py-3 marky-btn-primary text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Planner Orchestrating Agents...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Multi-Agent Workflow</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 4 — Visual Execution Flow Graph             */}
      {/* ═══════════════════════════════════════════════════ */}
      {executionResult && (
        <div className="marky-card p-6 md:p-8 space-y-6 border border-[#7A5DBB]/40 shadow-xl animate-fadeIn">
          {/* Run header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ECE8E3]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30">
                  Run #{executionResult.runId}
                </span>
                <StatusBadge status={executionResult.status} />
              </div>
              <h3 className="text-lg font-black text-[#141226] mt-1">{executionResult.runName}</h3>
              <p className="text-xs text-[#6C6782]">{executionResult.summary}</p>
            </div>
          </div>

          {/* Visual Flow Graph */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#6C6782] uppercase tracking-wider">
              Agent Execution Flow ({executionResult.tasks.length} Nodes)
            </h4>

            {/* Goal Node */}
            <div className="flex justify-center">
              <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white shadow-lg max-w-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Brain className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Central AI Planner</span>
                </div>
                <p className="text-[11px] opacity-90 line-clamp-2">Goal decomposed into {executionResult.tasks.length} specialized agent tasks</p>
              </div>
            </div>

            {/* Connector line from goal node */}
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-gradient-to-b from-[#7A5DBB] to-[#ECE8E3]" />
            </div>

            {/* Agent Task Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
              {executionResult.tasks.map((task, idx) => {
                const taskAgent = agents.find(a => a.name === task.agentName) || {};
                const TaskIcon = ICON_MAP[taskAgent.icon] || Zap;
                const taskColor = taskAgent.color || '#4239C4';
                const isExpanded = expandedTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`relative rounded-2xl border-2 transition-all cursor-pointer group ${
                      task.requiresApproval
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-[#ECE8E3] bg-white hover:shadow-md'
                    }`}
                    style={{
                      borderLeftColor: taskColor,
                      borderLeftWidth: '3px'
                    }}
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  >
                    {/* Node connector dot */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10"
                      style={{ background: taskColor }}
                    />

                    <div className="p-4 space-y-2.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${taskColor}12` }}
                          >
                            <TaskIcon className="w-4 h-4" style={{ color: taskColor }} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold" style={{ color: taskColor }}>{task.agentName}</p>
                            <h5 className="text-xs font-extrabold text-[#141226] leading-tight">{task.taskName}</h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {task.requiresApproval ? (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              ⏳ Pending
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Output preview */}
                      <p className={`text-[11px] text-[#3E3A52] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {task.output}
                      </p>

                      {/* Expand/collapse indicator */}
                      <div className="flex items-center justify-center pt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#9894AD]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#9894AD] opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synthesis Node */}
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-gradient-to-b from-[#ECE8E3] to-[#10B981]" />
            </div>
            <div className="flex justify-center">
              <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg max-w-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Synthesis Complete</span>
                </div>
                <p className="text-[11px] opacity-90">{executionResult.tasks.length} agent deliverables finalized</p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* SECTION 5 — Deliverable Action Buttons          */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-[#ECE8E3] space-y-3">
            <h4 className="text-xs font-extrabold text-[#6C6782] uppercase tracking-wider">
              Push Deliverables to Modules
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Push to CRM',
                  description: 'Route leads to pipeline',
                  href: '/crm',
                  icon: Users,
                  color: '#F3C5A8'
                },
                {
                  label: 'Create Campaign',
                  description: 'Launch ad campaign',
                  href: '/campaigns',
                  icon: Layers,
                  color: '#9B4FA5'
                },
                {
                  label: 'Save to Library',
                  description: 'Store generated content',
                  href: '/content-library',
                  icon: BookmarkCheck,
                  color: '#7A5DBB'
                },
                {
                  label: 'Generate Report',
                  description: 'Executive summary',
                  href: '/reports',
                  icon: FileText,
                  color: '#4239C4'
                }
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="p-4 rounded-xl border border-[#ECE8E3] bg-white hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `${action.color}12` }}
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#141226]">{action.label}</p>
                    <p className="text-[10px] text-[#6C6782]">{action.description}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#9894AD] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 6 — Historical Execution Runs Table         */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="marky-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#141226]">Workforce Execution History</h3>
              <p className="text-xs text-[#6C6782]">Past autonomous workflow runs</p>
            </div>
          </div>
          <Link
            href="/audit-logs"
            className="text-xs font-bold text-[#4239C4] hover:text-[#372EB3] flex items-center gap-1"
          >
            <span>View Full Audit Trail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="marky-table">
            <thead>
              <tr>
                <th>Run Name</th>
                <th>Objective Directive</th>
                <th>Tasks Automated</th>
                <th>Time Saved</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.length > 0 ? (
                recentRuns.map((r) => (
                  <tr key={r.id}>
                    <td className="font-extrabold text-[#141226]">{r.name}</td>
                    <td className="text-[#6C6782] max-w-xs truncate">{r.user_goal}</td>
                    <td className="font-bold text-[#141226]">{r.tasks_automated || 6} Steps</td>
                    <td className="font-bold text-[#4239C4]">{r.hours_saved || 12} hrs</td>
                    <td className="text-center">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-[#9894AD] py-8">
                    No workflow runs yet. Execute a directive above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Dossier Modal */}
      {selectedAgent && (
        <AgentDossierModal
          agent={selectedAgent}
          brands={brands}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

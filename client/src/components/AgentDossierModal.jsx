'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Zap, CheckCircle2, Clock, Send, Loader2,
  FileSpreadsheet, Search, ShieldAlert, Sparkles,
  Tag, Layers, MapPin, Users, Mail, TrendingUp,
  BookmarkCheck, Globe, ChevronRight, Activity
} from 'lucide-react';
import api from '@/lib/api';
import Portal, { useBodyScrollLock } from './ui/Portal';

const ICON_MAP = {
  FileSpreadsheet, Search, ShieldAlert, Sparkles,
  Tag, Layers, MapPin, Users, Mail, TrendingUp,
  BookmarkCheck, Globe
};

export default function AgentDossierModal({ agent, onClose, brands = [] }) {
  useBodyScrollLock(Boolean(agent));
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatchTask, setDispatchTask] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '');

  useEffect(() => {
    if (agent?.id) loadDossier();
  }, [agent?.id]);

  const loadDossier = async () => {
    setLoading(true);
    try {
      const res = await api.getAgentDossier(agent.id);
      if (res.success) setDossier(res.data);
    } catch (e) {
      console.error('Failed to load dossier:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchTask.trim() || dispatching) return;
    setDispatching(true);
    setDispatchResult(null);
    try {
      const res = await api.dispatchAgent(agent.id, {
        task: dispatchTask.trim(),
        brandId: selectedBrandId || undefined
      });
      if (res.success) {
        setDispatchResult(res.data);
        setDispatchTask('');
        loadDossier(); // Refresh recent tasks
      }
    } catch (err) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  if (!agent) return null;

  const AgentIcon = ICON_MAP[agent.icon] || Zap;
  const agentColor = agent.color || '#4239C4';
  const data = dossier || agent;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-hidden"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <div
          className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div
          className="relative p-6 pb-5 rounded-t-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${agentColor}15 0%, ${agentColor}08 50%, transparent 100%)`
          }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: `${agentColor}15` }} />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-[#ECE8E3] flex items-center justify-center text-[#6C6782] hover:text-[#141226] transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/30 shrink-0"
              style={{ background: `linear-gradient(135deg, ${agentColor}25, ${agentColor}10)` }}
            >
              <AgentIcon className="w-7 h-7" style={{ color: agentColor }} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#141226]">{agent.name}</h2>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                  style={{
                    background: `${agentColor}12`,
                    color: agentColor,
                    borderColor: `${agentColor}30`
                  }}
                >
                  {agent.status || 'Active'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#6C6782]">{agent.role}</p>
              <p className="text-xs text-[#9894AD] leading-relaxed">{agent.description || data.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Stats Row */}
          {!loading && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Tasks Done', value: data.stats?.totalTasks || 0, icon: CheckCircle2 },
                { label: 'Success Rate', value: `${data.stats?.successRate || 100}%`, icon: Activity },
                { label: 'Avg Time', value: `${((data.stats?.avgExecutionMs || 1400) / 1000).toFixed(1)}s`, icon: Clock },
                { label: 'Category', value: agent.category || 'General', icon: Tag }
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-center space-y-1">
                  <stat.icon className="w-4 h-4 mx-auto text-[#6C6782]" />
                  <p className="text-sm font-black text-[#141226]">{stat.value}</p>
                  <p className="text-[10px] font-semibold text-[#9894AD] uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Capabilities */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold text-[#141226] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color: agentColor }} />
              Capabilities
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {(agent.capabilities || data.capabilities || []).map((cap, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F7F6FA] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: agentColor }} />
                  <span className="text-xs font-medium text-[#3E3A52]">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Integrations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold text-[#141226] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" style={{ color: agentColor }} />
              Tools & Integrations
            </h3>
            <div className="flex flex-wrap gap-2">
              {(agent.tools || data.tools || []).map((tool, i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg border"
                  style={{
                    background: `${agentColor}08`,
                    color: agentColor,
                    borderColor: `${agentColor}25`
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          {!loading && data.recentTasks && data.recentTasks.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold text-[#141226] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" style={{ color: agentColor }} />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {data.recentTasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#141226] truncate">{task.task_name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6C6782] line-clamp-2">{task.output_data}</p>
                    {task.run_name && (
                      <p className="text-[10px] text-[#9894AD]">
                        Run: {task.run_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Dispatch */}
          <div className="space-y-3 pt-2 border-t border-[#ECE8E3]">
            <h3 className="text-xs font-extrabold text-[#141226] uppercase tracking-wider flex items-center gap-2">
              <Send className="w-3.5 h-3.5" style={{ color: agentColor }} />
              Direct Agent Dispatch
            </h3>

            {dispatchResult ? (
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-emerald-800">Task Completed Successfully</span>
                </div>
                <p className="text-xs text-[#3E3A52] leading-relaxed whitespace-pre-wrap">{dispatchResult.output}</p>
                <button
                  onClick={() => setDispatchResult(null)}
                  className="text-[11px] font-bold text-[#4239C4] hover:text-[#372EB3] cursor-pointer"
                >
                  Dispatch Another Task →
                </button>
              </div>
            ) : (
              <form onSubmit={handleDispatch} className="space-y-3">
                {brands.length > 0 && (
                  <select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    className="marky-input text-xs font-bold py-1.5 px-3 w-full cursor-pointer"
                  >
                    <option value="">No Brand Context</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
                <textarea
                  rows={3}
                  value={dispatchTask}
                  onChange={(e) => setDispatchTask(e.target.value)}
                  placeholder={`Give ${agent.name} a direct task... e.g., "Analyze top 3 competitor TikTok ad hooks"`}
                  className="marky-input w-full p-3 text-xs font-medium"
                />
                <button
                  type="submit"
                  disabled={dispatching || !dispatchTask.trim()}
                  className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
                  style={{
                    background: dispatching ? '#9894AD' : `linear-gradient(135deg, ${agentColor}, ${agentColor}CC)`
                  }}
                >
                  {dispatching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{agent.name} Executing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch {agent.name}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  </Portal>
);
}

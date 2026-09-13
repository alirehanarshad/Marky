'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Download,
  Phone,
  Mail,
  Globe,
  Trash2,
  ExternalLink,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
  FileText,
  Star,
  Sparkles,
  Bot,
  Layers,
  Kanban,
  Table as TableIcon,
  DollarSign,
  TrendingUp,
  Cpu,
  ChevronDown,
  RefreshCw,
  Zap,
  Sliders,
  Send
} from 'lucide-react';
import api from '@/lib/api';
import AddLeadModal from '@/components/AddLeadModal';
import CrmOnboardingWizard from '@/components/CrmOnboardingWizard';
import CrmKanbanBoard from '@/components/CrmKanbanBoard';
import LeadDetailPanel from '@/components/LeadDetailPanel';
import LeadDiscoveryModal from '@/components/LeadDiscoveryModal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

export default function CRMPage() {
  // Pipelines state
  const [pipelines, setPipelines] = useState([]);
  const [activePipeline, setActivePipeline] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modals & Drawers
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [addLeadInitialStage, setAddLeadInitialStage] = useState(null);

  // Natural Language Command Bar
  const [commandText, setCommandText] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState(null);

  // Initial load
  useEffect(() => {
    loadPipelines();
  }, []);

  // Reload leads whenever filters or active pipeline change
  useEffect(() => {
    if (activePipeline) {
      loadLeads();
    }
  }, [activePipeline, statusFilter, scoreFilter, searchQuery]);

  const loadPipelines = async () => {
    setPipelineLoading(true);
    try {
      const res = await api.getPipelines();
      if (res.success && res.data && res.data.length > 0) {
        setPipelines(res.data);
        const defaultActive = res.data.find((p) => p.is_active) || res.data[0];
        setActivePipeline(defaultActive);
        loadLeads(defaultActive.id);
      } else {
        setPipelines([]);
        setActivePipeline(null);
        loadLeads(null);
      }
    } catch (err) {
      console.error('Error loading pipelines:', err);
    } finally {
      setPipelineLoading(false);
    }
  };

  const loadLeads = async (forcedPipelineId) => {
    setLoading(true);
    try {
      const currentId = forcedPipelineId !== undefined ? forcedPipelineId : activePipeline?.id;
      const params = {};
      if (currentId) params.pipeline_id = currentId;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (scoreFilter && scoreFilter !== 'All') params.lead_score = scoreFilter;
      if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getLeads(params, true);
      if (res.success && Array.isArray(res.data)) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Error loading CRM leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch active pipeline
  const handleSelectPipeline = async (pipeline) => {
    setActivePipeline(pipeline);
    try {
      await api.setActivePipeline(pipeline.id);
    } catch (e) {}
  };

  // Move lead stage (via Kanban drag & drop or detail drawer)
  const handleStageChange = async (leadId, newStageId, stageName) => {
    try {
      // Optimistic UI update
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, stage_id: Number(newStageId), status: stageName || l.status }
            : l
        )
      );

      await api.updateLeadStage(leadId, newStageId, stageName);
      loadLeads();
    } catch (err) {
      console.error('Failed to update stage:', err);
      loadLeads();
    }
  };

  // Natural Language Command
  const handleExecuteCommand = async (e) => {
    e.preventDefault();
    if (!commandText.trim()) return;
    setCommandLoading(true);
    setCommandFeedback(null);
    try {
      const res = await api.runCrmCommand({
        command: commandText.trim(),
        pipeline_id: activePipeline?.id
      });
      if (res.success) {
        setCommandFeedback({
          type: 'success',
          message: res.message || res.data?.summary || 'Command processed successfully.'
        });
        setCommandText('');
        loadLeads();
      } else {
        throw new Error(res.error || 'Could not process command');
      }
    } catch (err) {
      setCommandFeedback({
        type: 'error',
        message: err.message || 'Error processing AI command'
      });
    } finally {
      setCommandLoading(false);
      setTimeout(() => setCommandFeedback(null), 6000);
    }
  };

  // Delete lead
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete lead "${name}"?`)) return;
    try {
      await api.deleteLead(id);
      if (selectedLead?.id === id) setSelectedLead(null);
      loadLeads();
    } catch (err) {
      alert(`Error deleting lead: ${err.message}`);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Company', 'Phone', 'Email', 'City', 'Category', 'Rating', 'AI Score', 'Stage', 'Value', 'Website', 'Next Action'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.company || l.name}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.city || ''}"`,
      `"${l.category || ''}"`,
      l.rating || 5,
      l.lead_score_numeric || (l.lead_score === 'A' ? 90 : 70),
      `"${l.status || ''}"`,
      l.value || 0,
      `"${l.website || ''}"`,
      `"${(l.next_action || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activePipeline?.name || 'CRM').replace(/\s+/g, '_')}-Leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metrics calculation
  const totalValue = leads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const highIntentLeads = leads.filter(
    (l) => (Number(l.lead_score_numeric) >= 80) || l.lead_score === 'A'
  ).length;
  const wonLeads = leads.filter((l) =>
    (l.status || '').toLowerCase().includes('won') ||
    (l.status || '').toLowerCase().includes('customer')
  ).length;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="AI-Powered Adaptive CRM"
        badgeIcon={Bot}
        title="Adaptive CRM & Intelligent Pipelines"
        description="Autonomous CRM customized to your business model: AI pipeline generation, multi-factor lead scoring, live Apify sourcing, and automated WhatsApp outreach."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDiscoveryModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Find Leads with Apify</span>
            </button>

            <button
              onClick={() => setShowWizardModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:brightness-110 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>+ New AI Pipeline</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 marky-btn-secondary text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setAddLeadInitialStage(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 marky-btn-primary text-xs font-bold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        }
      />

      {/* 2. Executive Analytics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="marky-card p-4 flex items-center justify-between border-l-4 border-l-[#4239C4]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6C6782]">
              Total Pipeline Value
            </span>
            <div className="text-xl font-black text-[#141226] mt-0.5">
              PKR {totalValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#6C6782]">
              Across {leads.length} accounts
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="marky-card p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6C6782]">
              High-Intent Qualified
            </span>
            <div className="text-xl font-black text-[#141226] mt-0.5">
              {highIntentLeads} Leads
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">
              Grade A (Score ≥ 80)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="marky-card p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6C6782]">
              Conversion Rate
            </span>
            <div className="text-xl font-black text-[#141226] mt-0.5">
              {conversionRate}%
            </div>
            <span className="text-[11px] text-[#6C6782]">
              {wonLeads} closed / won accounts
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="marky-card p-4 flex items-center justify-between border-l-4 border-l-teal-500">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6C6782]">
              Apify Cloud Engine
            </span>
            <div className="text-sm font-black text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine Ready</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Key: ••••••••••••syS4
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Pipeline Switcher & Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1E1B4B] to-[#2D1B69] border border-white/10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#4239C4] text-white shadow-xs">
              Active Pipeline
            </span>
            <span className="text-xs text-white/80 font-medium">
              {activePipeline?.business_type || 'Custom Business Model'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white tracking-tight">
              {activePipeline?.name || 'Adaptive CRM Pipeline'}
            </h2>
          </div>

          <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
            {activePipeline?.description || 'AI configured pipeline adapted for your industry.'}
          </p>
        </div>

        {/* Pipeline Selector Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <select
              value={activePipeline?.id || ''}
              onChange={(e) => {
                const selected = pipelines.find((p) => String(p.id) === e.target.value);
                if (selected) handleSelectPipeline(selected);
              }}
              className="bg-[#2A1E5C] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/25 outline-none cursor-pointer pr-9 appearance-none hover:bg-[#352774] transition-all shadow-md"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#141226] text-white">
                  {p.name} ({p.business_type})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/70 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#4239C4] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#4239C4] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Natural Language AI CRM Command Bar */}
      <div className="marky-card p-3.5 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white border border-indigo-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-xl bg-[#4239C4] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <form onSubmit={handleExecuteCommand} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="Ask AI to change stages, re-score accounts, suggest next actions, or discover leads..."
              className="marky-input w-full py-1.5 px-3 text-xs bg-white"
            />
            <button
              type="submit"
              disabled={commandLoading || !commandText.trim()}
              className="flex items-center gap-1 px-4 py-1.5 marky-btn-primary text-xs font-bold shrink-0 cursor-pointer"
            >
              {commandLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Run Command</span>
            </button>
          </form>
        </div>

        {commandFeedback && (
          <div
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 animate-fadeIn shrink-0 ${
              commandFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>{commandFeedback.message}</span>
            <button onClick={() => setCommandFeedback(null)}>
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 5. Filter and Search Bar */}
      <div className="marky-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status / Stage Filters */}
          <div className="flex items-center gap-1 bg-[#F7F6FA] p-1 rounded-xl border border-[#ECE8E3]">
            {['All', 'Lead', 'Prospect', 'Contacted', 'Interested', 'Won'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-[#4239C4] shadow-xs'
                    : 'text-[#6C6782] hover:text-[#141226]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Lead Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="marky-input text-xs font-semibold px-3 py-1.5 cursor-pointer bg-white"
          >
            <option value="All">All Lead Grades</option>
            <option value="A">Grade A (Score ≥ 80)</option>
            <option value="B">Grade B (Score 60-79)</option>
            <option value="C">Grade C (Score &lt; 60)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-[#6C6782] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads, phone, city, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="marky-input w-full pl-9 pr-3 py-1.5 text-xs bg-white"
          />
        </div>
      </div>

      {/* 6. Main View: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <CrmKanbanBoard
          stages={activePipeline?.stages || []}
          leads={leads}
          onStageChange={handleStageChange}
          onLeadSelect={(lead) => setSelectedLead(lead)}
          onAddLeadToStage={(stageId, stageName) => {
            setAddLeadInitialStage({ id: stageId, name: stageName });
            setShowAddModal(true);
          }}
        />
      ) : (
        /* Table View */
        <div className="marky-card overflow-hidden border border-[#ECE8E3]">
          <div className="overflow-x-auto">
            <table className="marky-table">
              <thead>
                <tr>
                  <th>Contact / Business</th>
                  <th>Category & City</th>
                  <th>Contact Channels</th>
                  <th className="text-center">AI Score</th>
                  <th className="text-center">Pipeline Stage</th>
                  <th className="text-right">Deal Value</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#6C6782]">
                      Loading CRM pipeline leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#6C6782]">
                      No matching leads in active pipeline. Click &quot;Find Leads with Apify&quot; to source accounts.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const score = Number(lead.lead_score_numeric) || (lead.lead_score === 'A' ? 90 : 70);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td>
                          <div className="font-extrabold text-[#141226] text-xs">
                            {lead.name}
                          </div>
                          {lead.company && lead.company !== lead.name && (
                            <div className="text-[11px] text-[#6C6782]">{lead.company}</div>
                          )}
                        </td>

                        <td>
                          <div className="text-xs font-semibold text-[#141226]">
                            {lead.category || 'Retail'}
                          </div>
                          <div className="text-[11px] text-[#6C6782]">{lead.city || '—'}</div>
                        </td>

                        <td>
                          <div className="flex items-center gap-2">
                            {lead.phone && (
                              <span className="text-xs text-[#141226] font-mono">
                                {lead.phone}
                              </span>
                            )}
                            {lead.email && (
                              <span className="text-[11px] text-indigo-600 truncate max-w-[120px]">
                                {lead.email}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black border inline-flex items-center gap-1 ${
                              score >= 80
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : score >= 60
                                ? 'bg-[#4239C4]/10 text-[#4239C4] border-[#4239C4]/20'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <Bot className="w-3 h-3" />
                            <span>{score}/100</span>
                          </span>
                        </td>

                        <td className="text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {lead.status || 'New'}
                          </span>
                        </td>

                        <td className="text-right font-black text-xs text-[#141226]">
                          {lead.value ? `PKR ${Number(lead.value).toLocaleString()}` : '—'}
                        </td>

                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4239C4] text-xs font-bold transition-all"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id, lead.name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                              title="Delete lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Drawers and Modals */}
      {/* Lead Detail Slide-over */}
      <LeadDetailPanel
        lead={selectedLead}
        stages={activePipeline?.stages || []}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={(updated) => {
          setSelectedLead(updated);
          loadLeads();
        }}
      />

      {/* AI Pipeline Builder Wizard */}
      <CrmOnboardingWizard
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        brandId={activePipeline?.brand_id || 1}
        onCreated={(newPipeline) => {
          loadPipelines();
          setActivePipeline(newPipeline);
        }}
      />

      {/* Apify Lead Discovery Modal */}
      <LeadDiscoveryModal
        isOpen={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
        pipeline={activePipeline}
        onLeadsDiscovered={() => {
          loadLeads();
          loadPipelines();
        }}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onLeadAdded={() => loadLeads()}
        initialStage={addLeadInitialStage}
      />
    </div>
  );
}

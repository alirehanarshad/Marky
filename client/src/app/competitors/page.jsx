'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  PlusCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Radio,
  Clock,
  Zap,
  Target,
  Search,
  X,
  Compass,
  Filter
} from 'lucide-react';
import api from '@/lib/api';
import AddCompetitorModal from '@/components/AddCompetitorModal';
import CompetitorAnalysisModal from '@/components/CompetitorAnalysisModal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

const THREAT_FILTERS = ['All', 'Low Threat', 'Medium Threat', 'High Threat', 'Critical'];

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [compRes, eventsRes] = await Promise.all([
        api.getCompetitors(true),
        api.getCompetitorEvents(true)
      ]);
      if (compRes.success) setCompetitors(compRes.data || []);
      if (eventsRes.success) setEvents(eventsRes.data || []);
    } catch (err) {
      console.error('Error loading competitors data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}" from competitor watchlist?`)) return;
    try {
      await api.deleteCompetitor(id);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenAnalysis = (comp) => {
    setSelectedComp(comp);
    setActiveJobId(null);
    setShowAnalysisModal(true);
  };

  const handleCompetitorCreated = (newComp, jobId) => {
    loadData();
    setSelectedComp(newComp);
    setActiveJobId(jobId);
    setShowAnalysisModal(true);
  };

  // Filter and search logic
  const filteredCompetitors = competitors.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.url && comp.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comp.industry && comp.industry.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Low Threat') return comp.threat_level === 'Low';
    if (activeFilter === 'Medium Threat') return comp.threat_level === 'Medium';
    if (activeFilter === 'High Threat') return comp.threat_level === 'High';
    if (activeFilter === 'Critical') return comp.threat_level === 'Critical';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Competitive Intelligence & Rival Spy"
        badgeIcon={ShieldAlert}
        title="Competitor Intelligence"
        description="Analyze competitors, understand their strategy, identify gaps, and find opportunities to differentiate."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/meta-ads"
              className="flex items-center gap-1.5 px-3.5 py-2 marky-btn-secondary text-xs font-bold"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Meta Ads Spy</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 marky-btn-primary text-xs font-bold cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Competitor</span>
            </button>
          </div>
        }
      />

      {/* 2. Live Competitor Change Detection Signals Feed */}
      <div className="marky-card p-6 space-y-4 border-l-4 border-l-[#7A5DBB]">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7A5DBB]/10 text-[#7A5DBB] flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 animate-pulse text-[#4239C4]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#141226]">Live Signal Radar & Shift Alerts</h3>
              <p className="text-xs text-[#6C6782]">Real-time intelligence detected across rival ad campaigns, bundle offers, and pricing</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/20">
            {events.length} Active Signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {events.slice(0, 4).map((ev) => (
            <div key={ev.id} className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1.5 hover:bg-white transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-[#ECE8E3] text-[#141226]">
                  {ev.competitor_name}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  ev.impact_level === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {ev.impact_level} Impact
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#141226]">{ev.title}</h4>
              <p className="text-[11px] text-[#6C6782] leading-relaxed">{ev.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search and Filter Toolbar */}
      <div className="marky-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6C6782] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search competitors by brand name, industry, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="marky-input w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#6C6782] mr-1 shrink-0" />
          {THREAT_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#0B091B] text-white shadow-xs'
                  : 'bg-[#F7F6FA] text-[#6C6782] hover:text-[#141226] border border-[#ECE8E3]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Competitor Cards Grid */}
      {filteredCompetitors.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Competitors Found"
          description={searchQuery ? `No competitor records matching "${searchQuery}".` : 'Add competitors to run automated web scraping, threat scoring, and strategic AI reports.'}
          actionText="+ Add Competitor"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitors.map((comp) => {
            const threatScore = comp.ai_threat_score || 78;
            const threatLevel = comp.threat_level || 'Medium';
            const isResearchRunning = comp.research_status === 'running';

            return (
              <div
                key={comp.id}
                className="marky-card p-6 flex flex-col justify-between space-y-5 hover:border-[#7A5DBB]/50 transition-all shadow-xs hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Top Bar: Brand Name & Action */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-[#141226]">{comp.name}</h3>
                      {comp.url ? (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#6C6782] hover:text-[#4239C4] mt-0.5"
                        >
                          <span>{comp.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">No website registered</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(comp.id, comp.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AI Threat Score Card Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F7F6FA] to-white border border-[#ECE8E3] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black uppercase text-[#6C6782] tracking-wider">
                        AI Threat Score
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        threatLevel === 'Critical' || threatLevel === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : threatLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {threatLevel} Threat
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-[#141226]">{threatScore}</span>
                      <span className="text-xs font-bold text-[#6C6782]">/ 100</span>
                      {isResearchRunning && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#4239C4]">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Scraping...</span>
                        </span>
                      )}
                    </div>

                    {/* Threat Progress bar */}
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          threatScore >= 80 ? 'bg-rose-500' : (threatScore >= 60 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, threatScore))}%` }}
                      />
                    </div>
                  </div>

                  {/* Brief Strategic Excerpt */}
                  <p className="text-xs text-[#6C6782] leading-relaxed line-clamp-2">
                    {comp.analysis_summary || 'Monitored brand in regional e-commerce competitive landscape.'}
                  </p>
                </div>

                {/* Footer Action: [View Analysis] */}
                <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    {comp.last_scraped_at ? 'Researched via Apify' : 'Ready for AI Teardown'}
                  </span>

                  <button
                    onClick={() => handleOpenAnalysis(comp)}
                    className="marky-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Analysis</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Competitor Modal */}
      <AddCompetitorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleCompetitorCreated}
      />

      {/* 11-Section Comprehensive AI Intelligence Modal */}
      <CompetitorAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        competitor={selectedComp}
        activeJobId={activeJobId}
        onAnalysisUpdated={() => loadData()}
      />
    </div>
  );
}

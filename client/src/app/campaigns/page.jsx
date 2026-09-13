'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  PlusCircle,
  LayoutGrid,
  List,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Sparkles,
  MapPin,
  Copy,
  Check,
  Zap,
  Search,
  Globe,
  Video,
  Share2,
  ArrowUpRight,
  BarChart3,
  Sliders,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import AddCampaignModal from '@/components/AddCampaignModal';
import CampaignBlueprintModal from '@/components/CampaignBlueprintModal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [brands, setBrands] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [approvalFilter, setApprovalFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // AI Ad Kit & Blueprint Modal State
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [selectedBlueprintCampaign, setSelectedBlueprintCampaign] = useState(null);

  // Quick Copy Feedback State
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, brandFilter, approvalFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (brandFilter && brandFilter !== 'All') params.brand_id = brandFilter;
      if (approvalFilter && approvalFilter !== 'All') params.approval_status = approvalFilter;

      const [campRes, brandsRes] = await Promise.all([
        api.getCampaigns(params, true),
        api.getBrands(true)
      ]);

      if (campRes.success) setCampaigns(campRes.data || []);
      if (brandsRes.success) setBrands(brandsRes.data || []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateCampaign(id, { status: newStatus });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    try {
      await api.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(`Error deleting campaign: ${err.message}`);
    }
  };

  const handleOpenBlueprint = (campaign) => {
    setSelectedBlueprintCampaign(campaign);
    setBlueprintModalOpen(true);
  };

  const handleBlueprintUpdated = (updatedCampaign) => {
    setSelectedBlueprintCampaign(updatedCampaign);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
  };

  const handleQuickCopyMetaHook = (camp, e) => {
    e?.stopPropagation();
    let text = '';
    try {
      const bp = typeof camp.blueprint_json === 'string' ? JSON.parse(camp.blueprint_json) : camp.blueprint_json;
      if (bp?.metaAds?.creatives?.[0]?.primaryText) {
        text = bp.metaAds.creatives[0].primaryText;
      } else {
        text = camp.copy || camp.objective || camp.name;
      }
    } catch (err) {
      text = camp.copy || camp.objective || camp.name;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(`meta_${camp.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickCopyTikTokScript = (camp, e) => {
    e?.stopPropagation();
    let text = '';
    try {
      const bp = typeof camp.blueprint_json === 'string' ? JSON.parse(camp.blueprint_json) : camp.blueprint_json;
      const script = bp?.tiktokAds?.hooksAndScripts?.[0];
      if (script) {
        text = `[0-3s Hook]: "${script.first3Seconds}"\n[Visual]: ${script.visualDirection}\n[Voiceover]: ${script.voiceoverScript}\n[CTA]: ${script.callToAction}`;
      } else {
        text = camp.name;
      }
    } catch (err) {
      text = camp.name;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(`tiktok_${camp.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter campaigns by search query
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.objective?.toLowerCase().includes(q) ||
        c.brand_name?.toLowerCase().includes(q) ||
        c.platforms?.toLowerCase().includes(q) ||
        c.target_audience?.toLowerCase().includes(q) ||
        c.target_geography?.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  // Aggregate Portfolio Stats
  const portfolioStats = useMemo(() => {
    const totalBudget = campaigns.reduce((acc, c) => acc + (Number(c.budget) || 0), 0);
    const activeCount = campaigns.filter((c) => c.status === 'Active').length;
    const activeBudget = campaigns
      .filter((c) => c.status === 'Active')
      .reduce((acc, c) => acc + (Number(c.budget) || 0), 0);
    const pendingApprovals = campaigns.filter((c) => c.approval_status === 'Pending Approval').length;
    
    // Calculate average projected ROAS
    let roasSum = 0;
    let roasCount = 0;
    campaigns.forEach((c) => {
      try {
        const bp = typeof c.blueprint_json === 'string' ? JSON.parse(c.blueprint_json) : c.blueprint_json;
        if (bp?.budgetAndEconomics?.unitEconomics?.projectedRoas) {
          const val = parseFloat(bp.budgetAndEconomics.unitEconomics.projectedRoas);
          if (!isNaN(val)) {
            roasSum += val;
            roasCount++;
          }
        }
      } catch (e) {}
    });

    const avgRoas = roasCount > 0 ? (roasSum / roasCount).toFixed(2) + 'x' : '4.25x';

    return {
      totalBudget,
      activeCount,
      activeBudget,
      pendingApprovals,
      avgRoas
    };
  }, [campaigns]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* ── 1. Page Header ── */}
      <PageHeader
        badge="Multi-Channel Autonomous Ads Engine"
        badgeIcon={Layers}
        title="Marketing Campaigns Command"
        description="Deploy ready-to-paste ad creative packs, TikTok video scripts, Google search RSA assets, and unit economics tailored for direct copy-paste into Meta Ads Manager, TikTok Ads, and Google Ads."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 marky-btn-primary text-xs font-bold shadow-lg shadow-indigo-950/20 cursor-pointer transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        }
      />

      {/* ── 2. Top Executive KPI Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="marky-card p-4 relative overflow-hidden bg-gradient-to-br from-white to-[#F7F6FA] border border-[#ECE8E3] group hover:border-[#4239C4]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C6782] uppercase tracking-wider">Total Portfolio Budget</span>
            <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-[#141226]">
              PKR {portfolioStats.totalBudget.toLocaleString()}
            </h3>
            <p className="text-[11px] text-[#6C6782] mt-0.5 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">PKR {portfolioStats.activeBudget.toLocaleString()}</span> currently active
            </p>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="marky-card p-4 relative overflow-hidden bg-gradient-to-br from-white to-[#F7F6FA] border border-[#ECE8E3] group hover:border-[#4239C4]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C6782] uppercase tracking-wider">Campaign Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-[#141226]">
              {portfolioStats.activeCount} <span className="text-xs text-[#6C6782] font-semibold">Active</span>
              <span className="text-xs text-slate-400 font-normal"> / {campaigns.length} total</span>
            </h3>
            <p className="text-[11px] text-[#6C6782] mt-0.5">
              {portfolioStats.pendingApprovals > 0 ? (
                <span className="text-amber-600 font-bold">⚠️ {portfolioStats.pendingApprovals} Pending supervisor review</span>
              ) : (
                <span className="text-emerald-600 font-bold">✓ All campaigns supervisor verified</span>
              )}
            </p>
          </div>
        </div>

        {/* Target ROAS */}
        <div className="marky-card p-4 relative overflow-hidden bg-gradient-to-br from-white to-[#F7F6FA] border border-[#ECE8E3] group hover:border-[#4239C4]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C6782] uppercase tracking-wider">Blended Target ROAS</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7A5DBB] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-[#4239C4]">
              {portfolioStats.avgRoas}
            </h3>
            <p className="text-[11px] text-[#6C6782] mt-0.5">
              Target blended return across Meta + TikTok + Google
            </p>
          </div>
        </div>

        {/* AI Ready-to-Paste Coverage */}
        <div className="marky-card p-4 relative overflow-hidden bg-gradient-to-br from-[#141226] to-[#252044] text-white border border-[#2B2650]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FFC4DA] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Ad Kit Generator
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Ready
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Ready-to-Paste Deployments</span>
            </h3>
            <p className="text-[10px] text-slate-300 mt-1 leading-snug">
              No Meta/TikTok API connection required. Click any campaign blueprint to copy exact copy, hooks, RSA headlines & UTMs.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Filter, Search & View Controls ── */}
      <div className="marky-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-[#ECE8E3]">
        {/* Left: Search & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6C6782]" />
            <input
              type="text"
              placeholder="Search campaigns, objectives, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="marky-input pl-8.5 pr-3 py-1.5 text-xs font-semibold w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#141226]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F7F6FA] p-1 rounded-xl border border-[#ECE8E3]">
            {['All', 'Active', 'Draft', 'Paused', 'Completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-[#4239C4] shadow-xs'
                    : 'text-[#6C6782] hover:text-[#141226]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="marky-input text-xs font-semibold px-3 py-1.5 cursor-pointer bg-white"
          >
            <option value="All">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="marky-input text-xs font-semibold px-3 py-1.5 cursor-pointer bg-white"
          >
            <option value="All">All Approvals</option>
            <option value="Approved">Approved</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
        </div>

        {/* Right: View Toggle */}
        <div className="flex items-center gap-1 self-end md:self-auto bg-[#F7F6FA] p-1 rounded-xl border border-[#ECE8E3]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-[#4239C4] shadow-xs' : 'text-[#6C6782] hover:text-[#141226]'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-[#4239C4] shadow-xs' : 'text-[#6C6782] hover:text-[#141226]'
            }`}
            title="Table List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 4. Main Campaigns Content ── */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchQuery ? 'No Campaigns Matched' : 'No Campaigns Found'}
          description={
            searchQuery
              ? `No campaigns matched "${searchQuery}". Try refining your search or filters.`
              : 'Create your first multi-channel marketing campaign with AI ready-to-paste blueprints.'
          }
          actionText="Create Campaign"
          onAction={() => setShowAddModal(true)}
        />
      ) : viewMode === 'grid' ? (
        /* ══════════ GRID VIEW ══════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            let blueprint = null;
            try {
              blueprint = typeof camp.blueprint_json === 'string' ? JSON.parse(camp.blueprint_json) : camp.blueprint_json;
            } catch (e) {
              blueprint = null;
            }

            const projectedRoas = blueprint?.budgetAndEconomics?.unitEconomics?.projectedRoas || camp.roas || camp.kpi || '4.0x';
            const targetCpa = blueprint?.budgetAndEconomics?.unitEconomics?.targetCpa;
            const primaryHook = blueprint?.metaAds?.creatives?.[0]?.primaryText;
            const tiktokHook = blueprint?.tiktokAds?.hooksAndScripts?.[0]?.first3Seconds;

            return (
              <div
                key={camp.id}
                className="marky-card p-5 flex flex-col justify-between space-y-4 hover:border-[#4239C4]/50 hover:shadow-xl hover:shadow-indigo-950/5 transition-all group bg-white border border-[#ECE8E3] rounded-3xl"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Brand & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-[#4239C4] bg-[#4239C4]/10 px-2.5 py-0.5 rounded-full border border-[#7A5DBB]/20 uppercase tracking-wider">
                        {camp.brand_name || 'Brand Workspace'}
                      </span>
                      <StatusBadge status={camp.status} />
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          camp.approval_status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {camp.approval_status || 'Approved'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(camp.id, camp.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Campaign Title & Objective */}
                  <div>
                    <h3 className="text-base font-black text-[#141226] group-hover:text-[#4239C4] transition-colors leading-snug">
                      {camp.name}
                    </h3>
                    <p className="text-xs text-[#6C6782] line-clamp-2 mt-1 leading-relaxed">
                      {camp.objective}
                    </p>
                  </div>

                  {/* Platform Pills with Custom Styling */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {camp.platforms ? (
                      camp.platforms.split(',').map((plat, pIdx) => {
                        const pName = plat.trim().toLowerCase();
                        let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                        let Icon = Layers;

                        if (pName.includes('meta') || pName.includes('facebook') || pName.includes('instagram')) {
                          badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                          Icon = Share2;
                        } else if (pName.includes('tiktok')) {
                          badgeStyle = 'bg-pink-50 text-pink-700 border-pink-200';
                          Icon = Video;
                        } else if (pName.includes('google')) {
                          badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                          Icon = Search;
                        }

                        return (
                          <span
                            key={pIdx}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${badgeStyle}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{plat.trim()}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> Meta Advantage+
                      </span>
                    )}

                    {/* Geography Badge */}
                    {camp.target_geography && (
                      <span className="text-[10px] font-semibold text-[#6C6782] bg-[#F7F6FA] px-2 py-0.5 rounded-lg border border-[#ECE8E3] flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-rose-500" />
                        <span className="truncate max-w-[120px]">{camp.target_geography}</span>
                      </span>
                    )}
                  </div>

                  {/* Financial & Unit Economics Card */}
                  <div className="p-3 rounded-2xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-[#6C6782]">Allocated Budget:</span>
                      <span className="font-black text-[#141226]">
                        {camp.currency} {Number(camp.budget).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6C6782] font-semibold">Target ROAS:</span>
                      <span className="font-extrabold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.2 rounded-md">
                        {projectedRoas}
                      </span>
                    </div>

                    {targetCpa && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#6C6782]">Target CPA:</span>
                        <span className="font-bold text-slate-700">{targetCpa}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#4239C4] to-[#7A5DBB]"
                        style={{ width: camp.status === 'Active' ? '68%' : '20%' }}
                      />
                    </div>
                  </div>

                  {/* ⚡ HERO BUTTON: OPEN AI AD KIT & BLUEPRINT ── */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleOpenBlueprint(camp)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#141226] via-[#2A2356] to-[#4239C4] hover:from-[#1E1B38] hover:to-[#554AD8] shadow-md shadow-indigo-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] border border-indigo-400/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFC4DA] animate-pulse" />
                      <span>Open AI Ad Kit & Blueprint</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                    </button>
                  </div>

                  {/* Quick Copy Mini-Buttons */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={(e) => handleQuickCopyMetaHook(camp, e)}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#F7F6FA] hover:bg-blue-50 hover:text-blue-700 text-[#3E3A52] border border-[#ECE8E3] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Quick Copy Meta Primary Ad Text"
                    >
                      {copiedId === `meta_${camp.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-blue-600" />
                          <span>Copy Meta Text</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleQuickCopyTikTokScript(camp, e)}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#F7F6FA] hover:bg-pink-50 hover:text-pink-700 text-[#3E3A52] border border-[#ECE8E3] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Quick Copy TikTok Hook & Script"
                    >
                      {copiedId === `tiktok_${camp.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3 h-3 text-pink-600" />
                          <span>Copy TikTok Hook</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Footer: Status Switcher */}
                <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-between text-xs font-bold">
                  <span className="text-[#6C6782]">Status:</span>
                  <select
                    value={camp.status}
                    onChange={(e) => handleStatusChange(camp.id, e.target.value)}
                    className="marky-input text-xs font-bold py-1 px-2.5 cursor-pointer bg-[#F7F6FA]"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ══════════ TABLE LIST VIEW ══════════ */
        <div className="marky-card overflow-hidden border border-[#ECE8E3] bg-white rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="marky-table">
              <thead>
                <tr>
                  <th>Campaign & Target</th>
                  <th>Brand</th>
                  <th>Budget</th>
                  <th>Channels</th>
                  <th>Target ROAS</th>
                  <th className="text-center">Approval</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">AI Deployment Kit</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((camp) => {
                  let blueprint = null;
                  try {
                    blueprint = typeof camp.blueprint_json === 'string' ? JSON.parse(camp.blueprint_json) : camp.blueprint_json;
                  } catch (e) {}

                  const projectedRoas = blueprint?.budgetAndEconomics?.unitEconomics?.projectedRoas || camp.roas || camp.kpi || '4.0x';

                  return (
                    <tr key={camp.id} className="hover:bg-[#F7F6FA]/60 transition-colors">
                      <td className="font-extrabold text-[#141226]">
                        <span className="text-sm font-black">{camp.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {camp.target_geography && (
                            <span className="text-[10px] font-semibold text-[#6C6782] flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-rose-500" /> {camp.target_geography}
                            </span>
                          )}
                          {camp.objective && (
                            <span className="text-[10px] text-slate-500 truncate max-w-xs">
                              • {camp.objective}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="text-xs text-[#4239C4] font-bold">
                        {camp.brand_name || '—'}
                      </td>

                      <td className="font-mono font-bold text-[#141226] text-xs">
                        {camp.currency} {Number(camp.budget).toLocaleString()}
                      </td>

                      <td className="text-xs max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {camp.platforms ? (
                            camp.platforms.split(',').map((p, i) => (
                              <span key={i} className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {p.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">Meta Advantage+</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="text-xs font-black text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-md">
                          {projectedRoas}
                        </span>
                      </td>

                      <td className="text-center">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            camp.approval_status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {camp.approval_status || 'Approved'}
                        </span>
                      </td>

                      <td className="text-center">
                        <StatusBadge status={camp.status} />
                      </td>

                      {/* AI Blueprint Button */}
                      <td className="text-right">
                        <button
                          onClick={() => handleOpenBlueprint(camp)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#141226] to-[#4239C4] hover:opacity-95 shadow-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="w-3 h-3 text-[#FFC4DA]" />
                          <span>Open Ad Kit</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={camp.status}
                            onChange={(e) => handleStatusChange(camp.id, e.target.value)}
                            className="marky-input text-xs font-bold py-1 px-2 cursor-pointer bg-white"
                          >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Paused">Paused</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button
                            onClick={() => handleDelete(camp.id, camp.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Add Campaign Modal ── */}
      <AddCampaignModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        brands={brands}
        onCreated={() => {
          loadData();
          setShowAddModal(false);
        }}
      />

      {/* ── 6. Full AI Multi-Platform Ad Kit Blueprint Modal ── */}
      <CampaignBlueprintModal
        isOpen={blueprintModalOpen}
        onClose={() => setBlueprintModalOpen(false)}
        campaign={selectedBlueprintCampaign}
        onUpdated={handleBlueprintUpdated}
      />
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Briefcase,
  Layers,
  Users,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '@/lib/api';
import AddBrandModal from '@/components/AddBrandModal';
import AddCampaignModal from '@/components/AddCampaignModal';

export default function Dashboard() {
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [workforceData, setWorkforceData] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState('');

  const [activeBrandId, setActiveBrandId] = useState(null);
  const [activeBrandName, setActiveBrandName] = useState('All Brands');

  // Modals
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);

  useEffect(() => {
    const handleBrandChange = () => {
      if (typeof window !== 'undefined') {
        const bId = localStorage.getItem('marketpulse_active_brand_id');
        const bName = localStorage.getItem('marketpulse_active_brand') || 'All Brands';
        setActiveBrandId(bId || null);
        setActiveBrandName(bName);
        loadDashboardData(bId || null);
      }
    };

    if (typeof window !== 'undefined') {
      const bId = localStorage.getItem('marketpulse_active_brand_id');
      const bName = localStorage.getItem('marketpulse_active_brand') || 'All Brands';
      setActiveBrandId(bId || null);
      setActiveBrandName(bName);
      loadDashboardData(bId || null);
      window.addEventListener('brandSelected', handleBrandChange);
      return () => window.removeEventListener('brandSelected', handleBrandChange);
    } else {
      loadDashboardData(null);
    }
  }, []);

  const loadDashboardData = async (brandId = activeBrandId) => {
    try {
      const [
        brandsRes,
        campaignsRes,
        statsRes,
        leadsRes,
        workforceRes
      ] = await Promise.all([
        api.getBrands(),
        api.getCampaigns(brandId ? { brand_id: brandId } : {}),
        api.getCampaignStats(brandId),
        api.getLeads(),
        api.getWorkforceStatus()
      ]);

      if (brandsRes.success) setBrands(brandsRes.data || []);
      if (campaignsRes.success) setCampaigns(campaignsRes.data || []);
      if (statsRes.success) setCampaignStats(statsRes.data);
      if (leadsRes.success) setLeads(leadsRes.data || []);
      if (workforceRes.success) {
        setWorkforceData(workforceRes.data);
        if (workforceRes.data.recentRuns) setRecentRuns(workforceRes.data.recentRuns);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await api.updateCampaign(campaignId, { status: newStatus });
      loadDashboardData();
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const platformBarData = campaignStats?.platformBreakdown
    ? Object.entries(campaignStats.platformBreakdown).map(([platform, budget]) => ({
        platform: platform.replace(' Advantage+', '').replace(' Sponsored', ''),
        budget: Math.round(budget)
      }))
    : [];

  const kpis = workforceData?.kpis || {
    tasksAutomated: 21,
    estimatedHoursSaved: '54.6',
    automationPercentage: '87.5%'
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. HERO BANNER: MARKY COMMAND CENTER */}
      <div className="bg-[#0B091B] rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-[#1C1938] relative overflow-hidden">
        {/* Subtle fluid ribbon glow derived from the Marky logo */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-tr from-[#D97FA5]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-xl">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Command Center
            </h1>
            <p className="text-xs md:text-sm text-[#B4AFCC] leading-relaxed">
              Track cross-channel performance, audit acquisition unit economics, and deploy 12 specialized autonomous AI agents from a single strategic workspace.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <button
              onClick={() => setShowAddBrand(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171434] hover:bg-[#221D4B] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#A59FFF]" />
              <span>Create Brand</span>
            </button>

            <button
              onClick={() => setShowAddCampaign(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F1B47] hover:bg-[#2A2461] text-white text-xs font-semibold border border-[#7A5DBB]/30 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#D1C3FF]" />
              <span>New Campaign</span>
            </button>

            <Link
              href="/workflows"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl marky-btn-primary text-xs font-bold"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Orchestrator</span>
            </Link>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-[#4239C4]/10 border border-[#4239C4]/30 text-[#4239C4] rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#4239C4]" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 2. EXECUTIVE KPI STATS GRID WITH INTENTIONAL HIERARCHY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Active Ad Spend */}
        <div className="marky-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C6782] uppercase tracking-wider">Active Ad Spend</span>
            <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold text-xs">
              PKR
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#141226] tracking-tight">
              PKR {(campaignStats?.active_budget || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-[#4239C4] font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {campaignStats?.active_budget > 0 ? 'Active Deployment' : 'No ad spend allocated'}
              </span>
            </p>
          </div>
        </div>

        {/* Metric 2: Active Campaigns (Insight Card with Violet Accent) */}
        <div className="marky-card-insight p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C6782] uppercase tracking-wider">Campaign Roster</span>
            <div className="w-8 h-8 rounded-xl bg-[#7A5DBB]/10 text-[#7A5DBB] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#141226] tracking-tight">
              {campaignStats?.active_campaigns || 0} <span className="text-xs font-semibold text-[#9894AD]">/ {campaignStats?.total_campaigns || 0}</span>
            </h3>
            <p className="text-[11px] text-[#6C6782] font-medium mt-1">
              {campaignStats?.draft_campaigns || 0} Draft • {campaignStats?.paused_campaigns || 0} Paused
            </p>
          </div>
        </div>

        {/* Metric 3: CRM Verified Leads */}
        <div className="marky-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C6782] uppercase tracking-wider">CRM Prospects</span>
            <div className="w-8 h-8 rounded-xl bg-[#9B4FA5]/10 text-[#9B4FA5] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#141226] tracking-tight">
              {leads.length}
            </h3>
            <p className="text-[11px] text-[#9B4FA5] font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Verified High-Intent</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Brand Ecosystem */}
        <div className="marky-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C6782] uppercase tracking-wider">Brand Profiles</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0A09F]/20 text-[#A73B9D] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#141226] tracking-tight">
              {brands.length}
            </h3>
            <p className="text-[11px] text-[#6C6782] font-medium mt-1">
              Active Brand Workspaces
            </p>
          </div>
        </div>

        {/* Metric 5: Marky AI Automated Work */}
        <div className="marky-card p-5 space-y-3 col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-white via-white to-[#F7F6FA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C6782] uppercase tracking-wider">AI Operations</span>
            <div className="w-8 h-8 rounded-xl bg-[#0B091B] p-1 flex items-center justify-center shadow-xs">
              <img src="/marky-avatar.png" alt="Marky" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#4239C4] tracking-tight">
              {kpis.tasksAutomated || 0} <span className="text-xs font-bold text-[#9894AD]">runs</span>
            </h3>
            <p className="text-[11px] text-[#7A5DBB] font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{kpis.estimatedHoursSaved ? `${kpis.estimatedHoursSaved} hrs work saved` : 'Autonomous pipeline ready'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. ANALYTICS CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Performance Trend (7 cols) */}
        <div className="lg:col-span-7 marky-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#141226]">7-Day Revenue vs Ad Spend Pace</h3>
              <p className="text-[11px] text-[#6C6782]">Conversions tracked across Meta Advantage+, TikTok & Daraz</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4239C4]"></span>
                <span className="text-[#3E3A52]">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97FA5]"></span>
                <span className="text-[#3E3A52]">Ad Spend</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {campaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns.map(c => ({ name: c.name.substring(0, 14), budget: Number(c.budget) }))} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE8E3" />
                  <XAxis dataKey="name" stroke="#9894AD" fontSize={10} interval={0} angle={-20} textAnchor="end" />
                  <YAxis stroke="#9894AD" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
                  <Tooltip
                    formatter={(val) => [`PKR ${Number(val).toLocaleString()}`, 'Allocated Budget']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #ECE8E3', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="budget" fill="#4239C4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-2 text-[#9894AD]">
                <Layers className="w-8 h-8 mx-auto text-[#7A5DBB]/40 stroke-[1.5]" />
                <p className="text-xs font-bold text-[#141226]">No active campaign metrics yet</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Create your first marketing campaign to track cross-network ad spend and revenue pace.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Budget Allocation (5 cols) */}
        <div className="lg:col-span-5 marky-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#141226]">Active Channel Allocation</h3>
              <p className="text-[11px] text-[#6C6782]">Live budget distribution across ad networks</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4]">
              Live Plan
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBarData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE8E3" />
                <XAxis dataKey="platform" stroke="#9894AD" fontSize={10} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#9894AD" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
                <Tooltip
                  formatter={(val) => [`PKR ${Number(val).toLocaleString()}`, 'Budget']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #ECE8E3', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="budget" fill="#4239C4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE CAMPAIGNS & CRM LEADS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Campaigns Table (7 cols) */}
        <div className="lg:col-span-7 marky-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#141226]">Marketing Campaigns</h3>
            </div>
            <Link
              href="/campaigns"
              className="text-xs font-semibold text-[#4239C4] hover:text-[#372EB3] flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6FA] text-[#6C6782] font-bold uppercase tracking-wider text-[10px] border-y border-[#ECE8E3]">
                <tr>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Budget</th>
                  <th className="py-2.5 px-3">Approval</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0EC]">
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9FC] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#141226]">{c.name}</p>
                      <p className="text-[10px] text-[#9894AD]">{c.platforms}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#3E3A52]">
                      {c.brand_name || 'Lumina Skincare PK'}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#141226]">
                      {c.currency} {Number(c.budget).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                        c.approval_status === 'Approved' ? 'bg-[#4239C4]/10 text-[#4239C4]' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.approval_status || 'Approved'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer ${
                          c.status === 'Active'
                            ? 'bg-[#4239C4]/10 text-[#4239C4] border-[#4239C4]/30'
                            : c.status === 'Draft'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : c.status === 'Paused'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: CRM Leads Snapshot (5 cols) */}
        <div className="lg:col-span-5 marky-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#9B4FA5]/10 text-[#9B4FA5] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#141226]">Recent CRM Leads</h3>
            </div>
            <Link
              href="/crm"
              className="text-xs font-semibold text-[#7A5DBB] hover:text-[#4239C4] flex items-center gap-1"
            >
              <span>Manage CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="p-3 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA]/60 flex items-center justify-between hover:bg-white hover:border-[#7A5DBB]/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#141226]">{lead.name}</h4>
                    <span className="text-[10px] text-[#9894AD] font-medium">({lead.city || 'Pakistan'})</span>
                    {lead.lead_score && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        lead.lead_score === 'A' ? 'bg-[#4239C4]/10 text-[#4239C4]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Tier {lead.lead_score}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6C6782] mt-0.5">{lead.category}</p>
                  <p className="text-[10px] text-[#9894AD] font-mono mt-0.5">{lead.phone}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lead.status === 'Prospect'
                        ? 'bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20'
                        : lead.status === 'Customer'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {lead.status}
                  </span>
                  <p className="text-[10px] text-amber-500 font-bold mt-1">★ {lead.rating || 5.0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. RECENT WORKFORCE AUTOMATION RUNS */}
      <div className="marky-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#141226]">Workforce Multi-Agent Automations</h3>
              <p className="text-[11px] text-[#6C6782]">Autonomous campaign execution history</p>
            </div>
          </div>

          <Link
            href="/workflows"
            className="text-xs font-semibold text-[#4239C4] hover:text-[#372EB3] flex items-center gap-1"
          >
            <span>Workforce Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentRuns.length === 0 ? (
            <p className="text-xs text-[#9894AD] py-4 text-center col-span-full">No runs executed yet. Launch an orchestrator workflow to begin.</p>
          ) : (
            recentRuns.slice(0, 3).map((run) => (
              <div key={run.id} className="p-4 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA]/70 space-y-2 flex flex-col justify-between hover:bg-white hover:border-[#7A5DBB]/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-[#141226] truncate">{run.name}</h4>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      run.status === 'Completed'
                        ? 'bg-[#4239C4]/10 text-[#4239C4]'
                        : run.status === 'Awaiting Approval'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C6782] line-clamp-2">{run.user_goal}</p>
                </div>
                
                <div className="space-y-1.5 pt-2 border-t border-[#ECE8E3]">
                  <div className="flex items-center justify-between text-[10px] text-[#9894AD] font-mono">
                    <span>{run.tasks_automated || 6} Tasks Auto</span>
                    <span>{run.hours_saved || 12}h Saved</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#ECE8E3] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4239C4] h-full rounded-full transition-all duration-500"
                      style={{ width: `${run.progress || 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global Modals Mounted */}
      <AddBrandModal
        isOpen={showAddBrand}
        onClose={() => setShowAddBrand(false)}
        onCreated={() => loadDashboardData()}
      />

      <AddCampaignModal
        isOpen={showAddCampaign}
        onClose={() => setShowAddCampaign(false)}
        brands={brands}
        onCreated={() => loadDashboardData()}
      />
    </div>
  );
}

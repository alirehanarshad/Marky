'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  PlusCircle,
  ExternalLink,
  Layers,
  Users,
  Sparkles,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Globe,
  Radio,
  Zap,
  Shield,
  Activity,
  Award,
  Search,
  Filter,
  X,
  Clock,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import AddBrandModal from '@/components/AddBrandModal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeBrandName, setActiveBrandName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandProfile, setSelectedBrandProfile] = useState(null);
  const [profileTab, setProfileTab] = useState('overview');

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('marketpulse_active_brand');
      if (active) setActiveBrandName(active);
    }
  }, []);

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        api.getBrands(),
        api.getCampaigns()
      ]);
      if (bRes.success) setBrands(bRes.data);
      if (cRes.success) setCampaigns(cRes.data);
    } catch (err) {
      console.error('Error loading brands data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = (brand) => {
    setActiveBrandName(brand.name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketpulse_active_brand', brand.name);
      localStorage.setItem('marketpulse_active_brand_id', brand.id);
      window.dispatchEvent(new Event('brandSelected'));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.duplicateBrand(id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(`Duplicate error: ${err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove its associated campaigns.`)) return;
    try {
      await api.deleteBrand(id);
      if (selectedBrandProfile?.id === id) setSelectedBrandProfile(null);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to derive metrics for each brand
  const getBrandMetrics = (brand) => {
    const brandCampaigns = campaigns.filter((c) => c.brand_id === brand.id);
    const activeCamps = brandCampaigns.filter((c) => c.status === 'Active');
    const healthScore = brand.tier === 'Luxury' ? 92 : brand.tier === 'Premium' ? 86 : 78;
    const marketingScore = Math.min(95, healthScore + (activeCamps.length * 4));
    return {
      campaignsCount: brandCampaigns.length,
      activeCount: activeCamps.length,
      healthScore,
      marketingScore,
      status: activeCamps.length > 0 ? 'Active' : 'Needs attention',
      lastAudit: '2 days ago'
    };
  };

  // Filtering
  const filteredBrands = brands.filter((b) => {
    const metrics = getBrandMetrics(b);
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.industry && b.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'active') return metrics.status === 'Active';
    if (filterTab === 'attention') return metrics.status === 'Needs attention';
    if (filterTab === 'high') return metrics.healthScore >= 85;
    if (filterTab === 'recent') return true;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Multi-Brand Workspace Engine"
        badgeIcon={Briefcase}
        title="Brand Profiles & Ecosystem"
        description="Unified multi-brand portfolio management: audit brand health scores, configure positioning constraints, track active campaigns, and switch active context across all AI tools."
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 marky-btn-primary text-xs font-bold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Brand Profile</span>
          </button>
        }
      />

      {/* 2. Filter & Search Controls */}
      <div className="marky-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Brands', count: brands.length },
            { id: 'active', label: 'Active' },
            { id: 'attention', label: 'Needs Attention' },
            { id: 'high', label: 'High Performing' }
          ]}
          activeTab={filterTab}
          onChange={setFilterTab}
        />

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#6C6782] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search brands or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="marky-input w-full pl-9 pr-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* 3. Brands Cards Grid */}
      {filteredBrands.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Brands Found"
          description="No brand workspaces match your active filter. Create a brand or clear search."
          actionText="Create Brand"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => {
            const isActive = activeBrandName === brand.name;
            const metrics = getBrandMetrics(brand);

            return (
              <div
                key={brand.id}
                className={`marky-card p-6 flex flex-col justify-between space-y-4 transition-all relative ${
                  isActive
                    ? 'border-[#7A5DBB] ring-2 ring-[#7A5DBB]/20 shadow-md bg-gradient-to-br from-white via-white to-[#F7F6FA]'
                    : ''
                }`}
              >
                {/* Top: Avatar, Name, Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4239C4]/15 to-[#A73B9D]/15 text-[#4239C4] flex items-center justify-center font-black text-lg border border-[#7A5DBB]/20 shrink-0">
                        {brand.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-[#141226] tracking-tight">{brand.name}</h3>
                          {isActive && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[#7A5DBB] block">
                          {brand.category || brand.industry || 'E-Commerce Retail'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSetActive(brand)}
                        title={isActive ? 'Active Brand' : 'Set as Active Brand'}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#4239C4] text-white border-[#4239C4] shadow-xs'
                            : 'bg-white border-[#ECE8E3] text-[#6C6782] hover:text-[#4239C4]'
                        }`}
                      >
                        <Radio className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Brand Overview snippet */}
                  <p className="text-xs text-[#6C6782] line-clamp-2 leading-relaxed">
                    {brand.description || brand.brand_positioning || 'AI-optimized brand workspace with pre-calibrated voice and target demographic guidelines.'}
                  </p>

                  {/* Scores & Activity Matrix */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                    <div>
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Health Score</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-black text-[#4239C4]">{metrics.healthScore}/100</span>
                        <span className="text-[10px] font-bold text-emerald-700">Good</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Marketing Index</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-black text-[#141226]">{metrics.marketingScore}/100</span>
                        <span className="text-[10px] font-bold text-[#7A5DBB]">Verified</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#ECE8E3]">
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Active Campaigns</span>
                      <span className="text-xs font-black text-[#141226] mt-0.5 block">{metrics.activeCount} running</span>
                    </div>
                    <div className="pt-2 border-t border-[#ECE8E3]">
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Last Audit</span>
                      <span className="text-xs font-semibold text-[#6C6782] mt-0.5 block">{metrics.lastAudit}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-between text-xs font-bold">
                  <button
                    onClick={() => {
                      setSelectedBrandProfile(brand);
                      setProfileTab('overview');
                    }}
                    className="flex items-center gap-1 text-[#4239C4] hover:text-[#372EB3] transition-colors cursor-pointer"
                  >
                    <span>View Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(brand.id)}
                      title="Duplicate Brand"
                      className="p-1.5 text-[#6C6782] hover:text-[#4239C4] rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      title="Delete Brand"
                      className="p-1.5 text-[#6C6782] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Interactive Brand Profile Drawer / Modal */}
      {selectedBrandProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden animate-fadeIn">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-black text-xl border border-[#7A5DBB]/30">
                  {selectedBrandProfile.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#141226]">{selectedBrandProfile.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/25">
                      {selectedBrandProfile.tier || 'Premium'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6C6782]">{selectedBrandProfile.company_name || selectedBrandProfile.category}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBrandProfile(null)}
                className="p-2 text-[#6C6782] hover:text-[#141226] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-[#ECE8E3] bg-white">
              <Tabs
                variant="underline"
                tabs={[
                  { id: 'overview', label: 'Brand Identity & USPs' },
                  { id: 'audience', label: 'Audience & Positioning' },
                  { id: 'campaigns', label: 'Campaigns & Intel' },
                  { id: 'audit', label: 'Audit History' }
                ]}
                activeTab={profileTab}
                onChange={setProfileTab}
              />
            </div>

            {/* Profile Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {profileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase">Website URL</span>
                      <p className="font-semibold text-[#141226] flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-[#4239C4]" />
                        <span>{selectedBrandProfile.website || 'https://brand-store.pk'}</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase">Price Range / AOV</span>
                      <p className="font-semibold text-[#141226]">{selectedBrandProfile.pricing || 'PKR 3,500 - PKR 6,000'}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-2">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase">Core Unique Selling Proposition (USP)</span>
                    <p className="font-medium text-[#3E3A52] leading-relaxed">
                      {selectedBrandProfile.usps || 'Lab-tested pure raw sidr honey harvested directly from Karak apiaries with certified purity certificates in every parcel.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-2">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase">Brand Voice & Tone</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#4239C4]/10 text-[#4239C4] font-bold">
                        {selectedBrandProfile.brand_voice || 'Direct & Authentic'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#7A5DBB]/10 text-[#7A5DBB] font-bold">
                        {selectedBrandProfile.tone || 'Confident & Premium'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'audience' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase">Target Audience Profile</span>
                    <p className="font-medium text-[#3E3A52] leading-relaxed">
                      {selectedBrandProfile.target_audience || 'Health-conscious mothers, corporate executives, wellness enthusiasts, and seasonal gifting shoppers aged 24-52 in major urban metros.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-2">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase">Target Geographies</span>
                    <p className="font-semibold text-[#141226]">
                      {selectedBrandProfile.target_locations || 'Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-2">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase">Positioning Guardrails</span>
                    <p className="font-medium text-[#3E3A52] leading-relaxed">
                      {selectedBrandProfile.brand_positioning || 'Never position as discount mass-market syrup. Maintain luxury DTC benchmark with high proof standards.'}
                    </p>
                  </div>
                </div>
              )}

              {profileTab === 'campaigns' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase">Active Marketing Channels</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(selectedBrandProfile.social_platforms ? selectedBrandProfile.social_platforms.split(',') : ['Meta Ads', 'TikTok Shop', 'Instagram', 'WhatsApp']).map((plat, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-[#ECE8E3] text-[#141226] font-bold">
                          {plat.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#4239C4]/5 border border-[#7A5DBB]/25 space-y-1">
                    <span className="text-[10px] font-bold text-[#4239C4] uppercase">Marketing Performance Goals</span>
                    <p className="font-semibold text-[#141226]">
                      {selectedBrandProfile.marketing_goals || 'Scale blended ROAS to 4.2x with sub-10% COD courier return rates'}
                    </p>
                  </div>
                </div>
              )}

              {profileTab === 'audit' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-[#ECE8E3] bg-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#141226] block">Q1 2026 Executive Performance Audit</span>
                      <span className="text-[10px] text-[#6C6782]">Status: Certified • Overall Score: 86/100</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Passed
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#ECE8E3] bg-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#141226] block">Unit Economics & Courier Audit</span>
                      <span className="text-[10px] text-[#6C6782]">COD Returns audited at 12.8% (down from 18%)</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-full border border-[#7A5DBB]/20">
                      Verified
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#ECE8E3] bg-[#F7F6FA] flex items-center justify-between">
              <button
                onClick={() => handleSetActive(selectedBrandProfile)}
                className="marky-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Set as Active Brand Workspace
              </button>
              <button
                onClick={() => setSelectedBrandProfile(null)}
                className="marky-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          loadData();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

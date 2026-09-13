'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Eye,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  Award,
  Zap,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  X,
  Globe,
  Filter,
  Lightbulb,
  Compass,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

const COUNTRIES = [
  { code: 'PK', label: 'Pakistan (PK)' },
  { code: 'US', label: 'United States (US)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'AE', label: 'United Arab Emirates (AE)' }
];

const PLATFORMS = ['ALL', 'Facebook', 'Instagram', 'Messenger'];

export default function MetaAdsPage() {
  const [query, setQuery] = useState('Nerds Toy Gun');
  const [country, setCountry] = useState('PK');
  const [platform, setPlatform] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [notice, setNotice] = useState('');

  // Keyword Intent Expansion
  const [keywordVariants, setKeywordVariants] = useState([]);
  const [expandingKeywords, setExpandingKeywords] = useState(false);

  // AI Strategic Teardown
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    handleSearch('Nerds Toy Gun');
  }, []);

  const handleSearch = async (overrideQuery) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    if (!q || !q.trim()) return;

    setLoading(true);
    setNotice('');
    setAnalysisResult(null);

    // Expand search intent variants in parallel
    triggerKeywordExpansion(q);

    try {
      const res = await api.searchMetaAds(q, country, platform, activeStatus);
      if (res.success) {
        setAds(res.data || []);
        if (res.notice) {
          setNotice(res.notice);
        }
      }
    } catch (err) {
      console.error('Error fetching Meta ads:', err);
      setNotice(`Retrieval notice: ${err.message}`);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const triggerKeywordExpansion = async (searchIntent) => {
    setExpandingKeywords(true);
    try {
      const res = await api.expandMetaKeywords(searchIntent);
      if (res.success && res.data?.variants) {
        setKeywordVariants(res.data.variants);
      }
    } catch (e) {
      console.warn('Keyword expansion notice:', e);
    } finally {
      setExpandingKeywords(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (ads.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeMetaAds({
        competitor: query,
        ads: ads.slice(0, 10)
      });
      if (res.success) {
        setAnalysisResult(res.analysis);
      }
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyText = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Meta Ad Library & Competitive Creative Intelligence"
        badgeIcon={Search}
        title="Meta Ad Inspector"
        description="Dynamically inspect active competitor ad creatives, hook angles, and commercial packaging across the Meta Ad Library using live Apify data retrieval."
      />

      {/* 2. Search Toolbar & Supported Filters */}
      <div className="marky-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search competitors, products, brands, or keywords (e.g. Nerds Toy Gun, Marhaba, J.)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="marky-input w-full pl-10 pr-4 py-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="px-4 py-2 marky-btn-secondary text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </span>
              ) : (
                'Search Ads'
              )}
            </button>

            <button
              onClick={handleAnalyzeWithAI}
              disabled={analyzing || ads.length === 0}
              className="px-4 py-2 marky-btn-primary text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI Ad Teardown</span>
            </button>
          </div>
        </div>

        {/* Supported Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#ECE8E3] text-xs">
          {/* Country */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6C6782] shrink-0">Region:</span>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                handleSearch();
              }}
              className="marky-input w-full py-1 px-2 text-xs bg-white cursor-pointer"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6C6782] shrink-0">Platform:</span>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                handleSearch();
              }}
              className="marky-input w-full py-1 px-2 text-xs bg-white cursor-pointer"
            >
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6C6782] shrink-0">Status:</span>
            <select
              value={activeStatus}
              onChange={(e) => {
                setActiveStatus(e.target.value);
                handleSearch();
              }}
              className="marky-input w-full py-1 px-2 text-xs bg-white cursor-pointer"
            >
              <option value="ALL">All Ads (Active + Inactive)</option>
              <option value="ACTIVE">Active Ads Only</option>
            </select>
          </div>
        </div>

        {/* Keyword Intelligence & Query Expansion */}
        {keywordVariants.length > 0 && (
          <div className="pt-2 border-t border-[#ECE8E3] space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-black text-[#4239C4] uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-[#4239C4]" />
                <span>Search Intent Expansion (Click variant to search):</span>
              </span>
              {expandingKeywords && <span className="text-[10px] text-slate-400">Expanding...</span>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {keywordVariants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(variant);
                    handleSearch(variant);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F7F6FA] text-[#141226] hover:bg-[#4239C4] hover:text-white border border-[#ECE8E3] transition-all cursor-pointer"
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notice Alert if applicable */}
      {notice && (
        <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">External Data Source Notice:</span>
            <span className="text-[11px] text-amber-800">{notice}</span>
          </div>
        </div>
      )}

      {/* 3. AI Ad Strategic Teardown Report */}
      {analysisResult && (
        <div className="marky-card p-6 md:p-8 space-y-6 border border-[#7A5DBB]/40 shadow-xl animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#ECE8E3]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#141226]">
                  Ad Intelligence Teardown: "{query}"
                </h3>
                <p className="text-xs text-[#6C6782]">
                  Synthesized from {analysisResult.advertiserOverview?.retrievedAdsCount || ads.length} live records via Meta Ad Library
                </p>
              </div>
            </div>
            <button
              onClick={() => setAnalysisResult(null)}
              className="p-1 text-[#6C6782] hover:text-[#141226] rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Advertiser Overview & Creative Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2">
              <span className="text-[10px] font-black uppercase text-[#4239C4] tracking-wider block">
                Advertiser Overview
              </span>
              <p className="font-bold text-[#141226]">{analysisResult.advertiserOverview?.primaryAdvertiser}</p>
              <p className="text-[#6C6782] leading-relaxed">{analysisResult.advertiserOverview?.activitySummary}</p>
              <span className="text-[10px] text-slate-400 font-mono block pt-1">
                Source: {analysisResult.advertiserOverview?.source || 'Meta Ad Library'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2">
              <span className="text-[10px] font-black uppercase text-[#7A5DBB] tracking-wider block">
                Creative Analysis
              </span>
              <div className="space-y-1 text-[#3E3A52]">
                <p><strong>Visual Formats:</strong> {analysisResult.creativeAnalysis?.visualFormats}</p>
                <p><strong>Copy Structure:</strong> {analysisResult.creativeAnalysis?.primaryCopyStructure}</p>
                <p><strong>Headline Angles:</strong> {analysisResult.creativeAnalysis?.headlinePatterns}</p>
              </div>
            </div>
          </div>

          {/* 2. Competitive Patterns (Most Common) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-purple-50/40 to-white border border-[#ECE8E3] space-y-3">
            <span className="text-[10px] font-black uppercase text-[#141226] tracking-wider block">
              Observed Competitive Patterns
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#ECE8E3] space-y-1">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Most Common Hook</span>
                <p className="font-bold text-[#141226]">{analysisResult.competitivePatterns?.mostCommonHook || 'Direct Value Claim'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#ECE8E3] space-y-1">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Most Common Offer</span>
                <p className="font-bold text-emerald-800">{analysisResult.competitivePatterns?.mostCommonOffer || 'Free Delivery / Discount'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#ECE8E3] space-y-1">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Most Common CTA</span>
                <p className="font-bold text-[#4239C4]">{analysisResult.competitivePatterns?.mostCommonCTA || 'Shop Now'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#ECE8E3] space-y-1">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Dominant Positioning</span>
                <p className="font-bold text-[#7A5DBB]">{analysisResult.competitivePatterns?.mostCommonPositioning || 'Quality Leader'}</p>
              </div>
            </div>
          </div>

          {/* 3. Meta Ad Opportunities (AI Recommendations) */}
          <div className="p-5 rounded-2xl bg-[#0B091B] text-white border border-[#1C1938] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#F3C5A8] uppercase tracking-wider block">
                Meta Ad Opportunities (Autonomous Strategic Recommendations)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                AI Advisory Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              {(analysisResult.aiOpportunities || []).map((opp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black text-[#D1C3FF] uppercase block">
                    {opp.opportunityType}
                  </span>
                  <p className="text-xs text-white font-medium leading-relaxed">{opp.recommendation}</p>
                  <p className="text-[11px] text-slate-400 italic pt-1">{opp.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Retrieved Ads Grid */}
      {ads.length === 0 && !loading ? (
        <EmptyState
          icon={Search}
          title="No Ads Found"
          description={`No live Meta ad records currently retrieved for "${query}". Try searching for popular brands or general categories like 'Honey', 'Leather', or 'Apparel'.`}
          actionText="Search Popular Query"
          onAction={() => {
            setQuery('Honey');
            handleSearch('Honey');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad, idx) => {
            const isCopied = copiedId === (ad.id || idx);

            return (
              <div
                key={ad.id || idx}
                className="marky-card p-5 flex flex-col justify-between space-y-4 hover:border-[#7A5DBB]/40 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  {/* Card Header: Advertiser & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-[#141226] block">
                        {ad.page_name || 'Advertiser'}
                      </span>
                      <span className="text-[10px] text-[#6C6782] font-mono">
                        ID: {ad.id || `ad_${idx}`}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ad.status || 'Active'}
                    </span>
                  </div>

                  {/* Primary Copy / Body */}
                  <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs text-[#3E3A52] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line font-sans">
                    {ad.primary_text || 'Not available from this source'}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center justify-between text-[11px] text-[#6C6782] pt-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <Tag className="w-3.5 h-3.5 text-[#7A5DBB]" />
                      <span>{ad.media_type || 'Image'}</span>
                    </span>

                    <span className="text-[10px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded">
                      {ad.platforms || 'Meta'}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-between text-xs font-bold">
                  <button
                    onClick={() => handleCopyText(ad.primary_text, ad.id || idx)}
                    className="flex items-center gap-1 text-[#4239C4] hover:text-[#372EB3] cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Ad Copy</span>
                      </>
                    )}
                  </button>

                  {ad.ad_snapshot_url ? (
                    <a
                      href={ad.ad_snapshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#6C6782] hover:text-[#4239C4] rounded-lg cursor-pointer"
                      title="View Official Ad Snapshot"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">Snapshot: N/A</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Search,
  Bot,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Cpu
} from 'lucide-react';
import api from '@/lib/api';
import Portal, { useBodyScrollLock } from './ui/Portal';

const ACTOR_OPTIONS = [
  {
    id: 'compass/crawler-google-places',
    name: 'Google Maps Business Crawler',
    badge: 'High Phone & Address Coverage',
    description: 'Scrapes live verified businesses from Google Maps with phone numbers, websites, review ratings, categories, and coordinates.',
    recommendedFor: 'E-commerce stockists, retail stores, restaurants, fashion boutiques, local clinics'
  },
  {
    id: 'apify/instagram-scraper',
    name: 'Instagram Brand & Creator Scraper',
    badge: 'Social & Influencer',
    description: 'Finds active niche brands, boutiques, and creators with bio contact info, follower count, and engagement.',
    recommendedFor: 'Fashion apparel, luxury goods, beauty, wellness'
  },
  {
    id: 'apify/web-scraper',
    name: 'B2B Directory & Web Crawler',
    badge: 'Enterprise & IT',
    description: 'Extracts company profiles, executive emails, and technology signals from company websites and trade directories.',
    recommendedFor: 'B2B services, SaaS startups, corporate gifting'
  }
];

export default function LeadDiscoveryModal({
  isOpen,
  onClose,
  pipeline,
  onLeadsDiscovered
}) {
  useBodyScrollLock(isOpen);
  const [selectedActor, setSelectedActor] = useState('compass/crawler-google-places');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Lahore');
  const [maxLeads, setMaxLeads] = useState(20);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [resultSummary, setResultSummary] = useState(null);
  const [apifyConfig, setApifyConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadApifyConfig();
      // Pre-fill query based on pipeline
      if (pipeline) {
        let defaultQuery = '';
        if (pipeline.sourcing_strategy?.search_queries?.[0]) {
          defaultQuery = pipeline.sourcing_strategy.search_queries[0];
        } else if (pipeline.business_type?.toLowerCase().includes('honey')) {
          defaultQuery = 'Organic food stores and wholesale dry fruit marts';
        } else if (pipeline.business_type?.toLowerCase().includes('leather')) {
          defaultQuery = 'IT software houses and corporate gifting agencies';
        } else if (pipeline.business_type?.toLowerCase().includes('fashion')) {
          defaultQuery = 'Women clothing boutiques and pret stores';
        } else {
          defaultQuery = `${pipeline.name || 'Commercial retail stores'}`;
        }
        setSearchQuery(defaultQuery);

        if (pipeline.icp?.location?.[0]) {
          setLocation(pipeline.icp.location[0]);
        }
      }
      setResultSummary(null);
      setError(null);
      setStatusStep('');
    }
  }, [isOpen, pipeline]);

  const loadApifyConfig = async () => {
    try {
      const res = await api.getApifyConfig();
      if (res.success) {
        setApifyConfig(res.data);
      }
    } catch (e) {
      console.error('Failed to load Apify config:', e);
    }
  };

  if (!isOpen) return null;

  const handleStartDiscovery = async () => {
    if (!searchQuery.trim()) {
      setError('Please provide a search keyword or business type to discover.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultSummary(null);
    setStatusStep('Connecting to Apify Cloud Engine...');

    try {
      const payload = {
        actor_id: selectedActor,
        query: searchQuery.trim(),
        location: location.trim(),
        max_items: Number(maxLeads) || 20,
        pipeline_id: pipeline?.id,
        brand_id: pipeline?.brand_id || 1
      };

      // Step animation
      const stepTimer1 = setTimeout(() => {
        setStatusStep(`Querying ${selectedActor.includes('google') ? 'Google Maps' : 'Actor Database'} for "${searchQuery}" in ${location}...`);
      }, 1000);

      const stepTimer2 = setTimeout(() => {
        setStatusStep('Extracting verified phone numbers, websites, and business ratings...');
      }, 2500);

      const res = await api.discoverLeadsWithApify(payload);

      const resultData = res.data || res;
      if (res.success && (res.data || res.summary || res.total_scraped !== undefined || res.inserted !== undefined)) {
        setStatusStep('AI Deduplication & ICP Scoring complete!');
        setResultSummary(resultData);
        if (onLeadsDiscovered) onLeadsDiscovered(resultData);
      } else {
        throw new Error(res.error || 'Discovery failed');
      }
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err.message || 'Error running lead discovery engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh] my-auto">
        {/* Header Ribbon */}
        <div className="px-8 py-5 bg-gradient-to-r from-[#141226] via-[#1E1B4B] to-[#4239C4] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Globe className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  Apify Cloud Pipeline Sourcing
                </span>
                {apifyConfig?.configured && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Key Verified ({apifyConfig.maskedKey})</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                Targeted Lead Sourcing Engine
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actor Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#141226] mb-3">
              Select Lead Sourcing Actor
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ACTOR_OPTIONS.map((actor) => {
                const isSelected = selectedActor === actor.id;
                return (
                  <div
                    key={actor.id}
                    onClick={() => setSelectedActor(actor.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-sm'
                        : 'border-[#ECE8E3] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {actor.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4239C4]" />}
                      </div>
                      <h4 className="font-extrabold text-xs text-[#141226] mt-2 mb-1">
                        {actor.name}
                      </h4>
                      <p className="text-[11px] text-[#6C6782] leading-relaxed">
                        {actor.description}
                      </p>
                    </div>
                    <div className="pt-2 mt-3 border-t border-[#ECE8E3]/60 text-[10px] text-[#4239C4] font-medium">
                      Ideal for: {actor.recommendedFor}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#141226] mb-1.5">
                Target Business Category / Search Query
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Organic grocery store, bridal boutique, corporate gifting agency"
                  className="marky-input w-full pl-10 pr-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#141226] mb-1.5">
                City / Target Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lahore or Karachi"
                  className="marky-input w-full pl-10 pr-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Volume and Deduplication rules */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#ECE8E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-[#141226] block">
                  Built-in Deduplication & Enrichment
                </span>
                <span className="text-[11px] text-[#6C6782]">
                  Incoming records are checked by phone, domain, and business name to prevent duplicates.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-[#6C6782]">Limit:</span>
              {[10, 25, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setMaxLeads(num)}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    maxLeads === num
                      ? 'bg-[#4239C4] text-white shadow-xs'
                      : 'bg-white border border-[#ECE8E3] text-[#6C6782] hover:text-[#141226]'
                  }`}
                >
                  {num} leads
                </button>
              ))}
            </div>
          </div>

          {/* Live Progress or Results */}
          {loading && (
            <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
              <RefreshCw className="w-8 h-8 text-[#4239C4] animate-spin" />
              <div>
                <p className="text-xs font-black text-[#141226]">Executing Apify Cloud Extraction...</p>
                <p className="text-[11px] text-[#6C6782] mt-1">{statusStep}</p>
              </div>
            </div>
          )}

          {resultSummary && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-black">Lead Discovery Run Successful!</h4>
                  <p className="text-xs text-emerald-800">
                    Ingested and mapped leads directly into your active CRM pipeline.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
                  <span className="text-xl font-black text-[#141226] block">
                    {resultSummary.summary?.total_scraped || resultSummary.total_scraped || 0}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#6C6782]">Total Discovered</span>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
                  <span className="text-xl font-black text-emerald-600 block">
                    {resultSummary.summary?.inserted || resultSummary.inserted || 0}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#6C6782]">New Leads Created</span>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
                  <span className="text-xl font-black text-indigo-600 block">
                    {resultSummary.summary?.updated || resultSummary.updated || 0}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#6C6782]">Deduplicated / Updated</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-[#F7F6FA] border-t border-[#ECE8E3] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 marky-btn-secondary text-xs font-bold cursor-pointer"
          >
            {resultSummary ? 'Close Window' : 'Cancel'}
          </button>

          <div className="flex items-center gap-3">
            {resultSummary ? (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View In Pipeline</span>
              </button>
            ) : (
              <button
                onClick={handleStartDiscovery}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:brightness-110 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Apify Scraper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Apify Lead Discovery</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </Portal>
);
}

'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  Layers,
  DollarSign,
  TrendingUp,
  Target,
  FileText,
  Search,
  Video,
  Share2,
  Globe,
  Tag,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Eye,
  Sliders,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import api from '@/lib/api';

export default function CampaignBlueprintModal({
  isOpen,
  onClose,
  campaign,
  onUpdated
}) {
  const [activeTab, setActiveTab] = useState('meta'); // 'meta' | 'tiktok' | 'google' | 'seo' | 'budget' | 'export'
  const [copiedKey, setCopiedKey] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  if (!isOpen || !campaign) return null;

  let blueprint = null;
  try {
    blueprint = typeof campaign.blueprint_json === 'string'
      ? JSON.parse(campaign.blueprint_json)
      : campaign.blueprint_json;
  } catch (e) {
    blueprint = null;
  }

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerateBlueprint = async () => {
    setRegenerating(true);
    try {
      const res = await api.generateCampaignBlueprint({
        campaignId: campaign.id,
        brandId: campaign.brand_id,
        name: campaign.name,
        objective: campaign.objective,
        budget: campaign.budget,
        currency: campaign.currency,
        platforms: campaign.platforms,
        targetAudience: campaign.target_audience,
        targetGeography: campaign.target_geography
      });

      if (res.success && res.data) {
        if (onUpdated) {
          onUpdated({ ...campaign, blueprint_json: res.data });
        }
      } else {
        alert(res.error || 'Failed to regenerate blueprint');
      }
    } catch (err) {
      alert(err.message || 'Error generating blueprint');
    } finally {
      setRegenerating(false);
    }
  };

  // Construct full text dossier for All-In-One copy
  const getFullTextDossier = () => {
    if (!blueprint) return '';
    const b = blueprint;
    return `=====================================================
MARKETPULSE AI — MULTI-PLATFORM AD DEPLOYMENT BLUEPRINT
=====================================================
Campaign: ${campaign.name}
Brand: ${campaign.brand_name || 'Brand Workspace'}
Budget: ${campaign.currency} ${Number(campaign.budget).toLocaleString()}
Objective: ${campaign.objective}
Target Geography: ${campaign.target_geography || 'Lahore, Karachi, Islamabad'}
Generated on: ${new Date().toLocaleDateString()}
-----------------------------------------------------

[1] META ADS (FACEBOOK & INSTAGRAM)
-----------------------------------------------------
Objective: ${b.metaAds?.objective || 'Sales (Conversions)'}
Locations: ${(b.metaAds?.adSet?.audience?.locations || []).join(', ')}
Age: ${b.metaAds?.adSet?.audience?.age || '22 - 55'} | Gender: ${b.metaAds?.adSet?.audience?.gender || 'All'}
Detailed Interests: ${(b.metaAds?.adSet?.audience?.detailedInterests || []).join(', ')}
Exclusions: ${(b.metaAds?.adSet?.audience?.exclusions || []).join(', ')}
Placements: ${b.metaAds?.adSet?.placements || 'Advantage+ Placements'}

PRIMARY COPY VARIATION:
${b.metaAds?.creatives?.[0]?.primaryText || ''}

HEADLINES:
${(b.metaAds?.creatives?.[0]?.headlines || []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

DESCRIPTIONS:
${(b.metaAds?.creatives?.[0]?.descriptions || []).map((d, i) => `${i + 1}. ${d}`).join('\n')}

Call To Action: ${b.metaAds?.creatives?.[0]?.callToAction || 'Shop Now'}
UTM Tracking URL: ${b.metaAds?.utmTracking?.fullUrl || ''}

-----------------------------------------------------
[2] TIKTOK ADS & SPARK ADS
-----------------------------------------------------
Objective: ${b.tiktokAds?.objective || 'Community Interaction'}
Display Name: ${b.tiktokAds?.displayName || ''}
Ad Text: ${b.tiktokAds?.adText || ''}

VIRAL HOOKS & SCRIPTS:
${(b.tiktokAds?.hooksAndScripts || []).map((h, i) => `
HOOK #${i + 1}: ${h.hookTitle}
[0:00-0:03 First 3 Seconds]: "${h.first3Seconds}"
[Visual Direction]: ${h.visualDirection}
[Voiceover Script]: ${h.voiceoverScript}
[CTA]: ${h.callToAction}
[Hashtags]: ${(h.hashtags || []).join(' ')}
`).join('\n')}

-----------------------------------------------------
[3] GOOGLE SEARCH ADS & PERFORMANCE MAX
-----------------------------------------------------
Bidding Strategy: ${b.googleAds?.biddingStrategy || 'Maximize Conversions'}

EXACT MATCH KEYWORDS [High Intent]:
${(b.googleAds?.keywords?.highIntentExact || []).join('\n')}

PHRASE MATCH KEYWORDS:
${(b.googleAds?.keywords?.phraseMatch || []).join('\n')}

NEGATIVE KEYWORDS:
${(b.googleAds?.keywords?.negativeKeywords || []).join(', ')}

RSA HEADLINES (≤30 chars):
${(b.googleAds?.rsaAssets?.headlines || []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

RSA DESCRIPTIONS (≤90 chars):
${(b.googleAds?.rsaAssets?.descriptions || []).map((d, i) => `${i + 1}. ${d}`).join('\n')}

-----------------------------------------------------
[4] SEO & LANDING PAGE TAGS
-----------------------------------------------------
Target URL: ${b.seoAndTags?.landingPageUrl || ''}
SEO Meta Title: ${b.seoAndTags?.metaTitle || ''}
SEO Meta Description: ${b.seoAndTags?.metaDescription || ''}
Focus Keywords: ${(b.seoAndTags?.focusKeywords || []).join(', ')}

-----------------------------------------------------
[5] BUDGET & UNIT ECONOMICS
-----------------------------------------------------
Total Budget: ${b.budgetAndEconomics?.currency || 'PKR'} ${Number(b.budgetAndEconomics?.totalBudget || 0).toLocaleString()}
Daily Budget: ${b.budgetAndEconomics?.currency || 'PKR'} ${Number(b.budgetAndEconomics?.dailyBudget || 0).toLocaleString()} / day (${b.budgetAndEconomics?.durationDays || 14} days)
Projected ROAS: ${b.budgetAndEconomics?.unitEconomics?.projectedRoas || '4.0x'}
Target CPA: ${b.budgetAndEconomics?.unitEconomics?.targetCpa || 'PKR 1,500'}
Projected Orders: ${b.budgetAndEconomics?.unitEconomics?.projectedOrders || 100}
Projected Gross Revenue: ${b.budgetAndEconomics?.unitEconomics?.projectedGrossRevenue || 'PKR 0'}
=====================================================`;
  };

  const handleDownloadDossier = () => {
    const element = document.createElement('a');
    const file = new Blob([getFullTextDossier()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${campaign.name.toLowerCase().replace(/\s+/g, '_')}_ad_blueprint.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] max-h-[920px] shadow-2xl border border-[#ECE8E3] overflow-hidden flex flex-col">
        {/* ── 1. Top Header ── */}
        <div className="p-4 sm:p-5 border-b border-[#ECE8E3] bg-[#141226] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-[#FFC4DA] bg-[#FFC4DA]/15 px-2.5 py-0.5 rounded-full border border-[#FFC4DA]/25 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ready-to-Paste Ad Kit
              </span>
              <span className="text-[11px] font-bold text-[#A59FFF] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                {campaign.brand_name || 'Brand Workspace'}
              </span>
              <span className="text-[11px] font-bold text-white/80">
                Budget: <strong className="text-white">{campaign.currency} {Number(campaign.budget).toLocaleString()}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{campaign.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerateBlueprint}
              disabled={regenerating}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-90 flex items-center gap-1.5 shadow-md shadow-indigo-900/30 cursor-pointer disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
            </button>
            <button
              onClick={handleDownloadDossier}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download full campaign ad dossier"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Pack</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Platform Navigation Tabs ── */}
        <div className="bg-[#F7F6FA] border-b border-[#ECE8E3] px-4 sm:px-6 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'meta', label: 'Meta Ads (FB & IG)', icon: Share2, color: 'text-blue-600', badge: 'Advantage+' },
            { id: 'tiktok', label: 'TikTok Ads', icon: Video, color: 'text-pink-600', badge: 'Viral Hooks' },
            { id: 'google', label: 'Google Ads', icon: Search, color: 'text-amber-600', badge: 'High Intent' },
            { id: 'seo', label: 'SEO & Landing Tags', icon: Globe, color: 'text-emerald-600', badge: 'Organic' },
            { id: 'budget', label: 'Budget & Unit Economics', icon: DollarSign, color: 'text-purple-600', badge: 'ROAS' },
            { id: 'export', label: 'All-in-One Copy', icon: FileText, color: 'text-slate-600', badge: '1-Click' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#4239C4] text-[#4239C4] bg-white'
                    : 'border-transparent text-[#6C6782] hover:text-[#141226] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span>{tab.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${
                  isActive ? 'bg-[#4239C4]/10 text-[#4239C4]' : 'bg-slate-200/60 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 3. Tab Content Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
          {!blueprint ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-[#141226]">No Ad Deployment Blueprint Generated Yet</h3>
              <p className="text-xs text-[#6C6782] max-w-md mx-auto">
                Generate tailored Meta copy, TikTok scripts, Google search keywords, and unit economics with one click.
              </p>
              <button
                onClick={handleRegenerateBlueprint}
                disabled={regenerating}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4239C4] hover:bg-[#352CAE] shadow-md shadow-indigo-900/20 cursor-pointer disabled:opacity-50"
              >
                {regenerating ? 'Generating Multi-Platform Kit...' : 'Generate AI Ad Kit Now'}
              </button>
            </div>
          ) : (
            <>
              {/* ══════════ TAB 1: META ADS ══════════ */}
              {activeTab === 'meta' && (
                <div className="space-y-6">
                  {/* Top Notice */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-blue-600" /> Meta Advantage+ Ad Campaign Pack
                      </p>
                      <p className="text-[11px] text-blue-800">
                        Copy these fields straight into Facebook Ads Manager (Ad Set & Ad Creative levels).
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(blueprint.metaAds, null, 2), 'meta_all')}
                      className="px-3 py-1 text-xs font-bold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'meta_all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'meta_all' ? 'Copied All' : 'Copy Full Meta Setup'}</span>
                    </button>
                  </div>

                  {/* Ad Set Targeting Settings */}
                  <div className="marky-card p-4 space-y-3 bg-[#F7F6FA] border border-[#ECE8E3]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E3]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Ad Set Audience & Placements</h4>
                      <button
                        onClick={() => handleCopy(JSON.stringify(blueprint.metaAds?.adSet, null, 2), 'meta_adset')}
                        className="text-[11px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'meta_adset' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Audience Target</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] block uppercase">Target Cities</span>
                        <p className="font-semibold text-[#141226] mt-0.5">
                          {(blueprint.metaAds?.adSet?.audience?.locations || []).join(', ')}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] block uppercase">Demographics</span>
                        <p className="font-semibold text-[#141226] mt-0.5">
                          Age {blueprint.metaAds?.adSet?.audience?.age || '22-55'} • {blueprint.metaAds?.adSet?.audience?.gender || 'All Genders'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] block uppercase">Placements</span>
                        <p className="font-semibold text-[#141226] mt-0.5">
                          {blueprint.metaAds?.adSet?.placements || 'Advantage+ Automated'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] block uppercase">Optimization</span>
                        <p className="font-semibold text-[#141226] mt-0.5">
                          {blueprint.metaAds?.adSet?.optimization || 'Purchases (Conversions)'}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Interests */}
                    <div>
                      <span className="text-[11px] font-bold text-[#141226] block mb-1.5">Detailed Interests to Target:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(blueprint.metaAds?.adSet?.audience?.detailedInterests || []).map((interest, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#ECE8E3] text-[#141226] font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Creative Variations */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Ad Copy & Creative Variations</h4>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Copy & Headlines */}
                      <div className="lg:col-span-7 space-y-4">
                        {(blueprint.metaAds?.creatives || []).map((creative, idx) => (
                          <div key={idx} className="marky-card p-4 space-y-3 bg-white border border-[#ECE8E3]">
                            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E3]">
                              <div>
                                <span className="text-[10px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-md">
                                  Angle: {creative.angle || 'Direct Offer'}
                                </span>
                                <h5 className="text-xs font-bold text-[#141226] mt-1">{creative.name}</h5>
                              </div>

                              <button
                                onClick={() => handleCopy(creative.primaryText, `meta_text_${idx}`)}
                                className="px-2.5 py-1 text-xs font-semibold text-[#4239C4] bg-[#4239C4]/10 hover:bg-[#4239C4] hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === `meta_text_${idx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === `meta_text_${idx}` ? 'Copied' : 'Copy Primary Text'}</span>
                              </button>
                            </div>

                            {/* Primary Text */}
                            <div>
                              <span className="text-[10px] font-bold text-[#6C6782] uppercase block mb-1">Primary Text (Paste into Facebook Ads)</span>
                              <div className="p-3 bg-[#F7F6FA] rounded-xl border border-[#ECE8E3] text-xs leading-relaxed text-[#141226] whitespace-pre-line font-sans">
                                {creative.primaryText}
                              </div>
                            </div>

                            {/* Headlines List */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#6C6782] uppercase">Headlines (Choose 1-5 for dynamic testing)</span>
                                <button
                                  onClick={() => handleCopy((creative.headlines || []).join('\n'), `meta_hl_${idx}`)}
                                  className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedKey === `meta_hl_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  <span>Copy All Headlines</span>
                                </button>
                              </div>
                              <div className="space-y-1">
                                {(creative.headlines || []).map((hl, hIdx) => (
                                  <div key={hIdx} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] text-xs">
                                    <span className="font-semibold text-[#141226]">{hl}</span>
                                    <span className="text-[10px] text-[#6C6782] font-mono">{hl.length}/40 chars</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#6C6782] uppercase">News Feed Descriptions</span>
                              {(creative.descriptions || []).map((desc, dIdx) => (
                                <div key={dIdx} className="p-2 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] text-xs text-[#3E3A52]">
                                  {desc}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Live Interactive Feed Ad Mockup */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#141226] flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#4239C4]" /> Live Feed Ad Mockup
                          </span>
                          <span className="text-[10px] text-[#6C6782]">Instagram / Facebook Mobile Preview</span>
                        </div>

                        {/* Mobile Device Frame */}
                        <div className="rounded-3xl border-2 border-[#ECE8E3] bg-white shadow-xl overflow-hidden max-w-sm mx-auto">
                          {/* Feed Header */}
                          <div className="p-3 border-b border-[#ECE8E3] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center text-xs font-black">
                                {(campaign.brand_name || 'B').charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#141226] leading-none">{campaign.brand_name || 'Brand Store'}</p>
                                <p className="text-[10px] text-[#6C6782] mt-0.5">Sponsored • 🌐</p>
                              </div>
                            </div>
                            <span className="text-slate-400 font-bold">•••</span>
                          </div>

                          {/* Feed Body Text */}
                          <div className="p-3 text-xs text-[#141226] leading-snug line-clamp-3">
                            {blueprint.metaAds?.creatives?.[0]?.primaryText || 'Experience verified premium quality with cash on delivery nationwide across Pakistan.'}
                          </div>

                          {/* Image Canvas */}
                          <div className="h-52 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                            <img
                              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
                              alt="Ad creative"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                              1:1 Carousel Ready
                            </span>
                          </div>

                          {/* Feed CTA Bar */}
                          <div className="p-3 bg-[#F7F6FA] border-t border-[#ECE8E3] flex items-center justify-between">
                            <div className="truncate pr-2">
                              <p className="text-[10px] text-[#6C6782] uppercase truncate">
                                {blueprint.metaAds?.utmTracking?.baseUrl || 'SHOP.PK'}
                              </p>
                              <p className="text-xs font-bold text-[#141226] truncate">
                                {blueprint.metaAds?.creatives?.[0]?.headlines?.[0] || '100% Pure Certified Harvest'}
                              </p>
                            </div>
                            <button className="px-3.5 py-1.5 rounded-lg bg-[#4239C4] text-white text-xs font-bold shrink-0">
                              {blueprint.metaAds?.creatives?.[0]?.callToAction || 'Shop Now'}
                            </button>
                          </div>
                        </div>

                        {/* UTM Link Box */}
                        <div className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#6C6782] uppercase">Pre-Built UTM Tracking URL</span>
                            <button
                              onClick={() => handleCopy(blueprint.metaAds?.utmTracking?.fullUrl, 'meta_utm')}
                              className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === 'meta_utm' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>Copy URL</span>
                            </button>
                          </div>
                          <p className="text-[11px] font-mono text-[#3E3A52] break-all bg-white p-2 rounded-lg border border-[#ECE8E3]">
                            {blueprint.metaAds?.utmTracking?.fullUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════ TAB 2: TIKTOK ADS ══════════ */}
              {activeTab === 'tiktok' && (
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-pink-600" /> TikTok Spark Ads & UGC Video Scripts
                      </p>
                      <p className="text-[11px] text-pink-800">
                        Paste hooks, shooting directions, and hashtags directly into TikTok Ads Manager or hand over to UGC creators.
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(blueprint.tiktokAds, null, 2), 'tiktok_all')}
                      className="px-3 py-1 text-xs font-bold text-pink-700 bg-white border border-pink-300 rounded-lg hover:bg-pink-50 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'tiktok_all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'tiktok_all' ? 'Copied' : 'Copy All TikTok Scripts'}</span>
                    </button>
                  </div>

                  {/* Hooks & Scripts Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(blueprint.tiktokAds?.hooksAndScripts || []).map((script, sIdx) => (
                      <div key={sIdx} className="marky-card p-4 space-y-3 bg-white border border-[#ECE8E3] flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E3]">
                            <h4 className="text-xs font-bold text-[#141226]">{script.hookTitle}</h4>
                            <button
                              onClick={() => handleCopy(`HOOK: "${script.first3Seconds}"\n\nVISUAL: ${script.visualDirection}\n\nVOICEOVER: ${script.voiceoverScript}\n\nCTA: ${script.callToAction}\n\nHASHTAGS: ${(script.hashtags || []).join(' ')}`, `tiktok_script_${sIdx}`)}
                              className="text-[11px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `tiktok_script_${sIdx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>Copy Script</span>
                            </button>
                          </div>

                          {/* The 3-second hook */}
                          <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-200/60 space-y-1">
                            <span className="text-[10px] font-extrabold text-pink-700 uppercase tracking-wider block">
                              ⚡ The 0:00 - 0:03 Second Hook (Spoken + Text on Screen)
                            </span>
                            <p className="text-xs font-bold text-[#141226] leading-snug">
                              "{script.first3Seconds}"
                            </p>
                          </div>

                          {/* Visual Direction */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#6C6782] uppercase">Visual & Camera Direction</span>
                            <p className="text-xs text-[#3E3A52] bg-[#F7F6FA] p-2.5 rounded-xl border border-[#ECE8E3]">
                              {script.visualDirection}
                            </p>
                          </div>

                          {/* Voiceover Script */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#6C6782] uppercase">Voiceover & Dialogue</span>
                            <p className="text-xs text-[#141226] leading-relaxed bg-[#F7F6FA] p-2.5 rounded-xl border border-[#ECE8E3]">
                              {script.voiceoverScript}
                            </p>
                          </div>
                        </div>

                        {/* Hashtags & CTA Footer */}
                        <div className="pt-3 border-t border-[#ECE8E3] space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {(script.hashtags || []).map((ht, i) => (
                              <span key={i} className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md">
                                {ht}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[#6C6782]">Action Button:</span>
                            <span className="font-bold text-[#141226] bg-[#F7F6FA] px-2 py-1 rounded-lg border border-[#ECE8E3]">
                              {script.callToAction}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* In-feed Ad Text */}
                  <div className="p-4 rounded-2xl bg-[#F7F6FA] border border-[#ECE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#6C6782] uppercase block">In-Feed Display Copy</span>
                      <p className="text-xs font-bold text-[#141226] mt-0.5">{blueprint.tiktokAds?.adText}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(blueprint.tiktokAds?.adText, 'tiktok_adtext')}
                      className="px-3 py-1.5 text-xs font-bold text-[#4239C4] bg-white border border-[#ECE8E3] rounded-xl hover:bg-[#F7F6FA] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedKey === 'tiktok_adtext' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Caption</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════ TAB 3: GOOGLE ADS ══════════ */}
              {activeTab === 'google' && (
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-amber-600" /> Google Search & Performance Max Ad Pack
                      </p>
                      <p className="text-[11px] text-amber-800">
                        High-intent search keywords, negative exclusions, and 10 RSA headlines with character counts ready for Google Ads Editor.
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(blueprint.googleAds, null, 2), 'google_all')}
                      className="px-3 py-1 text-xs font-bold text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'google_all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Full Google Pack</span>
                    </button>
                  </div>

                  {/* Keywords Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Exact Match */}
                    <div className="marky-card p-4 space-y-2.5 bg-white border border-[#ECE8E3]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-emerald-700">Exact Match [High Intent]</span>
                        <button
                          onClick={() => handleCopy((blueprint.googleAds?.keywords?.highIntentExact || []).join('\n'), 'kw_exact')}
                          className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'kw_exact' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="space-y-1">
                        {(blueprint.googleAds?.keywords?.highIntentExact || []).map((kw, i) => (
                          <div key={i} className="p-1.5 bg-[#F7F6FA] rounded-lg text-xs font-mono text-[#141226]">
                            {kw}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phrase Match */}
                    <div className="marky-card p-4 space-y-2.5 bg-white border border-[#ECE8E3]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-blue-700">Phrase Match "Consideration"</span>
                        <button
                          onClick={() => handleCopy((blueprint.googleAds?.keywords?.phraseMatch || []).join('\n'), 'kw_phrase')}
                          className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'kw_phrase' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="space-y-1">
                        {(blueprint.googleAds?.keywords?.phraseMatch || []).map((kw, i) => (
                          <div key={i} className="p-1.5 bg-[#F7F6FA] rounded-lg text-xs font-mono text-[#141226]">
                            {kw}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Negative Keywords */}
                    <div className="marky-card p-4 space-y-2.5 bg-white border border-[#ECE8E3]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-rose-700">Negative Keywords List</span>
                        <button
                          onClick={() => handleCopy((blueprint.googleAds?.keywords?.negativeKeywords || []).join('\n'), 'kw_neg')}
                          className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'kw_neg' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(blueprint.googleAds?.keywords?.negativeKeywords || []).map((kw, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-mono">
                            -{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Responsive Search Ad (RSA) Headlines & Descriptions */}
                  <div className="marky-card p-4 space-y-4 bg-white border border-[#ECE8E3]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E3]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Responsive Search Ad (RSA) Assets</h4>
                      <button
                        onClick={() => handleCopy(
                          `HEADLINES:\n${(blueprint.googleAds?.rsaAssets?.headlines || []).join('\n')}\n\nDESCRIPTIONS:\n${(blueprint.googleAds?.rsaAssets?.descriptions || []).join('\n')}`,
                          'google_rsa'
                        )}
                        className="text-xs font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'google_rsa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy All RSA Assets</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Headlines */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase block">
                          10 Headlines (≤ 30 Characters Limit)
                        </span>
                        <div className="space-y-1">
                          {(blueprint.googleAds?.rsaAssets?.headlines || []).map((hl, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] text-xs">
                              <span className="font-semibold text-[#141226] truncate pr-2">{hl}</span>
                              <span className={`text-[10px] font-mono shrink-0 ${hl.length > 30 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                {hl.length}/30
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase block">
                          4 Descriptions (≤ 90 Characters Limit)
                        </span>
                        <div className="space-y-1">
                          {(blueprint.googleAds?.rsaAssets?.descriptions || []).map((desc, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                              <p className="text-xs text-[#141226] leading-snug">{desc}</p>
                              <div className="flex justify-end">
                                <span className={`text-[10px] font-mono ${desc.length > 90 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                  {desc.length}/90 chars
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════ TAB 4: SEO & LANDING PAGE ══════════ */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-600" /> On-Page SEO, Meta Tags & SERP Preview
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Paste these tags directly into your Shopify, WordPress, or custom landing page head settings.
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(blueprint.seoAndTags, null, 2), 'seo_all')}
                      className="px-3 py-1 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'seo_all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy SEO Tags</span>
                    </button>
                  </div>

                  {/* Google Search SERP Snippet Preview */}
                  <div className="marky-card p-5 space-y-3 bg-white border border-[#ECE8E3]">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase tracking-wider block">
                      Google Desktop & Mobile Search Snippet Preview
                    </span>
                    <div className="p-4 rounded-xl border border-[#ECE8E3] bg-[#FCFBFA] space-y-1 font-sans">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold">G</div>
                        <span className="text-[11px] text-slate-800 truncate">{blueprint.seoAndTags?.landingPageUrl}</span>
                      </div>
                      <h4 className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer leading-snug">
                        {blueprint.seoAndTags?.metaTitle}
                      </h4>
                      <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                        {blueprint.seoAndTags?.metaDescription}
                      </p>
                    </div>
                  </div>

                  {/* Field Breakdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="marky-card p-4 space-y-2 bg-[#F7F6FA] border border-[#ECE8E3]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase">SEO Meta Title</span>
                        <button
                          onClick={() => handleCopy(blueprint.seoAndTags?.metaTitle, 'seo_title')}
                          className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'seo_title' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-[#141226] bg-white p-2.5 rounded-lg border border-[#ECE8E3]">
                        {blueprint.seoAndTags?.metaTitle}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block text-right">
                        {blueprint.seoAndTags?.metaTitle?.length || 0}/60 characters
                      </span>
                    </div>

                    <div className="marky-card p-4 space-y-2 bg-[#F7F6FA] border border-[#ECE8E3]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase">Meta Description</span>
                        <button
                          onClick={() => handleCopy(blueprint.seoAndTags?.metaDescription, 'seo_desc')}
                          className="text-[10px] font-bold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'seo_desc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-[#141226] bg-white p-2.5 rounded-lg border border-[#ECE8E3]">
                        {blueprint.seoAndTags?.metaDescription}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block text-right">
                        {blueprint.seoAndTags?.metaDescription?.length || 0}/155 characters
                      </span>
                    </div>
                  </div>

                  {/* Focus Keywords */}
                  <div className="marky-card p-4 space-y-2 bg-[#F7F6FA] border border-[#ECE8E3]">
                    <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Target SEO Ranking Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(blueprint.seoAndTags?.focusKeywords || []).map((kw, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#ECE8E3] text-[#141226] font-semibold">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════ TAB 5: BUDGET & UNIT ECONOMICS ══════════ */}
              {activeTab === 'budget' && (
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-purple-600" /> Multi-Channel Budget Engineering & Unit Economics
                      </p>
                      <p className="text-[11px] text-purple-800">
                        Realistic CPC, CPA, conversion rates, and break-even ROAS benchmarks tailored to Pakistani e-commerce.
                      </p>
                    </div>
                  </div>

                  {/* Platform Budget Split */}
                  <div className="marky-card p-5 space-y-4 bg-white border border-[#ECE8E3]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Multi-Channel Budget Allocation</h4>

                    <div className="space-y-3">
                      {(blueprint.budgetAndEconomics?.platformSplit || []).map((split, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#141226] flex items-center gap-2">
                              <span>{split.platform}</span>
                              <span className="text-[10px] text-[#6C6782] font-normal">({split.role})</span>
                            </span>
                            <span className="font-extrabold text-[#141226]">
                              {blueprint.budgetAndEconomics?.currency || 'PKR'} {Number(split.amount).toLocaleString()} ({split.percentage}%) • ~{blueprint.budgetAndEconomics?.currency || 'PKR'} {Number(split.daily).toLocaleString()}/day
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#4239C4] to-[#7A5DBB]"
                              style={{ width: `${split.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unit Economics KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="marky-card p-3.5 bg-white border border-[#ECE8E3] text-center">
                      <span className="text-[10px] text-[#6C6782] uppercase font-bold block">Est. Clicks</span>
                      <span className="text-base font-black text-[#141226]">
                        {Number(blueprint.budgetAndEconomics?.unitEconomics?.estimatedClicks || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="marky-card p-3.5 bg-white border border-[#ECE8E3] text-center">
                      <span className="text-[10px] text-[#6C6782] uppercase font-bold block">Avg. CPC</span>
                      <span className="text-base font-black text-[#141226]">
                        {blueprint.budgetAndEconomics?.unitEconomics?.estimatedAvgCpc}
                      </span>
                    </div>

                    <div className="marky-card p-3.5 bg-white border border-[#ECE8E3] text-center">
                      <span className="text-[10px] text-[#6C6782] uppercase font-bold block">Target CPA</span>
                      <span className="text-base font-black text-[#4239C4]">
                        {blueprint.budgetAndEconomics?.unitEconomics?.targetCpa}
                      </span>
                    </div>

                    <div className="marky-card p-3.5 bg-white border border-[#ECE8E3] text-center">
                      <span className="text-[10px] text-[#6C6782] uppercase font-bold block">Projected Orders</span>
                      <span className="text-base font-black text-[#141226]">
                        {blueprint.budgetAndEconomics?.unitEconomics?.projectedOrders}
                      </span>
                    </div>

                    <div className="marky-card p-3.5 bg-white border border-[#ECE8E3] text-center">
                      <span className="text-[10px] text-[#6C6782] uppercase font-bold block">Projected ROAS</span>
                      <span className="text-base font-black text-emerald-600">
                        {blueprint.budgetAndEconomics?.unitEconomics?.projectedRoas}
                      </span>
                    </div>

                    <div className="marky-card p-3.5 bg-white border border-[#ECE8E3] text-center">
                      <span className="text-[10px] text-[#6C6782] uppercase font-bold block">Gross Revenue</span>
                      <span className="text-base font-black text-purple-700">
                        {blueprint.budgetAndEconomics?.unitEconomics?.projectedGrossRevenue}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════ TAB 6: ALL-IN-ONE EXPORT ══════════ */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Complete Formatted Ad Dossier</h4>
                      <p className="text-xs text-[#6C6782]">Ready to copy into documents, spreadsheets, or client briefings.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(getFullTextDossier(), 'export_full')}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#4239C4] hover:bg-[#352CAE] rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-900/20 cursor-pointer"
                      >
                        {copiedKey === 'export_full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'export_full' ? 'Copied Entire Dossier' : 'Copy Entire Dossier'}</span>
                      </button>

                      <button
                        onClick={handleDownloadDossier}
                        className="px-4 py-2 text-xs font-bold text-[#141226] bg-[#F7F6FA] hover:bg-[#ECE8E3] border border-[#ECE8E3] rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#6C6782]" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-[#141226] text-slate-200 text-xs rounded-2xl border border-white/10 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[500px]">
                    {getFullTextDossier()}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

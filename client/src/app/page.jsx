'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  BarChart3,
  Users,
  Search,
  Globe,
  Lock,
  ChevronRight,
  CheckCircle2,
  Palette,
  Briefcase,
  Play,
  Terminal,
  Activity,
  Award
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('strategy');

  const showcaseTabs = [
    {
      id: 'strategy',
      label: 'CMO Strategy Engine',
      icon: Briefcase,
      badge: 'Autonomous AI',
      headline: 'Enterprise-grade Marketing Roadmaps in Seconds',
      description:
        'Analyzes brand voice, target audience demographics, and Pakistani/global unit economics to output structured multi-channel acquisition roadmaps.',
      highlights: [
        'Deterministic customer persona synthesis',
        'Channel budget allocation (Meta vs. TikTok vs. Google)',
        'Cash-on-Delivery (COD) return reduction tactics'
      ],
      previewTag: 'Strategy Output Dossier',
      codeSnippet: {
        channel: 'Meta Advantage+ & TikTok Spark',
        targetRoas: '4.2x Target Return',
        projectedCpa: 'PKR 850 / Conversion',
        tactics: ['High-intent UGC hooks', 'WhatsApp re-engagement automation']
      }
    },
    {
      id: 'campaigns',
      label: 'Multi-Platform Ad Blueprints',
      icon: Layers,
      badge: 'Instant Deployment',
      headline: '1-Click Copy-Paste Ad Generation for Meta, TikTok & Google',
      description:
        'Generates ready-to-run Meta primary texts, high-converting TikTok UGC scripts, and high-intent Google Search keyword ad groups.',
      highlights: [
        'AIDA & PAS psychological copywriting frameworks',
        'Direct copy-paste payloads for Meta Ads Manager',
        'Negative search keyword lists to eliminate ad waste'
      ],
      previewTag: 'Ad Deployment Blueprint',
      codeSnippet: {
        campaignName: 'Ramadan Flash Sale Blitz',
        hook: '"Tired of slow delivery? Get 100% pure organic honey delivered in 48h."',
        cta: 'Shop Bundle (Free Nationwide Delivery)',
        formats: ['Reels 9:16 Video Script', 'Carousel 1:1 Showcase']
      }
    },
    {
      id: 'creative',
      label: 'Creative Studio & Vault',
      icon: Palette,
      badge: 'AI Generative',
      headline: 'On-Brand Commercial Visuals & Video Ad Vault',
      description:
        'Connected with high-performance image and video generation engines to render studio-grade commercial product photography without costly agency retainers.',
      highlights: [
        'Eden AI, Stability AI & DALL-E provider integration',
        'Custom aspect ratio formatting (1:1, 9:16, 16:9)',
        'Centralized Brand Asset Vault with instant download'
      ],
      previewTag: 'Creative Engine',
      codeSnippet: {
        model: 'Commercial Studio Photographic V2',
        resolution: '1024x1024 (Lossless WebP)',
        lighting: 'Soft studio commercial rim light',
        status: 'Rendered & Saved to Vault'
      }
    },
    {
      id: 'crm',
      label: 'CRM & Lead Pipeline',
      icon: Users,
      badge: 'Real-Time Pipeline',
      headline: 'Autonomous Lead Scoring & WhatsApp Conversion Flow',
      description:
        'Track leads from cold prospect to qualified customer. Automatically computes dynamic lead scores based on interaction velocity and intent signals.',
      highlights: [
        'Multi-stage visual pipeline Kanban',
        'Dynamic numeric lead scoring (1-100)',
        'One-click WhatsApp direct conversation initiation'
      ],
      previewTag: 'CRM Intelligence',
      codeSnippet: {
        lead: 'Dr. Zeeshan (Aesthetic Clinic)',
        score: '92/100 (Hot Prospect)',
        stage: 'Proposal Sent',
        action: 'WhatsApp follow-up scheduled for 4:00 PM'
      }
    },
    {
      id: 'scrapers',
      label: 'Competitor & Map Scrapers',
      icon: Search,
      badge: 'Live Discovery',
      headline: 'Real-Time Market Spy & B2B Lead Extraction',
      description:
        'Extract high-intent local B2B business leads from Google Maps and monitor competitor marketing shifts, pricing changes, and ad creatives in real-time.',
      highlights: [
        'Live Google Maps business extraction (Name, Phone, Rating, Address)',
        'Competitor price drop & promotion change detection',
        'Export verified lead contacts directly into CRM pipeline'
      ],
      previewTag: 'Live Scraper Feed',
      codeSnippet: {
        searchQuery: 'Bridal Boutiques in Lahore',
        resultsExtracted: '124 Verified Businesses',
        phoneNumbersFound: '118 Direct Contact Numbers',
        exportDestination: 'CRM High-Intent Pipeline'
      }
    }
  ];

  const currentTab = showcaseTabs.find((t) => t.id === activeTab) || showcaseTabs[0];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-gradient-to-tr from-[#4239C4]/25 via-[#7A5DBB]/20 to-[#D97FA5]/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181438] border border-[#7A5DBB]/30 text-xs font-semibold text-[#D1C3FF] shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#A59FFF] animate-pulse" />
            <span>Markey 2.0 &middot; Autonomous Marketing Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            AI-Powered Marketing.{' '}
            <span className="bg-gradient-to-r from-[#D1C3FF] via-[#F3C5A8] to-[#FFC4DA] bg-clip-text text-transparent">
              One Intelligent Platform.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-[#B4AFCC] max-w-2xl mx-auto font-normal leading-relaxed">
            Create strategies. Generate high-converting campaigns. Render studio creatives. Analyze competitors. Manage leads. Scale your entire marketing workflow with autonomous AI agents.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-[#4239C4]/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#14112E] hover:bg-[#1D1845] text-white font-semibold text-sm border border-[#2B2359] transition-all"
            >
              <span>Explore Platform</span>
              <ChevronRight className="w-4 h-4 text-[#8E8AAB]" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8E8AAB]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>97+ Autonomous AI Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Enterprise Encryption</span>
            </div>
          </div>
        </div>

        {/* ── HERO VISUAL / PRODUCT PREVIEW (#6) ── */}
        <div className="relative mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-[#2B2359]/60 to-[#120E2E]/40 border border-[#3D337A]/50 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl bg-[#0F0C26] border border-[#231C4D] overflow-hidden">
              {/* Fake Window Header */}
              <div className="px-4 py-3 bg-[#0A081C] border-b border-[#1C1838] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-[#8E8AAB] ml-2 hidden sm:inline">
                    marky.ai/app &middot; Live Workspace Command Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-bold uppercase">
                    Interactive Product Preview
                  </span>
                </div>
              </div>

              {/* Dashboard Preview Visual */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-5 rounded-2xl bg-[#141033] border border-[#282057] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#8E8AAB]">
                    <span className="font-semibold uppercase tracking-wider">Active Workspace</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-white">Ali Rehan Organics</h3>
                  <p className="text-xs text-[#A59FFF] font-mono">12 Autonomous AI Agents Active</p>
                  <div className="h-1.5 w-full bg-[#201A4B] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4239C4] to-[#D97FA5] w-3/4" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#141033] border border-[#282057] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8E8AAB]">
                    <span className="font-semibold uppercase tracking-wider">Ad Blueprints Generated</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">42 Kits</div>
                  <p className="text-xs text-emerald-400 font-semibold">+18.4% conversion efficiency</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141033] border border-[#282057] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8E8AAB]">
                    <span className="font-semibold uppercase tracking-wider">CRM Pipeline Value</span>
                    <Users className="w-4 h-4 text-[#A59FFF]" />
                  </div>
                  <div className="text-2xl font-black text-white">PKR 1.48M</div>
                  <p className="text-xs text-[#8E8AAB]">128 leads actively nurtured</p>
                </div>

                {/* Simulated Campaign Matrix Bar */}
                <div className="md:col-span-3 p-5 rounded-2xl bg-[#130F30] border border-[#261E52] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Cpu className="w-4 h-4 text-[#A59FFF]" />
                      <span>Live Autonomous Marketing Workforce</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8E8AAB]">All Channels Synchronized</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#0D0A24] border border-[#1E1742]">
                      <p className="text-[#8E8AAB] text-[10px] uppercase font-bold">Meta Strategy</p>
                      <p className="text-white font-semibold mt-1">Advantage+ Scaling</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0D0A24] border border-[#1E1742]">
                      <p className="text-[#8E8AAB] text-[10px] uppercase font-bold">TikTok Creator Hook</p>
                      <p className="text-white font-semibold mt-1">15s Unboxing Script</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0D0A24] border border-[#1E1742]">
                      <p className="text-[#8E8AAB] text-[10px] uppercase font-bold">Google PMax</p>
                      <p className="text-white font-semibold mt-1">High-Intent Keywords</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0D0A24] border border-[#1E1742]">
                      <p className="text-[#8E8AAB] text-[10px] uppercase font-bold">Competitor Radar</p>
                      <p className="text-emerald-400 font-semibold mt-1">Under-Pricing Alert</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PRODUCT SHOWCASE / INTERACTIVE DEMO (#10) ── */}
      <section id="showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A59FFF]">
            Commercial Operating Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            See Marky In Action
          </h2>
          <p className="text-sm sm:text-base text-[#B4AFCC]">
            Explore the specialized modules engineered to replace disjointed agency tools with a single autonomous command center.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {showcaseTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white shadow-lg shadow-[#4239C4]/30'
                    : 'bg-[#14112E] hover:bg-[#1D1845] text-[#8E8AAB] hover:text-white border border-[#231C4D]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0F0C29] border border-[#261E52] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4239C4]/20 border border-[#7A5DBB]/30 text-xs font-bold text-[#D1C3FF]">
                <span>{currentTab.badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {currentTab.headline}
              </h3>
              <p className="text-sm text-[#B4AFCC] leading-relaxed">
                {currentTab.description}
              </p>
              <ul className="space-y-3 text-xs">
                {currentTab.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#D1C3FF]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#F3C5A8] hover:text-white transition-colors"
                >
                  <span>Launch this tool in your workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Code / Output Preview */}
            <div className="rounded-2xl bg-[#09071A] border border-[#1E1742] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C163D] text-xs">
                <div className="flex items-center gap-2 text-[#A59FFF] font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{currentTab.previewTag}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-mono">
                  READY
                </span>
              </div>
              <pre className="text-xs font-mono text-[#D1C3FF] overflow-x-auto p-4 rounded-xl bg-[#050410] border border-[#171233] leading-relaxed">
                {JSON.stringify(currentTab.codeSnippet, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES SECTION (#7) ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A59FFF]">
            End-to-End Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for Modern Growth Teams
          </h2>
          <p className="text-sm sm:text-base text-[#B4AFCC]">
            Every feature in Marky is directly connected to your workspace database and real-time scrapers. No filler, no fake metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Briefcase,
              title: 'AI Marketing Strategy',
              desc: 'Generate end-to-end strategic growth playbooks incorporating unit economics, target personas, and channel allocations.'
            },
            {
              icon: Layers,
              title: 'Multi-Platform Ad Blueprints',
              desc: 'Complete ad deployment packages with primary copy, headlines, search keywords, and TikTok video hooks.'
            },
            {
              icon: Palette,
              title: 'Creative Studio Engine',
              desc: 'High-resolution commercial product imagery powered by Eden AI, Stability AI, and local generative engines.'
            },
            {
              icon: Cpu,
              title: 'AI Marketing Hub (97+ Tools)',
              desc: 'Universal execution toolkit covering email sequencing, CRO audits, social calendars, and packaging copy.'
            },
            {
              icon: Users,
              title: 'CRM Pipeline & Scoring',
              desc: 'Manage prospective buyers with automated 1-100 lead scoring and 1-click WhatsApp customer outreach.'
            },
            {
              icon: Search,
              title: 'Competitor Intelligence',
              desc: 'Autonomous scraper engine detecting competitor price drops, promotion campaigns, and ad saturations.'
            },
            {
              icon: Sparkles,
              title: 'AI Marketing Consultant',
              desc: 'Interactive chat assistant with persistent brand context to critique ad angles, budget plans, and offers.'
            },
            {
              icon: BarChart3,
              title: 'Performance Analytics',
              desc: 'Direct KPI monitoring for campaign budget pacing, conversion rates, and ROI payback periods.'
            }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#110E2E]/60 border border-[#231B4D] hover:border-[#7A5DBB]/50 transition-all group space-y-4 hover:bg-[#151138]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1B1642] border border-[#2D246B] flex items-center justify-center text-[#A59FFF] group-hover:scale-110 group-hover:text-white transition-all shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#D1C3FF] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#8E8AAB] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. HOW IT WORKS (#8) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#120E2E] to-[#0A071C] border border-[#261E52] space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A59FFF]">
              Autonomous Workflow
            </span>
            <h2 className="text-3xl font-black text-white">How Marky Works</h2>
            <p className="text-xs sm:text-sm text-[#8E8AAB]">
              From brand setup to autonomous multi-channel execution in 4 streamlined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Define Your Brand',
                desc: 'Input your company name, USP, voice, and target audience. Marky builds a persistent brand memory model.'
              },
              {
                step: '02',
                title: 'Connect Integrations',
                desc: 'Optionally connect your Gemini, OpenAI, or image provider keys, or utilize built-in smart fallback engines.'
              },
              {
                step: '03',
                title: 'Autonomous Synthesis',
                desc: 'Marky generates comprehensive ad blueprints, scrapes competitor shifts, and generates creative visual concepts.'
              },
              {
                step: '04',
                title: 'Execute & Scale',
                desc: 'Deploy high-converting campaigns across Meta, Google, and TikTok, and track conversion leads in your CRM.'
              }
            ].map((stepItem, i) => (
              <div key={i} className="space-y-3 relative">
                <div className="text-3xl font-black text-[#4239C4]/60 font-mono">
                  {stepItem.step}
                </div>
                <h3 className="text-base font-bold text-white">{stepItem.title}</h3>
                <p className="text-xs text-[#8E8AAB] leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. USE CASES (#9) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A59FFF]">
            Tailored For Growth
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Who Uses Marky?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#110E2E]/60 border border-[#231B4D] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 flex items-center justify-center text-[#D1C3FF] font-bold">
              🛍️
            </div>
            <h3 className="text-lg font-bold text-white">E-Commerce Brands</h3>
            <p className="text-xs text-[#8E8AAB] leading-relaxed">
              Launch dozens of targeted ad angles weekly, optimize COD confirmation rates to slash returns, and monitor competing storefronts in real time.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#110E2E]/60 border border-[#231B4D] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 flex items-center justify-center text-[#D1C3FF] font-bold">
              🚀
            </div>
            <h3 className="text-lg font-bold text-white">Founders & Startups</h3>
            <p className="text-xs text-[#8E8AAB] leading-relaxed">
              Act as your own Chief Marketing Officer. Build comprehensive go-to-market strategies and execute high-converting ad copy without expensive agency retainers.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#110E2E]/60 border border-[#231B4D] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 flex items-center justify-center text-[#D1C3FF] font-bold">
              🏢
            </div>
            <h3 className="text-lg font-bold text-white">Marketing Agencies</h3>
            <p className="text-xs text-[#8E8AAB] leading-relaxed">
              Manage multi-client brand profiles, instantly generate ad variations, extract verified local B2B leads from Google Maps, and deliver executive audit reports.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. TRUST & SECURITY SECTION (#11) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0C0924] border border-[#211B47] space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#1C173D]">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Enterprise-Grade Trust & Data Privacy
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Your Marketing Data Is Strictly Your Own
              </h2>
              <p className="text-xs text-[#8E8AAB] leading-relaxed">
                Marky is engineered from the ground up to guarantee tenant isolation, strict credential protection, and zero unauthorized exposure of proprietary brand data.
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-[#1A153D] hover:bg-[#251E54] text-[#D1C3FF] hover:text-white text-xs font-bold border border-[#2F2669] transition-colors whitespace-nowrap"
            >
              Start Secure Workspace
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#A59FFF]" /> AES-256 at Rest
              </h4>
              <p className="text-[#8E8AAB] text-[11px] leading-relaxed">
                API keys, database connections, and sensitive client tokens are encrypted with AES-256-GCM before entering the persistent database.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Strict Tenant Isolation
              </h4>
              <p className="text-[#8E8AAB] text-[11px] leading-relaxed">
                Robust row-level ownership checks enforce that User A can never query, inspect, or mutate User B's campaigns, CRM leads, or brand assets.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Zero Private Training
              </h4>
              <p className="text-[#8E8AAB] text-[11px] leading-relaxed">
                Your proprietary brand voices, product formulations, and customer lists are never utilized to train shared foundation models.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#D1C3FF]" /> Masked Credentials
              </h4>
              <p className="text-[#8E8AAB] text-[11px] leading-relaxed">
                Backend APIs never return raw secret keys to the browser bundle. Stored credentials are only ever presented in masked formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. PRICING TEASER SECTION (#12 & #13) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A59FFF]">
            Transparent Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Predictable Pricing for High-Growth Teams
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8AAB]">
            Start free, scale with Ultra, or deploy Pro for high-volume enterprise agency workloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-3xl bg-[#110E2E]/70 border border-[#231B4D] space-y-6">
            <div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1C1742] text-[#A59FFF] border border-[#2A2361] uppercase">
                Community
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-[#8E8AAB]">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-[#8E8AAB]">
                Ideal for individual founders exploring autonomous AI marketing.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-[#B4AFCC]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Single Brand Workspace</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>97+ Universal AI Marketing Tools</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Local Scraper Engines</span>
              </li>
            </ul>
            <Link
              href="/register?plan=free"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A153D] hover:bg-[#231D52] text-white text-xs font-bold border border-[#2B235E] transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Ultra Plan ($49) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1C1647] to-[#120E2E] border-2 border-[#7A5DBB] shadow-2xl space-y-6 relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#4239C4] to-[#D97FA5] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#4239C4]/30 text-[#D1C3FF] border border-[#7A5DBB]/40 uppercase">
                Ultra Growth
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$49</span>
                <span className="text-xs text-[#8E8AAB]">/ month</span>
              </div>
              <p className="mt-2 text-xs text-[#8E8AAB]">
                For scaling e-commerce merchants and high-velocity digital brands.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-white">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlimited Brand Workspaces</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Platform Ad Deployment Blueprints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Competitor Price & Ad Radar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp CRM Lead Automation</span>
              </li>
            </ul>
            <Link
              href="/register?plan=ultra"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] text-white text-xs font-bold shadow-lg shadow-[#4239C4]/30 hover:opacity-95 transition-opacity"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan ($1,999) */}
          <div className="p-8 rounded-3xl bg-[#110E2E]/70 border border-[#231B4D] space-y-6">
            <div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1C1742] text-[#A59FFF] border border-[#2A2361] uppercase">
                Agency Pro
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$1,999</span>
                <span className="text-xs text-[#8E8AAB]">/ month</span>
              </div>
              <p className="mt-2 text-xs text-[#8E8AAB]">
                For enterprise growth agencies and multi-brand portfolio managers.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-[#B4AFCC]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Tenant Client Portals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dedicated Autonomous Agent Swarm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom Database / Backend Connectors</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Priority Enterprise Support SLA</span>
              </li>
            </ul>
            <Link
              href="/register?plan=pro"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A153D] hover:bg-[#231D52] text-white text-xs font-bold border border-[#2B235E] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#A59FFF] hover:text-white transition-colors"
          >
            <span>View Full Pricing Comparison & E-Commerce ROI Calculator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── 8. FINAL CONVERSION CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Modernize Your Marketing Operations?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
              Join growth leaders who have unified strategy, ad blueprints, creative rendering, and CRM prospecting into one autonomous command center.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#141226] hover:bg-slate-100 font-extrabold text-sm shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
              >
                Create Free Workspace
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black/25 hover:bg-black/35 text-white font-bold text-sm border border-white/20 transition-colors"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

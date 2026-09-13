'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Truck,
  ShoppingBag,
  ExternalLink,
  Target,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Zap,
  Activity,
  Award,
  Search,
  Check,
  Shield,
  MessageSquare
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';

const PLAYBOOKS = [
  {
    id: 'cod-reduction',
    icon: Truck,
    badge: 'Logistics & Cashflow',
    title: 'Slashing COD (Cash-on-Delivery) Returns Below 10%',
    summary: 'Automate two-way WhatsApp order confirmation and sub-48-hour dispatch to stop courier return losses.',
    goal: 'Reduce return-to-origin (RTO) parcel rate from 22% down to 8.5% across Pakistan.',
    strategy: 'Enforce pre-dispatch qualification through automated two-way WhatsApp interactive buttons and address completeness scoring.',
    priority: 'Critical',
    difficulty: 'Low',
    confidence: '98%',
    timeToResult: '7 Days',
    estimatedEffort: '10 hrs setup',
    estimatedCost: 'PKR 15,000 / mo',
    potentialRoi: '6.4x',
    kpis: ['RTO Rate < 9%', 'Pre-dispatch Confirmation > 88%', 'Courier Re-attempt Success > 65%'],
    timeline: '1-2 Weeks',
    dependencies: 'WhatsApp Cloud API / SMS Gateway + Courier Portal (TCS/Leopards/Trax)',
    pipeline: {
      investment: 'PKR 15,000 WhatsApp API & Rider Incentives',
      actions: 'Automate two-way button verification + Phone address validation before label generation',
      expectedResult: 'Cancel 25% accidental/fake impulse orders before dispatch fee incurred',
      revenueValue: 'Save PKR 185,000/mo in courier return penalties and tied-up stock',
      roi: '12.3x Net Margin Recovery'
    },
    steps: [
      { step: 1, title: 'Two-Way WhatsApp Order Verification', detail: 'Trigger an automated interactive WhatsApp button template immediately upon checkout with "Confirm Order" and "Cancel Order". Orders unconfirmed after 18 hours are automatically cancelled.' },
      { step: 2, title: 'Street Address Completeness Scoring', detail: 'Riders in Pakistan cannot locate "Near Masjid, Lahore". Enforce house/street number, landmark, and alternate contact numbers before printing waybill.' },
      { step: 3, title: 'Sub-48-Hour Dispatch Guarantee', detail: 'Buyer excitement drops sharply after 48 hours. Orders delivered within 2 days show an 89% acceptance rate versus 52% after day 5.' },
      { step: 4, title: 'Courier Return Allowance Accounting', detail: 'Reserve 10% of gross merchandise value as an RTO cushion to absorb reverse logistics fees without impacting operational liquidity.' }
    ]
  },
  {
    id: 'daraz-ranking',
    icon: ShoppingBag,
    badge: 'Marketplace SEO',
    title: 'Daraz PK Organic Ranking & 11.11 Mega Sale Engine',
    summary: 'Master Page 1 search keyword placement, listing CTR optimization, and first-24h sales velocity.',
    goal: 'Rank top 3 for high-volume organic search queries on Daraz Pakistan.',
    strategy: 'Syndicate off-platform TikTok/Meta traffic with UTM tracking into Daraz store during the first 24 hours to trigger algorithmic search placement.',
    priority: 'High',
    difficulty: 'Medium',
    confidence: '92%',
    timeToResult: '14 Days',
    estimatedEffort: '25 hrs',
    estimatedCost: 'PKR 40,000 Ads',
    potentialRoi: '4.8x',
    kpis: ['Page 1 Keyword Rank', 'Listing CTR > 4.2%', 'Review Velocity > 15 5-Star Reviews/wk'],
    timeline: '3-4 Weeks',
    dependencies: 'Daraz Seller Center Account + Meta Ads Manager',
    pipeline: {
      investment: 'PKR 40,000 Targeted Off-Platform Traffic',
      actions: 'Drive external traffic to Daraz product listing with physical review incentive cards',
      expectedResult: 'Trigger Daraz organic search algorithm boost from external buyer acquisition',
      revenueValue: 'PKR 350,000/mo sustained organic sales without continuous ad spend',
      roi: '8.75x Organic Lift'
    },
    steps: [
      { step: 1, title: 'Listing Title Formula Optimization', detail: 'Format: Brand + Core Attribute + Exact Search Keyword + Spec/Size + Key Benefit (e.g. "KMB Sidr Honey 1KG - 100% Pure Raw Organic with Free COD").' },
      { step: 2, title: 'First 24-Hour Velocity Ingestion', detail: 'Run external TikTok/Meta ads directing to the Daraz store link with UTM tracking. Daraz awards massive organic search boosts to listings bringing external traffic.' },
      { step: 3, title: 'Physical Review Incentive Postcards', detail: 'Insert a physical card in every shipment offering an instant PKR 200 Daraz voucher in exchange for a photo review with verified purchase.' }
    ]
  },
  {
    id: 'tiktok-creative',
    icon: Sparkles,
    badge: 'Viral Creative Ops',
    title: '3-Second TikTok Hook Architecture for High-ROAS E-Com',
    summary: 'Stop the doom-scroll, agitate unexpressed customer pain, and generate orders below PKR 15 CPC.',
    goal: 'Scale profitable video creative volume with sub-PKR 450 cost-per-acquisition (CPA).',
    strategy: 'Deploy the 4-part Hook-Agitate-Demonstrate-COD CTA script architecture on UGC creator videos.',
    priority: 'High',
    difficulty: 'Medium',
    confidence: '95%',
    timeToResult: '3 Days',
    estimatedEffort: '15 hrs production',
    estimatedCost: 'PKR 25,000 Creator Fees',
    potentialRoi: '5.2x',
    kpis: ['3-Second Hook Retention > 45%', 'CPC < PKR 14', 'ROAS > 3.8x'],
    timeline: 'Ongoing Weekly',
    dependencies: 'TikTok Ads Manager / Spark Ads + Smartphone Camera Gear',
    pipeline: {
      investment: 'PKR 25,000 5x UGC Creator Videos',
      actions: 'Produce 10 micro-hooks testing water purity tests, macro textures, and counterfeit warnings',
      expectedResult: 'Find 2 viral winning ads with sub-PKR 12 CPC that scale spend efficiently',
      revenueValue: 'PKR 650,000 in direct orders generated over 30 days',
      roi: '26.0x Return on Creative Spend'
    },
    steps: [
      { step: 1, title: '0:00 - 0:03: The Pattern Interrupt Hook', detail: 'Call out viewer assumptions: "If you are still buying supermarket honey in Pakistan, watch this before making a huge mistake..."' },
      { step: 2, title: '0:03 - 0:12: The Pain & Fear Agitation', detail: 'Show macro footage of industrial corn syrup crystallization and explain how commercial brands dilute products for profit.' },
      { step: 3, title: '0:12 - 0:22: Physical Proof & Water Dissolution Test', detail: 'Drop raw honey into water showing clean amber retention without dissolution; show certified lab test report certificate.' },
      { step: 4, title: '0:22 - 0:30: Frictionless COD Call to Action', detail: 'Point to link in bio with clear mention of nationwide 48-hour Cash-on-Delivery and 10x money-back purity guarantee.' }
    ]
  }
];

const FAQS = [
  {
    q: 'How does the Universal AI Tool Runner work without 97 separate scripts?',
    a: 'MarketPulse AI uses a centralized Universal Tool Runner Engine on the Express backend (/api/ai/run-tool). Each tool passes structured metadata (category, tone, audience, parameters) that dynamic system prompt templates synthesize and dispatch to Google Gemini. If no API key is supplied, a smart fallback engine generates realistic, formatted outputs so the system never fails.'
  },
  {
    q: 'Where is my data stored?',
    a: 'All data (Brands, Campaigns, CRM Leads, Competitor Watchlists, Saved Content, and Strategies) is stored locally in SQLite at server/marketpulse.db. There are zero cloud database subscriptions or external servers required.'
  },
  {
    q: 'How do I add or update my Google Gemini API Key?',
    a: 'You can configure your GEMINI_API_KEY in server/.env or click the "Gemini API" key status badge in the top navbar or Admin Panel. The key updates in runtime immediately.'
  },
  {
    q: 'Can I export CRM leads to my team?',
    a: 'Yes! Navigate to the CRM Pipeline page and click "Export CSV" to download all client records, phone numbers, and ratings into an Excel/CSV file.'
  }
];

export default function HelpPage() {
  const [activePlaybookId, setActivePlaybookId] = useState('cod-reduction');
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');

  const selectedPb = PLAYBOOKS.find((p) => p.id === activePlaybookId) || PLAYBOOKS[0];

  const filteredPlaybooks = PLAYBOOKS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.summary.toLowerCase().includes(search.toLowerCase()) ||
    p.badge.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Strategic Execution & Playbooks"
        badgeIcon={BookOpen}
        title="Marketing Execution Playbooks"
        description="Battle-tested tactical playbooks for Pakistani e-commerce and multi-channel acquisition: complete with ROI pipeline blueprints, step-by-step actions, and measurable outcome benchmarks."
      />

      {/* 2. Playbooks Grid & Interactive Execution Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Playbook Selector (4 cols) */}
        <div className="lg:col-span-4 marky-card p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-[#6C6782] uppercase tracking-wider">
              Strategic Playbook Library
            </h3>
            <p className="text-xs text-[#6C6782]">Select an execution framework</p>
          </div>

          <div className="space-y-2">
            {filteredPlaybooks.map((pb) => {
              const isSelected = pb.id === selectedPb.id;
              const Icon = pb.icon;

              return (
                <button
                  key={pb.id}
                  onClick={() => setActivePlaybookId(pb.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 cursor-pointer ${
                    isSelected
                      ? 'border-[#7A5DBB] bg-[#4239C4]/5 shadow-xs ring-1 ring-[#7A5DBB]/20'
                      : 'border-[#ECE8E3] bg-white hover:border-[#7A5DBB]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#4239C4] bg-[#4239C4]/10 px-2.5 py-0.5 rounded-full border border-[#7A5DBB]/20">
                      {pb.badge}
                    </span>
                    <span className="text-[10px] font-bold text-[#7A5DBB] font-mono">
                      ROI: {pb.potentialRoi}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#141226] leading-snug">{pb.title}</h4>
                      <p className="text-[11px] text-[#6C6782] line-clamp-2 mt-1 leading-relaxed">{pb.summary}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Playbook Deep Architecture (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="marky-card p-6 md:p-8 space-y-6">
            {/* Header with Badges */}
            <div className="space-y-3 pb-5 border-b border-[#ECE8E3]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/25">
                  {selectedPb.badge}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Priority: {selectedPb.priority}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7A5DBB]/10 text-[#7A5DBB] border border-[#7A5DBB]/20">
                  Confidence: {selectedPb.confidence}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Time to Result: {selectedPb.timeToResult}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-[#141226] tracking-tight">
                {selectedPb.title}
              </h2>
              <p className="text-xs md:text-sm text-[#6C6782] leading-relaxed">
                {selectedPb.summary}
              </p>
            </div>

            {/* Strategic Parameters Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Primary Goal</span>
                <p className="text-xs font-bold text-[#141226] mt-0.5 line-clamp-2">{selectedPb.goal}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Est. Cost</span>
                <p className="text-xs font-bold text-[#141226] mt-0.5">{selectedPb.estimatedCost}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Effort Required</span>
                <p className="text-xs font-bold text-[#141226] mt-0.5">{selectedPb.estimatedEffort}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#4239C4]/10 border border-[#7A5DBB]/30">
                <span className="text-[10px] font-bold text-[#4239C4] uppercase block">Projected ROI</span>
                <p className="text-base font-black text-[#4239C4] mt-0.5">{selectedPb.potentialRoi}</p>
              </div>
            </div>

            {/* Visual ROI Pipeline */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B091B] to-[#171434] text-white border border-[#1C1938] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#D1C3FF]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                    ROI-Focused Execution Pipeline
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#D1C3FF] bg-[#4239C4]/30 px-2 py-0.5 rounded border border-[#7A5DBB]/30">
                  Value Flow
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[#D1C3FF] uppercase block">1. Investment</span>
                  <p className="text-[11px] text-slate-200 leading-snug">{selectedPb.pipeline.investment}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[#A59FFF] uppercase block">2. Actions</span>
                  <p className="text-[11px] text-slate-200 leading-snug">{selectedPb.pipeline.actions}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[#D97FA5] uppercase block">3. Result</span>
                  <p className="text-[11px] text-slate-200 leading-snug">{selectedPb.pipeline.expectedResult}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[#F3C5A8] uppercase block">4. Revenue Lift</span>
                  <p className="text-[11px] text-slate-200 leading-snug">{selectedPb.pipeline.revenueValue}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">5. Net ROI</span>
                  <p className="text-xs font-black text-white leading-snug">{selectedPb.pipeline.roi}</p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Action Architecture */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#141226] uppercase tracking-wider">
                Step-by-Step Execution Architecture
              </h3>
              <div className="space-y-2.5">
                {selectedPb.steps.map((s) => (
                  <div key={s.step} className="p-4 rounded-xl border border-[#ECE8E3] bg-white space-y-1.5 hover:border-[#7A5DBB]/30 transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center text-xs font-black shrink-0">
                        {s.step}
                      </span>
                      <h4 className="text-xs font-black text-[#141226]">{s.title}</h4>
                    </div>
                    <p className="text-xs text-[#3E3A52] leading-relaxed pl-8.5">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target KPIs */}
            <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2">
              <span className="text-[10px] font-bold text-[#6C6782] uppercase tracking-wider block">Target Success KPIs</span>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedPb.kpis.map((kpi, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-white border border-[#ECE8E3] text-xs font-bold text-[#141226] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{kpi}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Expandable FAQ Accordion */}
      <div className="marky-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#ECE8E3]">
          <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#141226]">Frequently Asked Questions</h3>
            <p className="text-xs text-[#6C6782]">Operational stack, local database storage, and AI models</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="rounded-xl border border-[#ECE8E3] bg-white overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-[#141226] hover:text-[#4239C4] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#4239C4]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#6C6782]" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#6C6782] leading-relaxed border-t border-[#ECE8E3] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

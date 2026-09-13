'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Calculator,
  TrendingUp,
  ArrowRight,
  Shield,
  Zap,
  HelpCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Layers,
  Cpu
} from 'lucide-react';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'roi'

  // ROI Calculator Inputs
  const [adSpend, setAdSpend] = useState(250000);
  const [teamSize, setTeamSize] = useState(3);
  const [aov, setAov] = useState(4200);
  const [cpc, setCpc] = useState(16);
  const [cvr, setCvr] = useState(3.2); // 3.2%
  const [codReturnRate, setCodReturnRate] = useState(14); // 14%
  const [hourlyWage, setHourlyWage] = useState(1200); // PKR / hr

  // Calculations
  const clicks = Math.round(adSpend / (cpc || 1));
  const grossOrders = Math.round(clicks * (cvr / 100));
  const deliveredOrders = Math.round(grossOrders * ((100 - codReturnRate) / 100));
  const revenue = deliveredOrders * aov;
  const roas = (revenue / (adSpend || 1)).toFixed(2);

  // Projected Marky AI Optimizations:
  const optimizedCodRate = Math.max(5, (codReturnRate * 0.6).toFixed(1));
  const optimizedDeliveredOrders = Math.round(grossOrders * ((100 - optimizedCodRate) / 100));
  const optimizedRevenue = optimizedDeliveredOrders * aov;
  const revenueLift = optimizedRevenue - revenue;
  const hoursSaved = teamSize * 35;
  const monthlyCostSavings = hoursSaved * hourlyWage;
  const softwareInvestment = 49 * 280; // ~PKR 13,720 / mo for Ultra plan
  const totalFinancialBenefit = revenueLift + monthlyCostSavings;
  const netRoi = Math.round((totalFinancialBenefit / softwareInvestment) * 100);
  const paybackPeriodDays = Math.max(1, Math.round((softwareInvestment / (totalFinancialBenefit / 30))));

  const plans = [
    {
      id: 'free',
      name: 'Free',
      badge: 'Community Edition',
      price: '$0',
      period: '/ forever',
      description: 'Zero subscription cost. Built-in local smart fallback AI engines, local SQLite database, and core tool runner.',
      highlight: false,
      cta: 'Get Started',
      ctaHref: '/register?plan=free',
      features: [
        'Single Brand Workspace',
        '97+ AI Marketing Tools',
        'Local Deterministic Fallback AI Engine',
        'Google Maps B2B Lead Scraper',
        'Meta Ads Public Intelligence Inspector',
        'Local CRM Pipeline & CSV Export',
        'AES-256 Data Encryption at Rest'
      ],
      limits: {
        brands: '1 Brand',
        campaigns: '5 Active Campaigns',
        leads: 'Unlimited Local Storage',
        support: 'Community Docs'
      }
    },
    {
      id: 'ultra',
      name: 'Ultra',
      badge: 'High-Velocity Growth',
      price: '$49',
      period: '/ month',
      description: 'Engineered for scaling direct-to-consumer e-commerce merchants and fast-growing digital brands running paid traffic.',
      highlight: true,
      cta: 'Get Started',
      ctaHref: '/register?plan=ultra',
      features: [
        'Multi-Brand Workspace Management (Up to 5 Brands)',
        'AI Multi-Platform Ad Deployment Kits (Meta, TikTok, Google)',
        'Creative Studio Image Generation & Vault',
        'Competitor Price Change & Ad Saturation Alerts',
        'WhatsApp Automated CRM Confirmation System',
        'Autonomous Marketing Strategy Blueprints',
        'Direct Cloud Model Connector (Gemini & OpenAI)',
        'Priority Scraper Job Execution'
      ],
      limits: {
        brands: '5 Brands',
        campaigns: 'Unlimited Campaigns',
        leads: 'Unlimited Leads & Scoring',
        support: 'Priority Email Support'
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Enterprise Agency',
      price: '$1,999',
      period: '/ month',
      description: 'Dedicated high-volume infrastructure for performance marketing agencies, holdings, and multi-brand corporate portfolios.',
      highlight: false,
      cta: 'Get Started',
      ctaHref: '/register?plan=pro',
      features: [
        'Unlimited Brand Portfolios & Client Workspaces',
        'Dedicated Autonomous AI Agent Swarms (12+ Specialized Roles)',
        'Multi-Tenant Role-Based Access Control (RBAC)',
        'Custom Database / Backend Connectors (Supabase, Postgres)',
        'High-Throughput Concurrent Scraper Pipelines',
        'Custom Fine-Tuned Brand Persona Directives',
        'Executive White-Label Audit Dossiers',
        'Dedicated Solutions Architect & 99.9% Uptime SLA'
      ],
      limits: {
        brands: 'Unlimited Brands',
        campaigns: 'Unlimited Campaigns',
        leads: 'Unlimited CRM Pipeline',
        support: 'Dedicated Slack & Phone SLA'
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-18 space-y-16 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181438] border border-[#7A5DBB]/30 text-xs font-semibold text-[#D1C3FF]">
          <Sparkles className="w-3.5 h-3.5 text-[#A59FFF]" />
          <span>Transparent Commercial Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Choose the Right Plan for Your Marketing Scale
        </h1>
        <p className="text-sm sm:text-base text-[#B4AFCC] leading-relaxed">
          From solo brand builders to enterprise agency holding groups. Deploy autonomous marketing intelligence with zero hidden fees.
        </p>

        {/* Tab Switcher: Plans vs ROI */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-[#141033] border border-[#261E52]">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white shadow-md'
                  : 'text-[#8E8AAB] hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscription Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('roi')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roi'
                  ? 'bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white shadow-md'
                  : 'text-[#8E8AAB] hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>E-Commerce ROI Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: SUBSCRIPTION PLANS (#12) ── */}
      {activeTab === 'pricing' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#1C1647] to-[#120E2E] border-2 border-[#7A5DBB] shadow-2xl shadow-[#4239C4]/25 relative'
                    : 'bg-[#110E2E]/80 border border-[#231B4D] hover:border-[#382D78]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1C1742] text-[#D1C3FF] border border-[#2D2569] uppercase tracking-wider">
                      {plan.badge}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-3">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-5xl font-black text-white">{plan.price}</span>
                      <span className="text-xs text-[#8E8AAB] font-medium">{plan.period}</span>
                    </div>
                    <p className="mt-3 text-xs text-[#B4AFCC] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1F1945] space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#A59FFF]">
                      Included Features
                    </p>
                    <ul className="space-y-2.5 text-xs">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[#D1C3FF]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-[#1F1945] space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#09071A] p-3 rounded-xl border border-[#1C163D]">
                    <div>
                      <p className="text-[#6C6782]">Workspaces</p>
                      <p className="font-bold text-white mt-0.5">{plan.limits.brands}</p>
                    </div>
                    <div>
                      <p className="text-[#6C6782]">Campaigns</p>
                      <p className="font-bold text-white mt-0.5">{plan.limits.campaigns}</p>
                    </div>
                  </div>

                  <Link
                    href={plan.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] text-white shadow-lg shadow-[#4239C4]/30 hover:opacity-95 hover:scale-[1.01]'
                        : 'bg-[#1C1742] hover:bg-[#251F57] text-white border border-[#2E256E]'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Logic Notice (#13) */}
          <div className="p-4 rounded-2xl bg-[#0F0C29] border border-[#211A4A] text-center max-w-2xl mx-auto text-xs text-[#8E8AAB]">
            <p>
              💡 <strong>Instant Workspace Provisioning:</strong> Payment gateway integrations are in sandbox mode. Selecting any plan immediately registers your account with the respective feature capabilities active.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 2: ROI CALCULATOR ── */}
      {activeTab === 'roi' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0F0C29] border border-[#261E52] shadow-2xl space-y-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              Pakistani E-Commerce Financial Lift & ROI Modeling
            </h3>
            <p className="text-xs text-[#8E8AAB] max-w-2xl">
              Model real-world revenue gains from Marky's automated WhatsApp Cash-on-Delivery (COD) verification and agency overhead savings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: Interactive Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-2">
                  <span>Monthly Ad Spend</span>
                  <span className="font-mono text-[#D1C3FF]">PKR {Number(adSpend).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2000000"
                  step="25000"
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full accent-[#7A5DBB] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-2">
                  <span>Average Order Value (AOV)</span>
                  <span className="font-mono text-[#D1C3FF]">PKR {Number(aov).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1500"
                  max="15000"
                  step="500"
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="w-full accent-[#7A5DBB] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-2">
                  <span>Current COD Return (RTO) Rate</span>
                  <span className="font-mono text-[#D1C3FF]">{codReturnRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={codReturnRate}
                  onChange={(e) => setCodReturnRate(Number(e.target.value))}
                  className="w-full accent-[#7A5DBB] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-2">
                  <span>Marketing Team / Agency Seats</span>
                  <span className="font-mono text-[#D1C3FF]">{teamSize} Persons</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-[#7A5DBB] cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Projected Return Card */}
            <div className="p-8 rounded-2xl bg-[#09071A] border border-[#1E1742] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C163D]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A59FFF]">
                  Projected Monthly Benefit
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-bold">
                  {netRoi}% Net ROI
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-[#8E8AAB]">COD Return Reduction Lift:</span>
                  <span className="font-bold text-white font-mono">
                    +PKR {Math.round(revenueLift).toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-[#8E8AAB]">Automated Task Time Savings:</span>
                  <span className="font-bold text-white font-mono">
                    +PKR {Math.round(monthlyCostSavings).toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-[#8E8AAB]">Marky Ultra Software Cost:</span>
                  <span className="font-bold text-[#A59FFF] font-mono">
                    -PKR {Math.round(softwareInvestment).toLocaleString()} / mo
                  </span>
                </div>
                <div className="pt-4 border-t border-[#1C163D] flex justify-between items-baseline">
                  <span className="text-sm font-black text-white">Net Bottom-Line Lift:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    PKR {Math.round(totalFinancialBenefit).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-[#6C6782]">
                  Payback period: <strong className="text-white">{paybackPeriodDays} days</strong> on the Ultra Plan.
                </p>
              </div>

              <Link
                href="/register?plan=ultra"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white font-bold text-xs shadow-lg shadow-[#4239C4]/30"
              >
                <span>Deploy Marky for Your Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      <div className="space-y-6 max-w-3xl mx-auto pt-8">
        <h3 className="text-2xl font-black text-white text-center">Frequently Asked Questions</h3>
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#110E2E]/60 border border-[#231B4D] space-y-2">
            <h4 className="text-white font-bold">Can I switch plans or cancel at any time?</h4>
            <p className="text-[#8E8AAB] leading-relaxed">
              Yes. You can upgrade, downgrade, or cancel your subscription plan at any time from your Settings dashboard without lock-in contracts.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#110E2E]/60 border border-[#231B4D] space-y-2">
            <h4 className="text-white font-bold">Do I need my own API keys to run Marky?</h4>
            <p className="text-[#8E8AAB] leading-relaxed">
              No. Marky comes pre-configured with smart fallback intelligence engines that run out-of-the-box. If you wish to connect your own Google Gemini, OpenAI, or image provider keys, you can securely plug them in under Settings &rarr; AI Providers &amp; Keys.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#110E2E]/60 border border-[#231B4D] space-y-2">
            <h4 className="text-white font-bold">How is my brand and customer data protected?</h4>
            <p className="text-[#8E8AAB] leading-relaxed">
              All client data is encrypted with AES-256-GCM at rest and strictly isolated per workspace tenant ID. Your proprietary data is never utilized for public AI training.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

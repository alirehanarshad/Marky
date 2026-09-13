'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Calculator,
  TrendingUp,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Layers,
  Cpu,
  HelpCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Percent
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import Tabs from '@/components/ui/Tabs';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'roi'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

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
  // 1. WhatsApp confirmation cuts COD returns by 40% (e.g. 14% -> 8.4%)
  const optimizedCodRate = Math.max(5, (codReturnRate * 0.6).toFixed(1));
  const optimizedDeliveredOrders = Math.round(grossOrders * ((100 - optimizedCodRate) / 100));
  const optimizedRevenue = optimizedDeliveredOrders * aov;
  const revenueLift = optimizedRevenue - revenue;

  // 2. Automated agency tasks saves 35 hrs/mo per team member
  const hoursSaved = teamSize * 35;
  const monthlyCostSavings = hoursSaved * hourlyWage;

  // 3. Net Value & ROI
  const softwareInvestment = 49 * 280; // ~PKR 13,720 / mo for Growth Pro
  const totalFinancialBenefit = revenueLift + monthlyCostSavings;
  const netRoi = Math.round((totalFinancialBenefit / softwareInvestment) * 100);
  const paybackPeriodDays = Math.max(1, Math.round((softwareInvestment / (totalFinancialBenefit / 30))));

  const plans = [
    {
      id: 'community',
      name: 'Local Open Stack',
      badge: 'Free Forever',
      priceMonthly: 'PKR 0',
      priceAnnual: 'PKR 0',
      period: 'forever',
      description: 'Zero cloud subscriptions. Local SQLite database and smart deterministic fallback engines on your workstation.',
      highlight: false,
      cta: 'Current Active Edition',
      ctaStyle: 'marky-btn-secondary',
      features: [
        'Single Brand Workspace (Local SQLite)',
        '12 Autonomous AI Specialized Agents',
        'Universal AI Tool Runner (97+ Tools)',
        'Local Meta Ad & Map Discovery Scrapers',
        'Direct CSV Lead & Report Export',
        'Community Documentation & Playbooks'
      ],
      limits: {
        brands: '1 Brand',
        campaigns: '5 Active Campaigns',
        leads: 'Unlimited Local Storage',
        aiModel: 'Local Fallback / BYO Gemini Key'
      }
    },
    {
      id: 'growth',
      name: 'Marky Growth Pro',
      badge: 'Most Popular',
      priceMonthly: '$49',
      priceAnnual: '$39',
      period: '/ month',
      description: 'For growing e-commerce merchants and digital agencies managing multiple brands and autonomous ad scaling.',
      highlight: true,
      cta: 'Upgrade to Growth Pro',
      ctaStyle: 'marky-btn-primary',
      features: [
        'Up to 5 Multi-Brand Workspaces',
        'Automated 2-Way WhatsApp COD Verification',
        'Autonomous Workflow Execution Scheduler',
        'Direct Google Gemini 2.5/3.5 Cloud Models',
        'Real-time Apify Cloud Scraper Connectors',
        'Executive C-Level Marketing Intelligence Reports',
        'Priority Creative Generation Velocity'
      ],
      limits: {
        brands: '5 Brands',
        campaigns: 'Unlimited Campaigns',
        leads: 'Unlimited Verified CRM Pipeline',
        aiModel: 'Gemini Pro + Gemini Flash Cloud'
      }
    },
    {
      id: 'enterprise',
      name: 'Workforce Enterprise',
      badge: 'Bespoke Scale',
      priceMonthly: '$199',
      priceAnnual: '$159',
      period: '/ month',
      description: 'Dedicated enterprise infrastructure with custom fine-tuned marketing models and multi-seat team governance.',
      highlight: false,
      cta: 'Contact Sales',
      ctaStyle: 'marky-btn-secondary',
      features: [
        'Unlimited Brand & Agency Workspaces',
        'Multi-Seat Role-Based Permissions (RBAC)',
        'Custom Fine-Tuned AI Tone & Brand Personas',
        'Dedicated Proxy Clusters for Meta & Daraz Scraping',
        'Dedicated Solutions Architect Support',
        'Custom ERP & Shopify API Webhook Integrations',
        '99.9% Uptime SLA Guarantee'
      ],
      limits: {
        brands: 'Unlimited Brands',
        campaigns: 'Unlimited Scaling',
        leads: 'Custom Postgres / BigQuery Sync',
        aiModel: 'Custom Fine-Tuned Enterprise Weights'
      }
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Transparent Tiers & Value Modeling"
        badgeIcon={CreditCard}
        title="Pricing Plans & ROI Intelligence"
        description="Transparent scaling roadmap and interactive financial ROI simulator: model your acquisition unit economics, estimated operational cost reductions, and projected revenue lift."
      />

      {/* 2. Top Segmented Switcher */}
      <div className="marky-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'pricing', label: 'Subscription Tiers & Capabilities' },
            { id: 'roi', label: 'Interactive Marketing ROI Simulator' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'pricing' && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs font-bold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#4239C4] shadow-xs'
                  : 'text-[#6C6782] hover:text-[#141226]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white text-[#4239C4] shadow-xs'
                  : 'text-[#6C6782] hover:text-[#141226]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#4239C4]/10 text-[#4239C4]">
                Save 20%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Tab: Pricing Plans */}
      {activeTab === 'pricing' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`marky-card p-6 md:p-8 flex flex-col justify-between space-y-6 relative transition-all ${
                  plan.highlight
                    ? 'border-[#7A5DBB] ring-2 ring-[#7A5DBB]/30 shadow-xl bg-gradient-to-b from-white via-white to-[#F7F6FA]'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#4239C4] to-[#A73B9D] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Recommended Plan
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#6C6782] uppercase tracking-wider">
                      {plan.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      plan.highlight
                        ? 'bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-[#141226] tracking-tight">
                        {billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      <span className="text-xs text-[#6C6782] font-semibold">{plan.period}</span>
                    </div>
                    <p className="text-xs text-[#6C6782] mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Resource Limits Pill Grid */}
                  <div className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6C6782]">Workspaces:</span>
                      <span className="font-bold text-[#141226]">{plan.limits.brands}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6C6782]">Campaigns:</span>
                      <span className="font-bold text-[#141226]">{plan.limits.campaigns}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6C6782]">AI Connectivity:</span>
                      <span className="font-bold text-[#4239C4]">{plan.limits.aiModel}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-extrabold text-[#141226] uppercase tracking-wider block">
                      Included Capabilities
                    </span>
                    <ul className="space-y-2 text-xs">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-[#3E3A52]">
                          <Check className="w-4 h-4 text-[#4239C4] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className={`w-full py-2.5 text-xs font-bold transition-all cursor-pointer ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Feature Comparison Matrix */}
          <div className="marky-card p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-extrabold text-[#141226]">Full Capability Comparison</h3>
            <div className="overflow-x-auto">
              <table className="marky-table">
                <thead>
                  <tr>
                    <th>Platform Feature</th>
                    <th className="text-center">Local Open Stack</th>
                    <th className="text-center text-[#4239C4]">Growth Pro</th>
                    <th className="text-center">Workforce Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feat: 'Local SQLite Database Persistence', f1: '✓ Included', f2: '✓ Included', f3: '✓ Included' },
                    { feat: 'Multi-Brand Workspace Isolation', f1: '1 Brand', f2: '5 Brands', f3: 'Unlimited' },
                    { feat: 'Autonomous Agent Orchestration (12 Agents)', f1: 'Manual Trigger', f2: 'Scheduled Cron', f3: 'Continuous Event Driven' },
                    { feat: 'WhatsApp COD Confirmation Automation', f1: 'Manual Playbook', f2: 'Automated API Bot', f3: 'Multi-Courier Webhooks' },
                    { feat: 'AI Executive Performance Reports', f1: 'Standard Markdown', f2: 'C-Suite Diagnostics', f3: 'Custom Executive Dossiers' },
                    { feat: 'Scrapers (Meta Ad Inspector & Maps)', f1: 'Local Discovery', f2: 'Apify Cloud Sync', f3: 'Dedicated Residential IP' },
                    { feat: 'Multi-Seat Team Roles & Permissions', f1: '—', f2: 'Up to 3 Seats', f3: 'Unlimited RBAC' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-[#141226]">{row.feat}</td>
                      <td className="text-center text-[#6C6782]">{row.f1}</td>
                      <td className="text-center font-bold text-[#4239C4]">{row.f2}</td>
                      <td className="text-center text-[#6C6782]">{row.f3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Interactive Marketing ROI Simulator */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Input Sliders (7 cols) */}
            <div className="lg:col-span-7 marky-card p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#ECE8E3]">
                <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#141226]">Acquisition & Operational Parameters</h3>
                  <p className="text-xs text-[#6C6782]">Adjust sliders to model realistic Pakistani e-commerce economics</p>
                </div>
              </div>

              <div className="space-y-5 text-xs">
                {/* Monthly Ad Spend */}
                <div>
                  <div className="flex items-center justify-between font-bold text-[#141226] mb-1.5">
                    <span>Monthly Media Ad Spend:</span>
                    <span className="text-[#4239C4] font-black text-sm">PKR {Number(adSpend).toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2000000"
                    step="25000"
                    value={adSpend}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                    className="w-full accent-[#4239C4] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#6C6782]">Meta Advantage+ & TikTok Shop combined budget</span>
                </div>

                {/* Average Order Value (AOV) */}
                <div>
                  <div className="flex items-center justify-between font-bold text-[#141226] mb-1.5">
                    <span>Average Order Value (AOV):</span>
                    <span className="text-[#4239C4] font-black text-sm">PKR {Number(aov).toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="12000"
                    step="250"
                    value={aov}
                    onChange={(e) => setAov(Number(e.target.value))}
                    className="w-full accent-[#4239C4] cursor-pointer"
                  />
                </div>

                {/* Team Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between font-bold text-[#141226] mb-1.5">
                      <span>Marketing Team Size:</span>
                      <span className="text-[#4239C4] font-black text-sm">{teamSize} Persons</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="w-full accent-[#4239C4] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between font-bold text-[#141226] mb-1.5">
                      <span>Courier COD Return Rate:</span>
                      <span className="text-rose-600 font-black text-sm">{codReturnRate}% RTO</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={codReturnRate}
                      onChange={(e) => setCodReturnRate(Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* CPC & Conversion Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between font-bold text-[#141226] mb-1.5">
                      <span>Avg Cost Per Click (CPC):</span>
                      <span className="font-black text-[#141226]">PKR {cpc}</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="40"
                      step="1"
                      value={cpc}
                      onChange={(e) => setCpc(Number(e.target.value))}
                      className="w-full accent-[#4239C4] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between font-bold text-[#141226] mb-1.5">
                      <span>Store Conversion Rate (CVR):</span>
                      <span className="font-black text-[#141226]">{cvr}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="0.1"
                      value={cvr}
                      onChange={(e) => setCvr(Number(e.target.value))}
                      className="w-full accent-[#4239C4] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Projected Financial Outputs (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Value Summary Card */}
              <div className="marky-hero-banner p-6 md:p-8 space-y-6">
                <div className="space-y-1 pb-4 border-b border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-[#D1C3FF] tracking-wider block">
                    Financial Impact Summary
                  </span>
                  <h3 className="text-xl font-black text-white">Projected Monthly Benefit</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-300 block">Total Projected Monthly Value Lift</span>
                    <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      PKR {Math.round(totalFinancialBenefit).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                      ~{netRoi}% Software ROI • Full Payback in ~{paybackPeriodDays} Days
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-bold text-[#D1C3FF] uppercase block">Revenue Lift</span>
                      <span className="text-base font-black text-white block mt-0.5">
                        +PKR {Math.round(revenueLift).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-300">from COD verification</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-bold text-[#F3C5A8] uppercase block">Hours Saved</span>
                      <span className="text-base font-black text-white block mt-0.5">
                        {hoursSaved} hrs / mo
                      </span>
                      <span className="text-[10px] text-slate-300">across {teamSize} staff</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Baseline ROAS:</span>
                      <span className="font-bold text-white">{roas}x</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Optimized Blended ROAS:</span>
                      <span className="font-black text-emerald-400">
                        {(optimizedRevenue / (adSpend || 1)).toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer Note */}
              <div className="marky-card p-4 text-[11px] text-[#6C6782] space-y-1">
                <span className="font-bold text-[#141226] block">AI Transparency & Projection Rules</span>
                <p className="leading-relaxed">
                  Calculations simulate empirical Pakistani e-commerce metrics: order cancellations before rider dispatch save courier reversal fees; autonomous agent tool execution reduces repetitive copy & asset workflows. Actual revenue depends on product supply and parcel courier SLA.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

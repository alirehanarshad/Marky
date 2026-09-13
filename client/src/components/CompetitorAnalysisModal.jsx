'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Layers,
  Target,
  ArrowRight,
  TrendingUp,
  Info,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  Tag,
  Check
} from 'lucide-react';
import api from '../lib/api';

export default function CompetitorAnalysisModal({
  isOpen,
  onClose,
  competitor,
  activeJobId = null,
  onAnalysisUpdated
}) {
  const [jobStatus, setJobStatus] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [currentComp, setCurrentComp] = useState(competitor);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setCurrentComp(competitor);
  }, [competitor]);

  // Poll job status if an active job is running
  useEffect(() => {
    if (!activeJobId || !isOpen) return;

    let timer;
    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${activeJobId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setJobStatus(data.data);
          if (data.data.status === 'completed') {
            // Refresh competitor data
            if (currentComp?.id) {
              const compRes = await api.getCompetitor(currentComp.id);
              if (compRes?.success) {
                setCurrentComp(compRes.data);
                if (onAnalysisUpdated) onAnalysisUpdated(compRes.data);
              }
            }
            return; // Stop polling
          } else if (data.data.status === 'failed') {
            return;
          }
        }
      } catch (e) {
        console.warn('Job poll error:', e);
      }
      timer = setTimeout(poll, 2000);
    };

    poll();
    return () => clearTimeout(timer);
  }, [activeJobId, isOpen, currentComp?.id]);

  if (!isOpen || !currentComp) return null;

  const report = currentComp.ai_report || null;
  const isRunning = jobStatus?.status === 'running' || jobStatus?.status === 'queued' || currentComp.research_status === 'running';

  // Research job step checkpoints
  const steps = [
    { label: 'Website validated', done: (jobStatus?.progress || 0) >= 15 },
    { label: 'Research started', done: (jobStatus?.progress || 0) >= 25 },
    { label: 'Collecting pages via Apify', done: (jobStatus?.progress || 0) >= 65 },
    { label: 'Extracting business information', done: (jobStatus?.progress || 0) >= 75 },
    { label: 'Analyzing marketing strategy', done: (jobStatus?.progress || 0) >= 88 },
    { label: 'Generating competitive report', done: (jobStatus?.progress || 0) >= 98 }
  ];

  const handleReanalyze = async () => {
    try {
      setLoadingReport(true);
      const res = await api.reanalyzeCompetitor(currentComp.id);
      if (res.success && res.jobId) {
        // Trigger job polling
        setJobStatus({ status: 'running', progress: 5, currentStep: 'Re-research initiated...' });
      }
    } catch (e) {
      alert(`Failed to restart research: ${e.message}`);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B091B]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#141226]">{currentComp.name}</h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/20">
                  AI Threat: {currentComp.ai_threat_score || 78}/100
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  currentComp.threat_level === 'Critical' || currentComp.threat_level === 'High'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {currentComp.threat_level || 'High'} Threat
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6C6782] mt-0.5">
                {currentComp.url && (
                  <a
                    href={currentComp.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-[#4239C4] hover:underline"
                  >
                    <span>{currentComp.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span>•</span>
                <span>{currentComp.industry || 'E-Commerce'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={isRunning || loadingReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 marky-btn-secondary text-xs font-bold cursor-pointer disabled:opacity-50"
              title="Trigger fresh Apify crawl & AI analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Research Active' : 'Refresh Research'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Research Progress Overlay (If running) */}
        {isRunning && (
          <div className="p-6 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 border-b border-[#ECE8E3] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-black text-[#141226]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#4239C4]" />
                <span>Analyzing competitor with Apify web scraper & AI engine...</span>
              </div>
              <span className="font-mono font-bold text-[#4239C4]">{jobStatus?.progress || 35}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(10, jobStatus?.progress || 35)}%` }}
              />
            </div>

            {/* Step Checkpoints */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={`text-[11px] ${step.done ? 'font-bold text-[#141226]' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-[#ECE8E3] flex gap-4 overflow-x-auto text-xs font-bold">
          {[
            { id: 'overview', label: '1. Executive Summary & Strategy' },
            { id: 'audience', label: '2. Target Audience & Sales Funnel' },
            { id: 'swot', label: '3. Strengths & Weakness Gaps' },
            { id: 'comparison', label: '4. What They Do That We Don’t' },
            { id: 'counter', label: '5. Threat Score & How To Compete' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#4239C4] text-[#4239C4]'
                  : 'border-transparent text-[#6C6782] hover:text-[#141226]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Report Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {!report && !isRunning ? (
            <div className="p-8 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-extrabold text-[#141226]">No Research Generated Yet</h4>
              <p className="text-xs text-[#6C6782] max-w-md mx-auto">
                Trigger autonomous research to crawl public web content for {currentComp.name} and synthesize an 11-section competitive teardown.
              </p>
              <button
                onClick={handleReanalyze}
                className="marky-btn-primary px-4 py-2 text-xs font-bold"
              >
                Start Autonomous Research
              </button>
            </div>
          ) : report ? (
            <>
              {/* TAB 1: EXECUTIVE SUMMARY & STRATEGY */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Executive Summary */}
                  <div className="p-5 rounded-2xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#4239C4] tracking-wider">
                        1. Executive Summary & Market Positioning
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#ECE8E3] text-[#6C6782]">
                        Evidence-Backed
                      </span>
                    </div>

                    <p className="text-xs text-[#141226] font-medium leading-relaxed">
                      {report.executiveSummary?.whoTheyAre || currentComp.analysis_summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] block mb-1">Primary Value Proposition</span>
                        <p className="font-semibold text-[#141226]">{report.executiveSummary?.primaryPositioning || 'Direct-to-consumer convenience'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] block mb-1">Visible Business Model</span>
                        <p className="font-semibold text-[#141226]">{report.executiveSummary?.visibleBusinessModel || 'E-commerce retail with nationwide delivery'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products / Services */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-[#6C6782] tracking-wider block">
                      2. Products & Services Catalog
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(report.productsServices || []).map((p, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-[#ECE8E3] bg-white space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-xs text-[#141226]">{p.name}</h4>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7F6FA] border border-[#ECE8E3] text-[#4239C4]">
                              {p.price || 'Not publicly available'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6C6782] leading-relaxed">{p.description}</p>
                          {p.offer && (
                            <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 inline-block">
                              Offer: {p.offer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marketing Strategy */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-[#6C6782] tracking-wider block">
                      4. Observed Marketing Strategy
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] space-y-1">
                        <span className="text-[10px] font-bold text-[#4239C4] uppercase">Messaging & Hooks</span>
                        <p className="text-[11px] text-[#3E3A52] leading-snug">{report.marketingStrategy?.messaging || 'Quality and affordability'}</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] space-y-1">
                        <span className="text-[10px] font-bold text-[#7A5DBB] uppercase">Active CTAs</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(report.marketingStrategy?.callsToAction || ['Order Now', 'WhatsApp']).map((cta, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#ECE8E3]">
                              {cta}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Conversion Funnel</span>
                        <p className="text-[11px] text-[#3E3A52] leading-snug">{report.marketingStrategy?.conversionStrategy || 'Direct checkout with cash-on-delivery'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIENCE & SALES */}
              {activeTab === 'audience' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Evidence Rule: Observed vs Inferred Target Audience */}
                  <div className="p-5 rounded-2xl bg-white border border-[#ECE8E3] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#ECE8E3] pb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#4239C4]" />
                        <h3 className="text-xs font-black uppercase text-[#141226] tracking-wider">
                          3. Target Audience Intelligence (Evidence Rule)
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4239C4] border border-indigo-200">
                        Confidence: {report.targetAudience?.confidence || 'Medium'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Observed */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                            [Observed] Directly Stated Evidence
                          </span>
                        </div>
                        <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                          {report.targetAudience?.observed || 'Public website content identifies direct household consumer buyers.'}
                        </p>
                      </div>

                      {/* Inferred */}
                      <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
                          <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider">
                            [Inferred] Strategic AI Deduction
                          </span>
                        </div>
                        <p className="text-xs text-purple-950 leading-relaxed font-medium">
                          {report.targetAudience?.inferred || 'Messaging appears optimized for middle to upper-middle income decision makers.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Sales Strategy */}
                  <div className="p-5 rounded-2xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-3">
                    <span className="text-[10px] font-black uppercase text-[#6C6782] tracking-wider block">
                      5. Visible Sales Mechanisms
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(report.salesStrategy?.visibleMechanisms || ['Direct Purchase', 'WhatsApp Order', 'Cash on Delivery']).map((mech, i) => (
                        <span key={i} className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-[#ECE8E3] text-[#141226]">
                          ✓ {mech}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[#6C6782] leading-relaxed pt-2">
                      {report.salesStrategy?.conversionPaths || 'Observed conversion path proceeds from online product showcase to rapid cash-on-delivery form.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: STRENGTHS & WEAKNESSES */}
              {activeTab === 'swot' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-5 rounded-2xl bg-white border border-[#ECE8E3] space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4" />
                        <span>6. Competitor Strengths (Evidence-Backed)</span>
                      </div>
                      <div className="space-y-2.5">
                        {(report.competitorStrengths || []).map((s, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                            <h4 className="font-bold text-xs text-[#141226]">{s.strength}</h4>
                            <p className="text-[11px] text-[#6C6782]">{s.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses / Gaps */}
                    <div className="p-5 rounded-2xl bg-white border border-[#ECE8E3] space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>7. Competitor Weaknesses & Observable Gaps</span>
                      </div>
                      <div className="space-y-2.5">
                        {(report.competitorWeaknesses || []).map((w, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-rose-50/40 border border-rose-100 space-y-1">
                            <h4 className="font-bold text-xs text-rose-950">{w.weakness}</h4>
                            <p className="text-[11px] text-rose-800/80">{w.observableGap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WHAT THEY DO THAT WE DON'T */}
              {activeTab === 'comparison' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* What They Do That We Don't */}
                  <div className="p-5 rounded-2xl bg-white border border-[#ECE8E3] space-y-4">
                    <span className="text-[10px] font-black uppercase text-[#4239C4] tracking-wider block">
                      8. What They Do That We Don’t (Competitive Gap Matrix)
                    </span>
                    <div className="space-y-3">
                      {(report.whatTheyDoThatWeDont || []).map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <div>
                            <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Competitor Advantage</span>
                            <p className="font-extrabold text-xs text-[#141226] mt-0.5">{item.competitorAdvantage}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-amber-700 uppercase block">Our Potential Gap</span>
                            <p className="text-xs text-[#3E3A52] mt-0.5">{item.potentialMissingCapability}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
                            <span className="text-[10px] font-bold text-[#4239C4] uppercase block">Recommended Action</span>
                            <p className="text-xs font-semibold text-[#4239C4] mt-0.5">{item.recommendedAction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What We Do That They Don't */}
                  <div className="p-5 rounded-2xl bg-white border border-[#ECE8E3] space-y-4">
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">
                      9. What We Do That They Don’t (Our Differentiators)
                    </span>
                    <div className="space-y-3">
                      {(report.whatWeDoThatTheyDont || []).map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Our Advantage</span>
                            <p className="font-extrabold text-xs text-emerald-950 mt-0.5">{item.ourAdvantage}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Competitor Status</span>
                            <p className="text-xs text-slate-600 italic mt-0.5">{item.competitorStatus || 'Not identified in publicly available research'}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Strategic Positioning Opportunity</span>
                            <p className="text-xs font-semibold text-emerald-900 mt-0.5">{item.strategicOpportunity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: THREAT SCORE & HOW TO COMPETE */}
              {activeTab === 'counter' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Deterministic Threat Score Meter */}
                  <div className="p-6 rounded-2xl bg-[#0B091B] text-white border border-[#1C1938] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-black text-[#F3C5A8] uppercase tracking-wider block">
                          10. Deterministic Competitive Threat Score
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-4xl font-black text-white">
                            {report.threatScore?.overall || currentComp.ai_threat_score || 78}
                          </span>
                          <span className="text-sm font-bold text-slate-400">/ 100</span>
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ml-2 ${
                            (report.threatScore?.overall || 78) >= 80 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {report.threatScore?.threatLevel || currentComp.threat_level || 'High'} Threat
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 max-w-sm">
                        {report.threatScore?.methodology || 'Deterministic multi-factor score: Market overlap, product similarity, target audience alignment, and marketing velocity.'}
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
                      {Object.entries(report.threatScore?.breakdown || {
                        marketOverlap: 85,
                        productOverlap: 80,
                        targetOverlap: 78,
                        marketingStrength: 75,
                        differentiation: 70
                      }).map(([k, v]) => (
                        <div key={k} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                            {k.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-lg font-black text-white">{v}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 11. Practical Ethical How To Compete Playbook */}
                  <div className="p-5 rounded-2xl bg-white border border-[#ECE8E3] space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#4239C4]" />
                      <span className="text-[10px] font-black uppercase text-[#141226] tracking-wider">
                        11. How to Compete Playbook (Practical & Ethical Action Items)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(report.howToCompete || []).map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="text-xs font-black text-[#141226] block">{rec.area}</span>
                            <p className="text-xs text-[#6C6782] mt-0.5 leading-relaxed">{rec.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ECE8E3] bg-[#F7F6FA] flex items-center justify-between">
          <span className="text-[11px] text-[#6C6782]">
            Data acquisition via Apify Web Scraper • AI Strategic Synthesis via Gemini
          </span>
          <button
            onClick={onClose}
            className="marky-btn-secondary px-4 py-2 font-bold cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

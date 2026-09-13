'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Target,
  ArrowRight,
  Workflow,
  Compass,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 animate-fadeIn text-white">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181438] border border-[#7A5DBB]/30 text-xs font-semibold text-[#D1C3FF]">
          <Sparkles className="w-3.5 h-3.5 text-[#A59FFF]" />
          <span>Product Philosophy & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Unifying Fragmented Marketing Into One Autonomous Command Center
        </h1>
        <p className="text-sm sm:text-base text-[#B4AFCC] leading-relaxed">
          Marky is an AI-native marketing intelligence and execution system built to eliminate the chaos of disconnected agency tools, spreadsheets, and manual copywriting.
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-[#110E2E]/80 border border-[#231B4D] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 font-bold">
            ⚠️
          </div>
          <h3 className="text-xl font-bold">The Problem: Fragmentation</h3>
          <p className="text-xs text-[#8E8AAB] leading-relaxed">
            Modern marketing teams juggle dozens of disconnected tools: one for ad copywriting, another for competitor price checking, separate tools for lead pipeline tracking, and expensive third-party graphic designers. Context is lost at every handoff, ad spend is wasted, and execution velocity grinds to a halt.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#110E2E]/80 border border-[#231B4D] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 flex items-center justify-center text-[#D1C3FF] font-bold">
            💡
          </div>
          <h3 className="text-xl font-bold">The Marky Solution</h3>
          <p className="text-xs text-[#8E8AAB] leading-relaxed">
            Marky grounds all marketing execution in persistent brand memory. Once your brand guidelines, product specifications, and target audience are stored, every ad script, competitor audit, and customer communication is synthesized with full strategic context in seconds.
          </p>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A59FFF]">
            Product Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">How the Platform is Structured</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-[#0F0C29] border border-[#211A4A] space-y-3">
            <Cpu className="w-6 h-6 text-[#A59FFF]" />
            <h4 className="text-sm font-bold text-white">Autonomous Agent Swarm</h4>
            <p className="text-[#8E8AAB] leading-relaxed">
              12 specialized agents handle distinct disciplines: Chief Marketing Officer, Performance Media Buyer, Creative Director, CRO Auditor, and B2B Prospector.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F0C29] border border-[#211A4A] space-y-3">
            <Workflow className="w-6 h-6 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Live Intelligence Scrapers</h4>
            <p className="text-[#8E8AAB] leading-relaxed">
              Real-time Google Maps and Meta Ads scrapers deliver verified local market contacts and competitive intelligence directly into your pipeline.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F0C29] border border-[#211A4A] space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Enterprise Data Isolation</h4>
            <p className="text-[#8E8AAB] leading-relaxed">
              Rigorous row-level tenant security, AES-256 encrypted credential vaults, and strict non-disclosure principles ensure your proprietary data remains safe.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-10 rounded-3xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-black">Experience Autonomous Marketing Intelligence</h3>
        <p className="text-xs text-white/90 max-w-xl mx-auto leading-relaxed">
          Create your workspace today and discover what happens when brand context, ad copywriting, and lead generation operate as one.
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#141226] font-bold text-xs shadow-lg hover:bg-slate-100 transition-colors"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

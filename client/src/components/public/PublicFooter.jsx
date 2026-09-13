'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-[#080614] border-t border-[#1C1838] text-[#8E8AAB] text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1A1636]">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4239C4] via-[#7A5DBB] to-[#F3C5A8] p-1 flex items-center justify-center shadow-lg shadow-[#4239C4]/20">
                <img
                  src="/marky-avatar.png"
                  alt="Marky"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <span className="text-lg font-black text-white tracking-tight">Marky</span>
            </Link>
            <p className="text-[#8E8AAB] text-xs leading-relaxed">
              Commercial-grade Autonomous Marketing Operating System. Unifying brand strategy, multi-platform ad generation, live competitor scrapers, and CRM workflows under one intelligent AI command center.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  AI Marketing Hub (97+ Tools)
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Creative Studio & Video Vault
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Autonomous Marketing Agents
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  CRM Pipeline & Lead Scoring
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Meta Ads & Maps Scrapers
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing & ROI Calculator
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Marky
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Enterprise Support
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Client Portal Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Data Isolation */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Security & Architecture</h4>
            <div className="p-4 rounded-2xl bg-[#110E29] border border-[#211B47] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#A59FFF]" />
                <span>Zero Private Data Training</span>
              </div>
              <p className="text-[11px] text-[#8E8AAB] leading-relaxed">
                Brand assets, CRM leads, and proprietary strategies are encrypted at rest with AES-256 and isolated strictly per workspace.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#A59FFF]">
              <Lock className="w-3.5 h-3.5" />
              <span>HMAC-SHA256 Tokenized Authentication</span>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Marky AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[#6C6782]">Privacy Policy</span>
            <span className="text-[#6C6782]">&middot;</span>
            <span className="text-[#6C6782]">Terms of Service</span>
            <span className="text-[#6C6782]">&middot;</span>
            <span className="text-[#6C6782]">Data Processing Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

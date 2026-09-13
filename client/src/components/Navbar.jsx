'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Key,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  X,
  Cpu
} from 'lucide-react';
import api from '../lib/api';

export default function Navbar({ onOpenAddBrand, onOpenAddCampaign }) {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [aiStatus, setAiStatus] = useState({ configured: false, mode: 'Local Engine' });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState('');

  useEffect(() => {
    loadBrands();
    loadAIStatus();

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marketpulse_active_brand');
      if (saved) setSelectedBrand(saved);
    }
  }, []);

  const loadBrands = async () => {
    try {
      const res = await api.getBrands();
      if (res.success) {
        setBrands(res.data);
      }
    } catch (e) {
      console.error('Navbar brands load error:', e);
    }
  };

  const loadAIStatus = async () => {
    try {
      const res = await api.getAIStatus();
      if (res.success) {
        setAiStatus(res);
      }
    } catch (e) {
      console.error('Navbar AI status error:', e);
    }
  };

  const handleBrandChange = (brandName) => {
    setSelectedBrand(brandName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketpulse_active_brand', brandName);
      const b = brands.find((item) => item.name === brandName);
      if (b) {
        localStorage.setItem('marketpulse_active_brand_id', b.id);
      } else {
        localStorage.removeItem('marketpulse_active_brand_id');
      }
      window.dispatchEvent(new Event('brandSelected'));
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setSavingKey(true);
    setKeyFeedback('');

    try {
      const res = await api.saveGeminiKey(apiKeyInput.trim());
      if (res.success) {
        setKeyFeedback('Gemini API key updated successfully!');
        loadAIStatus();
        setTimeout(() => {
          setShowKeyModal(false);
          setKeyFeedback('');
        }, 1200);
      }
    } catch (err) {
      setKeyFeedback(`Error: ${err.message}`);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#ECE8E3] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 marky-shadow-subtle">
        {/* Left: Active Brand Selector & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6C6782]">
            <span className="hidden sm:inline">Active Brand:</span>
            <div className="relative inline-block">
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="bg-[#F7F6FA] text-[#141226] text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl border border-[#ECE8E3] hover:border-[#7A5DBB]/50 focus:outline-hidden focus:ring-2 focus:ring-[#4239C4]/15 cursor-pointer transition-colors appearance-none"
              >
                <option value="All Brands">All Brands (Portfolio View)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.category})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6C6782] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Status Indicators */}
        <div className="flex items-center gap-2.5">
          {/* Gemini API Status Badge */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              aiStatus.configured
                ? 'bg-[#4239C4]/8 text-[#4239C4] border-[#4239C4]/25 hover:bg-[#4239C4]/12'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Click to configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {aiStatus.configured ? 'Gemini 3.1 Live' : 'Gemini: Fallback Engine'}
            </span>
            <span className={`w-2 h-2 rounded-full ${aiStatus.configured ? 'bg-[#10B981]' : 'bg-amber-500'}`}></span>
          </button>

          {/* Automate Goal (Orchestrator shortcut) */}
          <Link
            href="/workflows"
            className="flex items-center gap-1.5 bg-[#141226] hover:bg-[#201D38] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-[#D1C3FF]" />
            <span className="hidden sm:inline">Orchestrator</span>
          </Link>

          {/* Quick Action: New Campaign */}
          {onOpenAddCampaign && (
            <button
              onClick={onOpenAddCampaign}
              className="hidden md:flex items-center gap-1.5 marky-btn-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#7A5DBB]" />
              <span>New Campaign</span>
            </button>
          )}

          {/* Settings & Role Link */}
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECE8E3] hover:border-[#4239C4]/40 bg-[#F7F6FA] hover:bg-white text-xs font-bold text-[#141226] transition-all shadow-2xs"
            title="Open Platform Settings & Access Control"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-bold text-[#4239C4]">Settings</span>
          </Link>
        </div>
      </header>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-[#0B091B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#ECE8E3] overflow-hidden">
            <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#141226]">Google Gemini API Config</h3>
                  <p className="text-[11px] text-[#6C6782]">Free API Key for Marky intelligence & reasoning</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="p-5 space-y-4">
              <div className="p-3 bg-[#4239C4]/6 border border-[#4239C4]/20 rounded-xl text-xs text-[#3E3A52] space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-[#4239C4]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Status: {aiStatus.configured ? 'Gemini Key Configured & Ready' : 'Running on Built-in Smart Fallback Engine'}
                </p>
                <p className="text-[11px] text-[#6C6782]">
                  Marky uses Gemini 2.5/3.1/3.6 Flash for multi-agent marketing orchestration.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-[#F7F6FA] border border-[#ECE8E3] rounded-xl px-3.5 py-2 text-xs text-[#141226] placeholder-[#9894AD] focus:outline-hidden focus:ring-2 focus:ring-[#4239C4]/20 focus:border-[#4239C4]"
                />
              </div>

              {keyFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                  keyFeedback.includes('Error')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/30'
                }`}>
                  {keyFeedback}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#7A5DBB] hover:text-[#4239C4] flex items-center gap-1 font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#6C6782] hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingKey || !apiKeyInput.trim()}
                    className="marky-btn-primary px-4 py-1.5 text-xs font-bold disabled:opacity-50"
                  >
                    {savingKey ? 'Saving...' : 'Save & Verify'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

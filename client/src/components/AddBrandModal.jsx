'use client';

import React, { useState } from 'react';
import { X, Briefcase, Plus, Sparkles } from 'lucide-react';
import api from '../lib/api';
import Portal, { useBodyScrollLock } from './ui/Portal';

export default function AddBrandModal({ isOpen, onClose, onCreated }) {
  useBodyScrollLock(isOpen);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    industry: 'E-Commerce & Retail',
    category: 'Health & Organic Food',
    tier: 'Premium',
    description: '',
    website: '',
    product_service: '',
    pricing: 'PKR 2,500 - PKR 4,500',
    target_audience: 'Urban health-conscious consumers aged 22-45',
    target_locations: 'Lahore, Karachi, Islamabad',
    brand_voice: 'Direct, Authentic, Health-Focused',
    tone: 'Persuasive & Confident',
    brand_positioning: '100% Purity Guarantee with fast nationwide COD',
    competitors: 'Marhaba, Salman Honey, Organic Valley',
    usps: 'Cold-extracted, lab-certified pure, 48-hour delivery',
    key_messaging: 'Taste true purity without compromise.',
    keywords: 'pure honey, raw sidr, organic foods pakistan',
    social_platforms: 'TikTok Shop, Instagram, Meta, Daraz',
    marketing_goals: '4x Blended ROAS & 500 wholesale leads',
    business_goals: 'Lower COD return rate below 10%'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.createBrand(formData);
      if (res.success) {
        if (onCreated) onCreated(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to create brand');
      }
    } catch (err) {
      setError(err.message || 'Error creating brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#141226]">Add Brand Profile</h3>
              <p className="text-[11px] text-[#6C6782]">Autonomous marketing agents will use this context for all campaigns and copy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#ECE8E3] bg-[#FCFBFA] px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'basic' ? 'border-[#4239C4] text-[#4239C4]' : 'border-transparent text-[#6C6782] hover:text-slate-900'
            }`}
          >
            1. Core Identity & Market
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('strategy')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'strategy' ? 'border-[#4239C4] text-[#4239C4]' : 'border-transparent text-[#6C6782] hover:text-slate-900'
            }`}
          >
            2. Voice, USPs & Positioning
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'goals' ? 'border-[#4239C4] text-[#4239C4]' : 'border-transparent text-[#6C6782] hover:text-slate-900'
            }`}
          >
            3. Goals & Channels
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">{error}</div>}

          {activeTab === 'basic' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KMB Honey"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Registered Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. KMB Natural Foods Pvt Ltd"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic FMCG"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Product Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Health & Organic Food"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Market Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="Mass">Mass Market</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.pk"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of products, origins, and offering..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Brand Voice</label>
                  <input
                    type="text"
                    placeholder="e.g. Direct, Authentic, Health-Focused"
                    value={formData.brand_voice}
                    onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Tone</label>
                  <input
                    type="text"
                    placeholder="e.g. Persuasive, Confident"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Brand Positioning</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Raw Unfiltered Valleys Honey vs Supermarket Heated Syrups"
                  value={formData.brand_positioning}
                  onChange={(e) => setFormData({ ...formData, brand_positioning: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Unique Selling Propositions (USPs)</label>
                <input
                  type="text"
                  placeholder="e.g. Cold-extracted, lab-tested purity certificates, zero heat processing"
                  value={formData.usps}
                  onChange={(e) => setFormData({ ...formData, usps: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Competitors</label>
                <input
                  type="text"
                  placeholder="e.g. Marhaba Laboratories, Organic Valley PK"
                  value={formData.competitors}
                  onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Key Messaging</label>
                <input
                  type="text"
                  placeholder="e.g. Pure Valleys Sidr honey delivered to your doorstep in 48h with COD"
                  value={formData.key_messaging}
                  onChange={(e) => setFormData({ ...formData, key_messaging: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Urban health-conscious families aged 22-45"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Target Locations</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={formData.target_locations}
                    onChange={(e) => setFormData({ ...formData, target_locations: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Social & Ad Platforms</label>
                <input
                  type="text"
                  placeholder="e.g. TikTok Shop, Instagram, Facebook, Daraz"
                  value={formData.social_platforms}
                  onChange={(e) => setFormData({ ...formData, social_platforms: e.target.value })}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Marketing Goals</label>
                  <input
                    type="text"
                    placeholder="e.g. 4.0x ROAS & 500 qualified wholesale leads"
                    value={formData.marketing_goals}
                    onChange={(e) => setFormData({ ...formData, marketing_goals: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Business Goals</label>
                  <input
                    type="text"
                    placeholder="e.g. Keep COD return rates below 10%"
                    value={formData.business_goals}
                    onChange={(e) => setFormData({ ...formData, business_goals: e.target.value })}
                    className="marky-input w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#ECE8E3]">
            <span className="text-[10px] text-slate-400">
              * Required fields. All data is stored in your private local SQLite database.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white font-bold shadow-md shadow-indigo-900/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving Brand...' : 'Create Brand Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Portal>
);
}

'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import api from '../lib/api';

export default function AddCampaignModal({ isOpen, onClose, onCreated, brands = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    brand_id: '',
    objective: 'Direct E-commerce Sales',
    status: 'Active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: 150000,
    currency: 'PKR',
    platforms: ['TikTok', 'Meta Facebook', 'Instagram'],
    target_audience: 'Urban families & online buyers',
    target_geography: 'Lahore, Karachi, Islamabad, Faisalabad',
    auto_generate_blueprint: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (brands.length > 0 && !formData.brand_id) {
      setFormData((prev) => ({ ...prev, brand_id: brands[0].id }));
    }
  }, [brands]);

  if (!isOpen) return null;

  const handlePlatformToggle = (plat) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(plat);
      return {
        ...prev,
        platforms: exists ? prev.platforms.filter((p) => p !== plat) : [...prev.platforms, plat]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.createCampaign({
        ...formData,
        platforms: formData.platforms.join(', ')
      });

      if (res.success && res.data) {
        // If auto-generate blueprint is enabled, trigger blueprint generation
        if (formData.auto_generate_blueprint) {
          try {
            await api.generateCampaignBlueprint({
              campaignId: res.data.id,
              brandId: formData.brand_id,
              name: formData.name,
              objective: formData.objective,
              budget: formData.budget,
              currency: formData.currency,
              platforms: formData.platforms.join(', '),
              targetAudience: formData.target_audience,
              targetGeography: formData.target_geography
            });
          } catch (bpErr) {
            console.warn('Blueprint auto-gen warning:', bpErr);
          }
        }

        if (onCreated) onCreated(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError(err.message || 'Error creating campaign');
    } finally {
      setLoading(false);
    }
  };

  const platformOptions = ['TikTok', 'Meta Facebook', 'Instagram', 'Daraz Sponsored', 'Google Search', 'WhatsApp Blast'];

  return (
    <div className="fixed inset-0 z-50 bg-[#0B091B]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#ECE8E3] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#141226]">Launch New Marketing Campaign</h3>
              <p className="text-[11px] text-[#6C6782]">Track budgets, platforms, and sales goals</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Ramadan Flash Sale Blitz 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Workspace</label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Objective</label>
              <select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
              >
                <option>Direct E-commerce Sales</option>
                <option>Daraz Catalog Sales</option>
                <option>Video Views & Awareness</option>
                <option>Traffic & Retargeting</option>
                <option>Lead Generation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Budget</label>
              <div className="flex gap-1.5">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                >
                  <option>PKR</option>
                  <option>USD</option>
                </select>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
              <input
                type="text"
                placeholder="e.g., Families, Ramadan shoppers, tech professionals"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Cities / Geography</label>
              <input
                type="text"
                placeholder="e.g., Lahore, Karachi, Islamabad"
                value={formData.target_geography}
                onChange={(e) => setFormData({ ...formData, target_geography: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Target Channels / Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((plat) => {
                const isSelected = formData.platforms.includes(plat);
                return (
                  <button
                    type="button"
                    key={plat}
                    onClick={() => handlePlatformToggle(plat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-[#4239C4]'
                    }`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Multi-Platform Ad Blueprint Toggle */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#4239C4]/10 via-[#7A5DBB]/10 to-[#FFC4DA]/15 border border-[#4239C4]/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4239C4] text-white flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#141226]">Auto-Generate Multi-Platform Ad Kit with AI</p>
                <p className="text-[10px] text-[#6C6782]">Creates ready-to-copy Meta copy, TikTok hooks, and Google Search keywords</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.auto_generate_blueprint}
                onChange={(e) => setFormData({ ...formData, auto_generate_blueprint: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4239C4]"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ECE8E3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
            >
              {loading ? 'Launching...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

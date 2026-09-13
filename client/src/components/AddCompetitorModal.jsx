'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, Globe, Compass } from 'lucide-react';
import api from '../lib/api';
import Portal, { useBodyScrollLock } from './ui/Portal';

export default function AddCompetitorModal({ isOpen, onClose, onCreated }) {
  useBodyScrollLock(isOpen);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    threat_level: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.createCompetitor({
        name: formData.name.trim(),
        url: formData.url.trim(),
        threat_level: formData.threat_level
      });

      if (res.success) {
        if (onCreated) onCreated(res.data, res.jobId);
        onClose();
      } else {
        setError(res.error || 'Failed to start competitor research');
      }
    } catch (err) {
      setError(err.message || 'Error starting competitor research');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#141226]">Add Competitor for AI Research</h3>
              <p className="text-[11px] text-[#6C6782]">Automated Apify crawl & strategic intelligence report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Competitor Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Competitor Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. J. or Marhaba Laboratories"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Competitor Website URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="marky-input w-full pl-9 pr-3 text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Apify scraper will collect permitted public pages within domain bounds.
            </p>
          </div>

          {/* Threat Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Initial Threat Level (Manual Assessment)
            </label>
            <select
              value={formData.threat_level}
              onChange={(e) => setFormData({ ...formData, threat_level: e.target.value })}
              className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
            >
              <option value="Low">Low Threat</option>
              <option value="Medium">Medium Threat</option>
              <option value="High">High Threat</option>
              <option value="Critical">Critical Threat</option>
            </select>
            <div className="p-2.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] mt-2 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#4239C4] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#6C6782] leading-normal">
                Your threat level is an initial assessment. After research, AI will compute an objective <strong>AI Threat Score (0–100)</strong> based on retrieved evidence.
              </p>
            </div>
          </div>

          {/* Footer CTA */}
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
              disabled={loading || !formData.name.trim()}
              className="marky-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{loading ? 'Starting Research...' : 'Analyze Competitor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Portal>
);
}

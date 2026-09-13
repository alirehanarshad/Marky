'use client';

import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import api from '../lib/api';
import Portal, { useBodyScrollLock } from './ui/Portal';

export default function AddLeadModal({ isOpen, onClose, onCreated }) {
  useBodyScrollLock(isOpen);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'Lead',
    category: 'Retail E-commerce',
    rating: 4.8,
    website: '',
    city: 'Lahore'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.createLead(formData);
      if (res.success) {
        if (onCreated) onCreated(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to add lead');
      }
    } catch (err) {
      setError(err.message || 'Error adding lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#141226]">Add CRM Lead / Partner</h3>
                <p className="text-[11px] text-[#6C6782]">Record B2B client, wholesale buyer, or vendor</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Business or Contact Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Al-Kareem Bridal Emporium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
              <input
                type="text"
                placeholder="Lahore, Karachi, etc."
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pipeline Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
              >
                <option>Lead</option>
                <option>Prospect</option>
                <option>Customer</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <input
                type="text"
                placeholder="Bridal, Organic, Apparel"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="contact@business.pk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Website or Instagram URL</label>
            <input
              type="text"
              placeholder="https://instagram.com/..."
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
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
              {loading ? 'Adding...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Portal>
);
}

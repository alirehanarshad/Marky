'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Users,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  Phone,
  Star,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  CheckSquare,
  Square,
  Sliders,
  X,
  Compass,
  AlertCircle,
  Globe
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

const PRESET_CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];
const PRESET_CATEGORIES = ['Clothing stores', 'Organic Honey', 'Leather Goods', 'Bridal Boutiques', 'Beauty & Skincare', 'Pharmacies'];

const DATA_FIELDS = [
  { id: 'name', label: 'Business name', defaultChecked: true },
  { id: 'address', label: 'Address', defaultChecked: true },
  { id: 'phone', label: 'Phone', defaultChecked: true },
  { id: 'website', label: 'Website', defaultChecked: true },
  { id: 'google_maps_url', label: 'Google Maps URL', defaultChecked: true },
  { id: 'category', label: 'Category', defaultChecked: true },
  { id: 'rating', label: 'Rating', defaultChecked: true },
  { id: 'reviews', label: 'Review count', defaultChecked: true },
  { id: 'opening_hours', label: 'Opening hours', defaultChecked: false },
  { id: 'description', label: 'Description', defaultChecked: false }
];

export default function MapScrapersPage() {
  // Scraper Form State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Clothing stores');
  const [location, setLocation] = useState('Islamabad');
  const [maxResults, setMaxResults] = useState(25);
  const [selectedFields, setSelectedFields] = useState(
    DATA_FIELDS.filter(f => f.defaultChecked).map(f => f.id)
  );

  // Job & Progress State
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobProgress, setJobProgress] = useState(null);
  const [scraping, setScraping] = useState(false);

  // Results & Selection State
  const [results, setResults] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [importedMap, setImportedMap] = useState({});
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);

  // Initial load
  useEffect(() => {
    loadLocalRecent();
  }, []);

  const loadLocalRecent = async () => {
    try {
      const res = await api.searchMapLeads('Lahore', 'All');
      if (res.success && res.data?.length) {
        setResults(res.data);
      }
    } catch (e) {}
  };

  // Poll active scraping job
  useEffect(() => {
    if (!activeJobId) return;

    let timer;
    const pollJob = async () => {
      try {
        const res = await api.getJobStatus(activeJobId);
        if (res.success && res.data) {
          setJobProgress(res.data);
          if (res.data.status === 'completed') {
            setScraping(false);
            const leads = res.data.result?.leads || [];
            setResults(leads);
            setActiveJobId(null);
            return;
          } else if (res.data.status === 'failed' || res.data.status === 'cancelled') {
            setScraping(false);
            setActiveJobId(null);
            alert(`Scraping ended: ${res.data.error || 'Operation stopped'}`);
            return;
          }
        }
      } catch (err) {
        console.warn('Job poll error:', err);
      }
      timer = setTimeout(pollJob, 2000);
    };

    pollJob();
    return () => clearTimeout(timer);
  }, [activeJobId]);

  const handleStartScrape = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !location.trim()) return;

    setScraping(true);
    setShowConfigModal(false);
    setImportMsg(null);
    setSelectedIndices(new Set());

    try {
      const res = await api.startMapsScrape({
        query: searchQuery.trim(),
        city: location.trim(),
        category: searchQuery.trim(),
        maxResults: Number(maxResults),
        requestedFields: selectedFields
      });

      if (res.success && res.jobId) {
        setActiveJobId(res.jobId);
        setJobProgress({
          status: 'running',
          progress: 10,
          currentStep: `Initializing Google Maps search for "${searchQuery}" in ${location}...`
        });
      }
    } catch (err) {
      setScraping(false);
      alert(`Failed to start scraper: ${err.message}`);
    }
  };

  // Selection handlers
  const handleToggleSelect = (idx) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === results.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(results.map((_, i) => i)));
    }
  };

  // CRM Import handlers
  const handleImportSelected = async () => {
    const leadsToImport = Array.from(selectedIndices).map(idx => results[idx]).filter(Boolean);
    if (leadsToImport.length === 0) {
      alert('Please select at least one lead to import.');
      return;
    }
    await executeImport(leadsToImport);
  };

  const handleImportAll = async () => {
    if (results.length === 0) return;
    await executeImport(results);
  };

  const executeImport = async (leads) => {
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await api.importLeads(
        leads.map(l => ({
          name: l.name || l.company,
          company: l.company || l.name,
          phone: l.phone,
          website: l.website,
          city: l.city || location,
          category: l.category || searchQuery,
          rating: l.rating,
          source: 'Google Maps',
          provider: 'Apify',
          source_id: l.source_id,
          source_url: l.google_maps_url || l.source_url
        }))
      );

      if (res.success) {
        setImportMsg({
          type: 'success',
          text: `Successfully processed ${res.count} leads: ${res.imported} inserted, ${res.updated} updated duplicates.`
        });
        const updated = { ...importedMap };
        leads.forEach(l => { updated[l.name] = true; });
        setImportedMap(updated);
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: `Import failed: ${err.message}` });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Apify Google Maps Lead Discovery & Pipeline Sync"
        badgeIcon={MapPin}
        title="Maps Scraper"
        description="Extract verified local businesses, retail stores, boutiques, and distributors across Pakistani cities with contact info, reviews, and 1-click CRM pipeline sync."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              disabled={scraping}
              className="flex items-center gap-1.5 px-4 py-2 marky-btn-primary text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>Scrape Maps</span>
            </button>
          </div>
        }
      />

      {/* 2. Active Scraping Progress Card */}
      {scraping && (
        <div className="marky-card p-6 bg-gradient-to-r from-teal-50/50 via-white to-indigo-50/50 border-l-4 border-l-teal-600 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-black text-[#141226]">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Scraping Google Maps via Apify Crawler Engine</span>
            </div>
            <span className="font-mono font-bold text-teal-700">{jobProgress?.progress || 15}%</span>
          </div>

          <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-[#4239C4] h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(10, jobProgress?.progress || 15)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#6C6782]">
            <span><strong>Status:</strong> {jobProgress?.status || 'Running'}</span>
            <span>{jobProgress?.currentStep || 'Extracting listings...'}</span>
          </div>
        </div>
      )}

      {/* 3. Feedback Banner */}
      {importMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn ${
          importMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{importMsg.text}</span>
          </div>
          <Link href="/crm" className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-bold">
            <span>View in CRM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Results Action Toolbar */}
      <div className="marky-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#6C6782]">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 font-bold text-[#141226] hover:text-[#4239C4] cursor-pointer"
          >
            {selectedIndices.size === results.length && results.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#4239C4]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All ({selectedIndices.size} selected)</span>
          </button>
          <span>•</span>
          <span>Showing <strong>{results.length}</strong> verified places</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleImportSelected}
            disabled={importing || selectedIndices.size === 0}
            className="px-3.5 py-1.5 marky-btn-secondary text-xs font-bold cursor-pointer disabled:opacity-40"
          >
            {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
            <span>Import Selected ({selectedIndices.size})</span>
          </button>

          <button
            onClick={handleImportAll}
            disabled={importing || results.length === 0}
            className="px-4 py-1.5 marky-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
          >
            {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Import All to CRM</span>
          </button>
        </div>
      </div>

      {/* 5. Results Table */}
      {results.length === 0 && !scraping ? (
        <EmptyState
          icon={MapPin}
          title="No Map Leads Scraped Yet"
          description="Click 'Scrape Maps' to configure search keywords, target city or neighborhood, and run the asynchronous Apify crawler."
          actionText="Scrape Maps"
          onAction={() => setShowConfigModal(true)}
        />
      ) : (
        <div className="marky-card overflow-hidden border border-[#ECE8E3]">
          <div className="overflow-x-auto">
            <table className="marky-table">
              <thead>
                <tr>
                  <th className="w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedIndices.size === results.length && results.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#4239C4]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Website</th>
                  <th>Rating</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((lead, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  const isImported = importedMap[lead.name];

                  return (
                    <tr key={idx} className={isSelected ? 'bg-indigo-50/40' : ''}>
                      {/* Checkbox */}
                      <td className="text-center">
                        <button
                          onClick={() => handleToggleSelect(idx)}
                          className="cursor-pointer text-slate-400 hover:text-[#4239C4]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#4239C4]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Business Name & Source ID */}
                      <td>
                        <div className="font-extrabold text-xs text-[#141226]">{lead.name}</div>
                        <div className="font-mono text-[10px] text-[#6C6782]">
                          ID: {lead.source_id || `place_${idx}`}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="text-xs text-[#3E3A52] font-semibold">
                          {lead.category || 'Retail Store'}
                        </span>
                      </td>

                      {/* Location / Address */}
                      <td>
                        <span className="text-xs text-[#6C6782] line-clamp-1 max-w-xs">
                          {lead.address || lead.city || 'Pakistan'}
                        </span>
                      </td>

                      {/* Phone */}
                      <td>
                        <span className="font-mono text-xs text-[#141226]">
                          {lead.phone || 'Not publicly listed'}
                        </span>
                      </td>

                      {/* Website */}
                      <td>
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#4239C4] hover:underline"
                          >
                            <span>{lead.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 18)}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{lead.rating || 4.5}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({lead.reviews || 10})</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        <button
                          onClick={() => executeImport([lead])}
                          disabled={isImported || importing}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isImported
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-[#0B091B] hover:bg-[#4239C4] text-white shadow-xs'
                          }`}
                        >
                          {isImported ? 'In CRM' : 'Import'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#0B091B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#ECE8E3] overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-[#4239C4] text-white flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#141226]">Configure Google Maps Scraper</h3>
                  <p className="text-[11px] text-[#6C6782]">Asynchronous Apify crawler configuration</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleStartScrape} className="p-6 space-y-4 text-xs">
              {/* Search Query */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Search Query / Business Category *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clothing stores, Bridal Boutiques, Organic Honey..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSearchQuery(cat)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F7F6FA] text-[#6C6782] hover:text-[#4239C4] border border-[#ECE8E3] cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Location (City, Area, or Neighborhood) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Islamabad, DHA Lahore, Clifton Karachi..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="marky-input w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_CITIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setLocation(c)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F7F6FA] text-[#6C6782] hover:text-[#4239C4] border border-[#ECE8E3] cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maximum Results */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Maximum Results
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[25, 50, 100, 250, 500].map(limit => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setMaxResults(limit)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        maxResults === limit
                          ? 'bg-[#0B091B] text-white border-[#0B091B] shadow-xs'
                          : 'bg-white text-[#6C6782] border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Fields Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Requested Data Fields
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                  {DATA_FIELDS.map(f => {
                    const isChecked = selectedFields.includes(f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedFields(selectedFields.filter(id => id !== f.id));
                            } else {
                              setSelectedFields([...selectedFields, f.id]);
                            }
                          }}
                          className="rounded text-[#4239C4] focus:ring-0"
                        />
                        <span className="text-[11px] text-[#3E3A52] font-medium">{f.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ECE8E3]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="marky-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Start Scraping</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

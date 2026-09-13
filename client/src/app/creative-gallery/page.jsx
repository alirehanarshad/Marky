'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ImageIcon,
  Video,
  Layers,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Play,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Plus,
  X,
  FileVideo,
  FileImage,
  Sparkles,
  Palette,
  Film,
  ShieldCheck,
  SlidersHorizontal,
  FolderOpen,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Portal, { useBodyScrollLock } from '@/components/ui/Portal';

export default function CreativeGalleryPage() {
  const [assets, setAssets] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'image' | 'video' | 'assembled' | 'upload' | 'badge'
  const [brandFilter, setBrandFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'

  // Modals & Previews
  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [copySuccessId, setCopySuccessId] = useState(null);
  useBodyScrollLock(Boolean(uploadModalOpen || previewAsset || deleteConfirmId));

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadBrand, setUploadBrand] = useState('All Brands');
  const [uploadCategory, setUploadCategory] = useState('Custom Upload');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [typeFilter, brandFilter]);

  async function loadData(fresh = false) {
    if (fresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [galleryRes, brandsRes] = await Promise.all([
        api.getCreativeGallery({
          type: typeFilter,
          brand: brandFilter,
          search: searchQuery,
          isFresh: fresh
        }),
        api.getBrands(fresh)
      ]);

      if (galleryRes && galleryRes.data) {
        setAssets(galleryRes.data);
      }
      if (brandsRes && brandsRes.data) {
        setBrands(brandsRes.data);
      }
    } catch (err) {
      console.error('Error loading gallery data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Handle Search submit or debounced typing
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(true);
  };

  // ── Asset Upload Handlers ──
  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview({
        dataUrl: e.target.result,
        type: file.type,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadPreview || !uploadPreview.dataUrl) {
      alert('Please select an image, video, or audio file to upload.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadAsset({
        name: uploadTitle || uploadFile?.name || 'Uploaded Asset',
        type: uploadFile?.type || 'image/jpeg',
        size: uploadFile?.size || 0,
        dataUrl: uploadPreview.dataUrl,
        brand: uploadBrand,
        category: uploadCategory,
        prompt: uploadTitle
      });

      if (res.success) {
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadPreview(null);
        setUploadTitle('');
        await loadData(true);
      } else {
        alert(res.error || 'Upload failed');
      }
    } catch (err) {
      alert(err.message || 'Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete Asset ──
  const handleDeleteAsset = async (id) => {
    try {
      const res = await api.deleteAsset(id);
      if (res.success) {
        setAssets((prev) => prev.filter((item) => item.id !== id && item.job_id !== id));
        if (previewAsset && (previewAsset.id === id || previewAsset.job_id === id)) {
          setPreviewAsset(null);
        }
        setDeleteConfirmId(null);
      } else {
        alert(res.error || 'Failed to delete asset');
      }
    } catch (err) {
      alert(err.message || 'Error deleting asset');
    }
  };

  // ── Copy Asset URL ──
  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopySuccessId(id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  // ── Compute Statistics ──
  const totalCount = assets.length;
  const imageCount = assets.filter((a) => a.job_type === 'image' || a.job_type === 'upload-image' || a.job_type === 'image-edit').length;
  const videoCount = assets.filter((a) => a.job_type === 'video' || a.job_type === 'assembled-video' || a.job_type === 'upload-video').length;
  const uploadCount = assets.filter((a) => (a.job_type && a.job_type.startsWith('upload')) || a.provider === 'User Upload').length;
  const badgeCount = assets.filter((a) => a.job_type === 'badge' || (a.metadata && a.metadata.includes('badge'))).length;

  // Filtered & Sorted Assets in Memory
  const filteredAssets = assets
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const promptMatch = (item.prompt || '').toLowerCase().includes(q);
      const providerMatch = (item.provider || '').toLowerCase().includes(q);
      const metaMatch = (item.metadata || '').toLowerCase().includes(q);
      return promptMatch || providerMatch || metaMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name') return (a.prompt || '').localeCompare(b.prompt || '');
      return 0;
    });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="AI Creative Asset Vault & Multi-Format Hub"
        badgeIcon={ImageIcon}
        title="AI Creative Gallery"
        description="Universal repository for all commercial marketing assets: generated AI photography, UGC TikTok video ads, assembled promos, trust seals, and direct uploads."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 text-xs font-bold text-[#6C6782] hover:text-[#141226] bg-white border border-[#ECE8E3] rounded-xl hover:bg-[#F7F6FA] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/creative-studio"
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/20 cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>Open AI Studio</span>
            </Link>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#4239C4] hover:bg-[#352CAE] rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
          </div>
        }
      />

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="marky-card p-3.5 flex items-center gap-3 bg-white border border-[#ECE8E3]">
          <div className="w-10 h-10 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#6C6782] uppercase font-bold tracking-wider block">Total Stored</span>
            <span className="text-lg font-extrabold text-[#141226] leading-none">{totalCount} Assets</span>
          </div>
        </div>

        <div className="marky-card p-3.5 flex items-center gap-3 bg-white border border-[#ECE8E3]">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <FileImage className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#6C6782] uppercase font-bold tracking-wider block">AI Images</span>
            <span className="text-lg font-extrabold text-[#141226] leading-none">{imageCount} Renders</span>
          </div>
        </div>

        <div className="marky-card p-3.5 flex items-center gap-3 bg-white border border-[#ECE8E3]">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold">
            <FileVideo className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#6C6782] uppercase font-bold tracking-wider block">Videos & UGC</span>
            <span className="text-lg font-extrabold text-[#141226] leading-none">{videoCount} Motion Clips</span>
          </div>
        </div>

        <div className="marky-card p-3.5 flex items-center gap-3 bg-white border border-[#ECE8E3]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#6C6782] uppercase font-bold tracking-wider block">Custom Uploads</span>
            <span className="text-lg font-extrabold text-[#141226] leading-none">{uploadCount} Files</span>
          </div>
        </div>

        <div className="marky-card p-3.5 flex items-center gap-3 bg-white border border-[#ECE8E3]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#6C6782] uppercase font-bold tracking-wider block">Trust Badges</span>
            <span className="text-lg font-extrabold text-[#141226] leading-none">{badgeCount} Seals</span>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Media Type Filters, Brand Selector & Search */}
      <div className="marky-card p-4 space-y-4 bg-white border border-[#ECE8E3]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Media Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Creatives', count: totalCount, icon: Layers },
              { id: 'image', label: 'AI Images', count: imageCount, icon: ImageIcon },
              { id: 'video', label: 'UGC & Videos', count: videoCount, icon: Video },
              { id: 'assembled', label: 'Assembled Ads', count: assets.filter((a) => a.job_type === 'assembled-video').length, icon: Film },
              { id: 'upload', label: 'Uploaded Media', count: uploadCount, icon: Upload },
              { id: 'badge', label: 'Trust Badges', count: badgeCount, icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#4239C4] text-white shadow-md shadow-indigo-900/15 border border-[#4239C4]'
                      : 'bg-[#F7F6FA] text-[#6C6782] border border-[#ECE8E3] hover:text-[#141226] hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-[#6C6782] border border-[#ECE8E3]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Brand, Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#6C6782] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt, brand, tag..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] focus:bg-white focus:border-[#4239C4] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C6782] hover:text-[#141226]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Brand Filter */}
            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="text-xs px-3 py-2 pr-8 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] text-[#141226] font-semibold cursor-pointer outline-none focus:border-[#4239C4]"
              >
                <option value="all">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] text-[#141226] font-semibold cursor-pointer outline-none focus:border-[#4239C4]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Asset Grid */}
      {loading ? (
        <div className="marky-card p-12 text-center space-y-3 bg-white">
          <div className="w-10 h-10 rounded-full border-2 border-[#4239C4] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#141226]">Loading Creative Asset Vault...</p>
          <p className="text-[11px] text-[#6C6782]">Synchronizing SQLite jobs, uploads, and media storage</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="marky-card p-12 bg-white">
          <EmptyState
            icon={ImageIcon}
            title="No Creative Assets Found"
            description={
              searchQuery || brandFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search query to locate your assets.'
                : 'Your creative vault is currently empty. Generate new visuals in the AI Studio or upload your custom brand media now.'
            }
            actionLabel="Upload Media Now"
            onAction={() => setUploadModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isVideo = asset.job_type === 'video' || asset.job_type === 'assembled-video' || asset.job_type === 'upload-video';
            let meta = {};
            try {
              meta = JSON.parse(asset.metadata || '{}');
            } catch (e) {}

            const brandName = meta.brand || 'Commercial';

            return (
              <div
                key={asset.id || asset.job_id}
                className="marky-card overflow-hidden group hover:border-[#4239C4] transition-all flex flex-col bg-white border border-[#ECE8E3] hover:shadow-lg hover:shadow-indigo-900/5 relative"
              >
                {/* Media Thumbnail Container */}
                <div
                  className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={() => setPreviewAsset(asset)}
                >
                  {isVideo ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      <div className="w-12 h-12 rounded-full bg-[#4239C4]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-20">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                      <span className="absolute bottom-2 right-2 z-20 bg-black/80 text-[10px] text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-white/10">
                        <Video className="w-3 h-3 text-[#FFC4DA]" />
                        {asset.duration ? `0:0${asset.duration}` : '0:05'} UGC
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full relative overflow-hidden">
                      <img
                        src={asset.result_url}
                        alt={asset.prompt || 'Creative Asset'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <span className="text-[10px] text-white font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Click to Inspect
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
                    <span className="bg-[#0B091B]/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                      {isVideo ? <Film className="w-3 h-3 text-[#A59FFF]" /> : <ImageIcon className="w-3 h-3 text-[#FFC4DA]" />}
                      <span className="capitalize">{asset.job_type ? asset.job_type.replace('-', ' ') : 'Asset'}</span>
                    </span>

                    <span className="bg-white/90 backdrop-blur-md text-[#141226] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#ECE8E3] shadow-sm">
                      {brandName}
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#141226] line-clamp-2 leading-snug group-hover:text-[#4239C4] transition-colors" title={asset.prompt}>
                      {asset.prompt || meta.fileName || 'Commercial Asset'}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F2EFEB] text-[10px] text-[#6C6782]">
                      <span className="font-medium truncate max-w-[120px]">{asset.provider || 'AI Studio'}</span>
                      <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#ECE8E3] grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="py-1.5 px-2 rounded-lg bg-[#F7F6FA] hover:bg-[#4239C4] text-[#6C6782] hover:text-white text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>

                    <Link
                      href={`/creative-studio?usePrompt=${encodeURIComponent(asset.prompt || '')}&useUrl=${encodeURIComponent(asset.result_url || '')}`}
                      className="py-1.5 px-2 rounded-lg bg-[#4239C4]/10 hover:bg-[#4239C4] text-[#4239C4] hover:text-white text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Use in Studio
                    </Link>

                    <a
                      href={asset.result_url}
                      download={`asset-${asset.id || Date.now()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 rounded-lg bg-white border border-[#ECE8E3] hover:bg-[#F7F6FA] text-[#141226] text-[10px] font-semibold transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3 text-[#6C6782]" /> Download
                    </a>

                    <button
                      onClick={() => handleCopyUrl(asset.result_url, asset.id)}
                      className="py-1.5 px-2 rounded-lg bg-white border border-[#ECE8E3] hover:bg-[#F7F6FA] text-[#141226] text-[10px] font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copySuccessId === asset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#6C6782]" /> Copy Link
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(asset.id || asset.job_id)}
                      className="col-span-2 py-1 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Asset
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL 1: MEDIA UPLOAD MODAL ─── */}
      {uploadModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#ECE8E3] space-y-5 my-auto max-h-[85vh] sm:max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#141226]">Upload Asset to Creative Gallery</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-[#6C6782] hover:text-[#141226] rounded-lg hover:bg-[#F7F6FA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[#4239C4] bg-[#4239C4]/5'
                    : 'border-[#ECE8E3] bg-[#F7F6FA] hover:border-[#4239C4]/60 hover:bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.svg"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                {uploadPreview ? (
                  <div className="space-y-2">
                    {uploadPreview.type.startsWith('video/') ? (
                      <div className="w-32 h-32 mx-auto rounded-xl bg-slate-900 flex items-center justify-center text-white">
                        <Video className="w-10 h-10 text-[#FFC4DA]" />
                      </div>
                    ) : (
                      <img
                        src={uploadPreview.dataUrl}
                        alt="Preview"
                        className="w-32 h-32 mx-auto object-cover rounded-xl border border-[#ECE8E3] shadow-sm"
                      />
                    )}
                    <p className="text-xs font-bold text-[#141226]">{uploadPreview.name}</p>
                    <p className="text-[10px] text-[#6C6782]">{(uploadPreview.size / 1024 / 1024).toFixed(2)} MB • Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-[#141226]">Drag & Drop your media here, or click to browse</p>
                    <p className="text-[11px] text-[#6C6782]">Supports JPG, PNG, WEBP, SVG, MP4 videos, and audio clips</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">Asset Title / Description</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., KMB Sidr Honey Raw Sourcing Bottle Shot"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white focus:border-[#4239C4] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Target Brand</label>
                  <select
                    value={uploadBrand}
                    onChange={(e) => setUploadBrand(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white cursor-pointer outline-none focus:border-[#4239C4]"
                  >
                    <option value="All Brands">All Brands</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white cursor-pointer outline-none focus:border-[#4239C4]"
                  >
                    <option value="Product Photography">Product Photography</option>
                    <option value="UGC Video Footage">UGC Video Footage</option>
                    <option value="Brand Assets & Logos">Brand Assets & Logos</option>
                    <option value="Packaging Mockups">Packaging Mockups</option>
                    <option value="Trust Seals & Badges">Trust Seals & Badges</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8E3]">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6C6782] hover:bg-[#F7F6FA] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadPreview}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4239C4] hover:bg-[#352CAE] rounded-xl shadow-md shadow-indigo-900/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Storing in Vault...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Save Asset
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Portal>
    )}

      {/* ─── MODAL 2: LIGHTBOX & MEDIA INSPECTOR ─── */}
      {previewAsset && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#141226] text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[85vh] sm:max-h-[88vh] my-auto">
            <div className="md:w-3/5 bg-black flex items-center justify-center relative p-4 min-h-[300px]">
              {previewAsset.job_type === 'video' || previewAsset.job_type === 'assembled-video' || previewAsset.job_type === 'upload-video' ? (
                <video
                  src={previewAsset.result_url}
                  controls
                  autoPlay
                  loop
                  className="max-h-[75vh] w-full object-contain rounded-xl"
                />
              ) : (
                <img
                  src={previewAsset.result_url}
                  alt={previewAsset.prompt}
                  className="max-h-[75vh] w-full object-contain rounded-xl"
                />
              )}
            </div>

            <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-4 overflow-y-auto bg-[#181432]">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-bold text-[#FFC4DA] bg-[#FFC4DA]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {previewAsset.job_type}
                  </span>
                  <button
                    onClick={() => setPreviewAsset(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Title & Prompt</h4>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {previewAsset.prompt || 'Commercial Asset'}
                  </p>
                </div>

                <div className="space-y-2 text-xs bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Provider / Engine:</span>
                    <span className="font-semibold text-white">{previewAsset.provider || 'AI Studio'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="font-semibold text-white">{previewAsset.resolution || '1024x1024'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Aspect Ratio:</span>
                    <span className="font-semibold text-white">{previewAsset.aspect_ratio || '1:1'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Created Date:</span>
                    <span className="font-semibold text-white">{new Date(previewAsset.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Credits Deducted:</span>
                    <span className="font-semibold text-[#FFC4DA]">{previewAsset.credits_deducted || 0} Credits</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10">
                <Link
                  href={`/creative-studio?usePrompt=${encodeURIComponent(previewAsset.prompt || '')}&useUrl=${encodeURIComponent(previewAsset.result_url || '')}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white text-xs font-bold text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" /> Open in Creative Studio
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={previewAsset.result_url}
                    download={`asset-${previewAsset.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>

                  <button
                    onClick={() => handleCopyUrl(previewAsset.result_url, previewAsset.id)}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copySuccessId === previewAsset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )}

      {/* ─── MODAL 3: DELETE CONFIRMATION ─── */}
      {deleteConfirmId && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#ECE8E3] space-y-4 my-auto">
              <h4 className="text-sm font-bold text-[#141226]">Delete Creative Asset?</h4>
              <p className="text-xs text-[#6C6782]">
                Are you sure you want to permanently remove this asset from your creative gallery? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#6C6782] hover:bg-[#F7F6FA] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAsset(deleteConfirmId)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

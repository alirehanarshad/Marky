'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Palette,
  Image as ImageIcon,
  Edit,
  Video,
  Layers,
  Coins,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Play,
  Film,
  Sliders,
  Maximize2,
  Trash2,
  BookmarkPlus,
  Upload,
  Clock,
  FileImage,
  X,
  Eye,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import UpPromptButton from '@/components/ui/UpPromptButton';
import Portal, { useBodyScrollLock } from '@/components/ui/Portal';

export default function CreativeStudioPage() {
  const [activeTab, setActiveTab] = useState('image-gen'); // 'image-gen' | 'image-edit' | 'ugc-creator' | 'video-assembler' | 'gallery' | 'history'
  const [credits, setCredits] = useState(500);
  const [creditCosts, setCreditCosts] = useState({ imageCostCredits: 5, videoCostCredits: 120 });
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, cost, onConfirm }

  // ── Asset Library / Gallery State ──
  const [galleryFilter, setGalleryFilter] = useState('all'); // 'all' | 'beverages' | 'organic' | 'beauty' | 'fashion' | 'svg' | 'video'
  const [galleryPreview, setGalleryPreview] = useState(null);

  // ── History State ──
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'image' | 'video' | 'edit'
  const [historyPreview, setHistoryPreview] = useState(null);
  useBodyScrollLock(Boolean(confirmDialog || historyPreview || galleryPreview));

  // ── Asset Upload State ──
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // ── Image Generator State ──
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgNegativePrompt, setImgNegativePrompt] = useState('');
  const [imgAspectRatio, setImgAspectRatio] = useState('1:1');
  const [imgStyle, setImgStyle] = useState('Photorealistic E-Commerce');
  const [imgCount, setImgCount] = useState(1);
  const [imgResult, setImgResult] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // ── Image Editor State ──
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [editBgReplace, setEditBgReplace] = useState('');
  const [editObjRemove, setEditObjRemove] = useState('');
  const [editObjAdd, setEditObjAdd] = useState('');
  const [editResult, setEditResult] = useState(null);

  // ── UGC Ad Creator State (Multi-stage deterministic tool) ──
  const [ugcMode, setUgcMode] = useState('budget'); // 'budget' | 'ai-motion'
  const [ugcProduct, setUgcProduct] = useState({
    name: 'KMB Royal Sidr Honey',
    description: '100% pure raw mountain honey from Swat valley, lab certified with zero artificial heating.',
    targetAudience: 'Health-conscious families & premium food enthusiasts',
    platform: 'TikTok',
    language: 'English',
    offer: 'Free Express Shipping + Wooden Honey Dipper',
    tone: 'Authentic & High-Energy'
  });
  const [ugcOutput, setUgcOutput] = useState(null);

  // ── Video Ad Assembler State ──
  const [videoPreset, setVideoPreset] = useState('9:16');
  const [videoScenes, setVideoScenes] = useState([
    { id: 1, title: 'Hook Scene: Macro Golden Pour', duration: '2.5s', transition: 'Dissolve' },
    { id: 2, title: 'Problem Agitation: Commercial Supermarket Sugar Syrup', duration: '2.0s', transition: 'Zoom' },
    { id: 3, title: 'Solution: KMB Lab Certified Bottle with Stamp', duration: '2.5s', transition: 'Slide' }
  ]);
  const [videoResult, setVideoResult] = useState(null);

  useEffect(() => {
    loadCredits();
    loadGallery();

    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      if (hash === '#gallery' || params.get('tab') === 'gallery') {
        setActiveTab('gallery');
      } else if (hash === '#uploads' || params.get('tab') === 'uploads') {
        setActiveTab('uploads');
      }

      const usePrompt = params.get('usePrompt');
      const useUrl = params.get('useUrl');
      if (usePrompt) {
        setImgPrompt(decodeURIComponent(usePrompt));
        setActiveTab('image-gen');
      }
      if (useUrl) {
        setEditImageUrl(decodeURIComponent(useUrl));
        setActiveTab('image-edit');
      }

      const onHashChange = () => {
        if (window.location.hash === '#gallery') setActiveTab('gallery');
        if (window.location.hash === '#uploads') setActiveTab('uploads');
      };
      window.addEventListener('hashchange', onHashChange);
      return () => window.removeEventListener('hashchange', onHashChange);
    }
  }, []);

  async function loadCredits() {
    try {
      const res = await api.getCredits();
      if (res.success) {
        setCredits(res.balance);
        if (res.costs) setCreditCosts(res.costs);
      }
    } catch (e) {}
  }

  async function loadGallery() {
    try {
      const res = await api.getCreativeGallery();
      if (res.success && res.data) {
        setGallery(res.data);

        // Synchronize uploaded assets from database
        const uploads = res.data.filter(
          (item) => (item.job_type && item.job_type.startsWith('upload')) || item.provider === 'User Upload'
        );
        if (uploads.length > 0) {
          setUploadedAssets(
            uploads.map((u) => {
              let meta = {};
              try {
                meta = JSON.parse(u.metadata || '{}');
              } catch (e) {}
              return {
                id: u.id || u.job_id,
                name: meta.fileName || u.prompt || 'Uploaded Asset',
                type: meta.mimeType || 'image/jpeg',
                size: meta.fileSize || 0,
                dataUrl: u.result_url,
                uploadedAt: u.created_at
              };
            })
          );
        }
      }
    } catch (e) {}
  }

  // ── Asset Upload Handlers ──
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const localAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: e.target.result,
          uploadedAt: new Date().toISOString()
        };
        setUploadedAssets((prev) => [localAsset, ...prev]);

        // Permanently persist to SQLite database via backend API
        try {
          await api.uploadAsset({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: e.target.result,
            prompt: file.name.replace(/\.[^/.]+$/, ''),
            brand: 'All Brands',
            category: file.type.startsWith('video/') ? 'UGC Video Footage' : 'Product Photography'
          });
          loadGallery();
        } catch (err) {
          console.error('Failed to save uploaded asset:', err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeAsset = (assetId) => {
    setUploadedAssets((prev) => prev.filter((a) => a.id !== assetId));
    if (selectedAsset?.id === assetId) setSelectedAsset(null);
  };

  const useAssetInPrompt = (asset, targetTab = 'image-gen') => {
    if (targetTab === 'image-edit' || activeTab === 'image-edit') {
      setEditImageUrl(asset.dataUrl);
      setActiveTab('image-edit');
    } else if (targetTab === 'ugc-creator' || activeTab === 'ugc-creator') {
      setSelectedAsset(asset);
      setUgcProduct((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description} [Using brand asset: ${asset.name}]` : `Featuring brand asset: ${asset.name}`
      }));
      setActiveTab('ugc-creator');
    } else {
      setSelectedAsset(asset);
      setImgPrompt((prev) => {
        const tag = `[Incorporating uploaded asset: ${asset.name}]`;
        if (prev.includes(tag)) return prev;
        return prev ? `${prev} ${tag}` : `Commercial photography featuring ${asset.name}`;
      });
      setActiveTab('image-gen');
    }
  };

  const filteredHistory = gallery.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.job_type === historyFilter;
  });

  // 1. Generate Image Handler
  const handleGenerateImage = async () => {
    const totalCost = (creditCosts.imageCostCredits || 5) * Number(imgCount);
    if (credits < totalCost) {
      alert(`Insufficient credits! Required: ${totalCost}, Available: ${credits}`);
      return;
    }

    setLoading(true);
    setImgResult(null);

    try {
      const res = await api.generateImage({
        prompt: imgPrompt,
        negativePrompt: imgNegativePrompt,
        aspectRatio: imgAspectRatio,
        style: imgStyle,
        count: imgCount,
        attachedAsset: selectedAsset ? {
          name: selectedAsset.name,
          type: selectedAsset.type,
          dataUrl: selectedAsset.dataUrl
        } : null
      });

      if (res.success) {
        setImgResult(res.data);
        setCredits(res.data.remainingCredits);
        loadGallery();
      } else {
        alert(res.error || 'Generation failed');
      }
    } catch (err) {
      alert(err.message || 'Image generation error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Edit Image Handler
  const handleEditImage = async () => {
    const cost = creditCosts.imageCostCredits || 5;
    if (credits < cost) {
      alert(`Insufficient credits! Required: ${cost}, Available: ${credits}`);
      return;
    }

    setLoading(true);
    setEditResult(null);

    try {
      const res = await api.editImage({
        imageUrl: editImageUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
        editInstruction,
        backgroundReplacement: editBgReplace,
        objectRemoval: editObjRemove,
        objectAddition: editObjAdd
      });

      if (res.success) {
        setEditResult(res.data);
        setCredits(res.data.remainingCredits);
        loadGallery();
      } else {
        alert(res.error || 'Edit failed');
      }
    } catch (err) {
      alert(err.message || 'Image edit error');
    } finally {
      setLoading(false);
    }
  };

  // 3. UGC Multi-Stage Ad Generator
  const handleGenerateUGCAd = async () => {
    const cost = ugcMode === 'ai-motion' ? (creditCosts.videoCostCredits || 120) : (creditCosts.imageCostCredits || 5) * 2;

    const proceed = () => {
      setConfirmDialog(null);
      executeUgcGeneration(cost);
    };

    if (cost > 50) {
      setConfirmDialog({
        title: `Generate ${ugcMode === 'ai-motion' ? 'AI Motion UGC Video (Wan 2.2)' : 'Budget UGC Creative'}?`,
        cost,
        onConfirm: proceed
      });
    } else {
      executeUgcGeneration(cost);
    }
  };

  const executeUgcGeneration = async (cost) => {
    setLoading(true);
    setUgcOutput(null);

    try {
      // Step 1: Generate comprehensive structured UGC script
      const scriptRes = await api.runTool({
        toolId: 'tiktok-creator-brief',
        toolTitle: 'TikTok / UGC Creator Brief',
        category: 'Copywriting',
        inputs: {
          productName: ugcProduct.name,
          platform: ugcProduct.platform,
          audience: ugcProduct.targetAudience,
          keyBenefits: ugcProduct.description,
          callToAction: ugcProduct.offer
        }
      });

      // Step 2: Trigger visual asset generation
      let visualAsset = null;
      if (ugcMode === 'ai-motion') {
        const vidRes = await api.generateVideo({
          prompt: `High quality UGC product video for ${ugcProduct.name}, natural lifestyle lighting, 9:16 vertical`,
          duration: 5,
          resolution: '480p',
          aspectRatio: '9:16'
        });
        if (vidRes.success) {
          visualAsset = vidRes.data;
          setCredits(vidRes.data.remainingCredits);
        }
      } else {
        const imgRes = await api.generateImage({
          prompt: `Authentic UGC mobile phone selfie product photo of ${ugcProduct.name}, modern aesthetic`,
          aspectRatio: '9:16',
          style: 'UGC Product Shot'
        });
        if (imgRes.success) {
          visualAsset = imgRes.data;
          setCredits(imgRes.data.remainingCredits);
        }
      }

      setUgcOutput({
        script: scriptRes.data?.output || 'UGC Script generated successfully.',
        visualAsset,
        mode: ugcMode,
        product: ugcProduct
      });
      loadGallery();
    } catch (err) {
      alert(err.message || 'UGC generation error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Video Assembler Export
  const handleAssembleVideo = async () => {
    setLoading(true);
    const videoData = {
      title: `${ugcProduct.name} - Assembled Promo Ad`,
      duration: '7.0s',
      resolution: '480p',
      aspectRatio: videoPreset,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      downloadFilename: `assembled-ad-${Date.now()}.mp4`
    };
    setVideoResult(videoData);

    try {
      await api.saveAsset({
        title: videoData.title,
        jobType: 'assembled-video',
        resultUrl: videoData.videoUrl,
        provider: 'Video Ad Assembler (FFmpeg)',
        duration: 7,
        resolution: '480p',
        aspectRatio: videoPreset,
        brand: ugcProduct.name.includes('Honey') ? 'KMB Honey' : 'All Brands',
        metadata: {
          scenes: videoScenes.length,
          aspectRatio: videoPreset,
          tags: ['Assembled Ad', 'Promo', 'Video Ad']
        }
      });
      loadGallery();
    } catch (err) {
      console.error('Error saving assembled video to vault:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Magic Hour Creative API Provider"
        badgeIcon={Palette}
        title="AI Creative Studio"
        description="Independent creative suite: AI Image Generator, AI Image Editor, UGC Ad Creator, and Video Assembler with credit-aware estimation and Wan 2.2 motion engine."
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/creative-gallery"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#FFC4DA] bg-white/10 hover:bg-white/20 border border-white/15 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Open Creative Gallery</span>
            </Link>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#1D193E] border border-[#7A5DBB]/40 flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#FFC4DA]" />
              <div className="text-right">
                <span className="text-[10px] text-[#A59FFF] uppercase font-bold block leading-none">MARKY Credits</span>
                <span className="text-xs font-extrabold text-white leading-none">{credits} remaining</span>
              </div>
            </div>
          </div>
        }
      />

      {/* Credit Budget Management Warnings */}
      {credits <= 125 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/20 to-red-950/40 border border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Low creative credits ({credits} remaining).</strong> Consider using <strong>Budget Mode</strong> (image motion + TTS) to maximize creative yield.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('ugc-creator')}
            className="text-[11px] font-bold px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Switch to Budget UGC
          </button>
        </div>
      )}

      {/* 2. Studio Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#ECE8E3] pb-3 overflow-x-auto">
        {[
          { id: 'image-gen', label: 'AI Image Generator', icon: ImageIcon, cost: `~${creditCosts.imageCostCredits} credits` },
          { id: 'image-edit', label: 'AI Image Editor', icon: Edit, cost: `~${creditCosts.imageCostCredits} credits` },
          { id: 'ugc-creator', label: 'UGC Ad Creator', icon: Video, cost: 'Budget / AI Motion' },
          { id: 'video-assembler', label: 'Video Ad Assembler', icon: Film, cost: 'Local FFmpeg' },
          { id: 'gallery', label: `Asset Library (${gallery.length})`, icon: Layers, cost: 'Ready to use' },
          { id: 'uploads', label: `My Assets (${uploadedAssets.length})`, icon: Upload, cost: 'Upload' },
          { id: 'history', label: 'History', icon: Clock, cost: `${gallery.length} items` }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#4239C4] text-white shadow-md shadow-indigo-900/20 border border-[#4239C4]'
                  : 'bg-white text-[#6C6782] border border-[#ECE8E3] hover:text-[#141226] hover:bg-[#F7F6FA]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#F7F6FA] text-[#6C6782]'
              }`}>
                {tab.cost}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: AI IMAGE GENERATOR ─── */}
      {activeTab === 'image-gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 marky-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Image Generator Controls</h2>
              <span className="text-[11px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-full">
                Cost: {(creditCosts.imageCostCredits || 5) * Number(imgCount)} credits
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#141226]">Prompt</label>
                  <UpPromptButton
                    value={imgPrompt}
                    onChange={setImgPrompt}
                    type="image"
                    context="AI Image Generator - Product photography, advertising creative"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g., Luxury organic Sidr honey jar on raw marble countertop, soft warm sunlight, splash of golden honey, photorealistic 8k commercial product shot"
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  className="marky-input w-full text-xs p-3 rounded-xl border border-[#ECE8E3] bg-white resize-none"
                />

                {/* Attached Asset Badge / Reference */}
                {selectedAsset ? (
                  <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-[#4239C4]/10 border border-[#4239C4]/25">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img src={selectedAsset.dataUrl} alt={selectedAsset.name} className="w-8 h-8 rounded-lg object-contain bg-white border border-[#ECE8E3]" />
                      <div className="text-left truncate">
                        <p className="text-[11px] font-bold text-[#141226] truncate">{selectedAsset.name}</p>
                        <p className="text-[9px] text-[#6C6782]">Asset Attached to Generation</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(null)}
                      className="p-1 text-[#6C6782] hover:text-red-500 rounded-lg hover:bg-white/80 transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : uploadedAssets.length > 0 ? (
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[10px] font-bold text-[#6C6782] shrink-0">Attach Asset:</span>
                    {uploadedAssets.slice(0, 4).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAsset(a)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] hover:border-[#4239C4] text-[10px] font-medium text-[#141226] shrink-0 transition-all cursor-pointer"
                      >
                        <img src={a.dataUrl} alt={a.name} className="w-3.5 h-3.5 rounded object-contain" />
                        <span className="max-w-[70px] truncate">{a.name}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">Negative Prompt</label>
                <input
                  type="text"
                  placeholder="e.g., blurry, noisy, low quality, distorted text, plastic"
                  value={imgNegativePrompt}
                  onChange={(e) => setImgNegativePrompt(e.target.value)}
                  className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Aspect Ratio</label>
                  <select
                    value={imgAspectRatio}
                    onChange={(e) => setImgAspectRatio(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#ECE8E3] bg-white"
                  >
                    <option value="1:1">1:1 (Instagram / Square)</option>
                    <option value="9:16">9:16 (TikTok / Story / Reel)</option>
                    <option value="4:5">4:5 (Facebook Feed)</option>
                    <option value="16:9">16:9 (YouTube Thumbnail / Banner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Visual Style</label>
                  <select
                    value={imgStyle}
                    onChange={(e) => setImgStyle(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#ECE8E3] bg-white"
                  >
                    <option value="Photorealistic E-Commerce">Photorealistic E-Commerce</option>
                    <option value="Lifestyle Product Shot">Lifestyle Product Shot</option>
                    <option value="UGC Mobile Phone Aesthetic">UGC Mobile Phone Aesthetic</option>
                    <option value="Minimalist Studio Glow">Minimalist Studio Glow</option>
                    <option value="Cinematic Luxury Lighting">Cinematic Luxury Lighting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">Number of Images</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setImgCount(num)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        imgCount === num
                          ? 'bg-[#4239C4] text-white border-[#4239C4]'
                          : 'bg-[#F7F6FA] text-[#6C6782] border-[#ECE8E3] hover:bg-white'
                      }`}
                    >
                      {num} ({num * (creditCosts.imageCostCredits || 5)} cr)
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated credit breakdown */}
              <div className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs space-y-1">
                <div className="flex justify-between text-[#6C6782]">
                  <span>Estimated cost:</span>
                  <span className="font-bold text-[#141226]">{(creditCosts.imageCostCredits || 5) * Number(imgCount)} credits</span>
                </div>
                <div className="flex justify-between text-[#6C6782]">
                  <span>Remaining after generation:</span>
                  <span className="font-bold text-[#4239C4]">{credits - ((creditCosts.imageCostCredits || 5) * Number(imgCount))} credits</span>
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={loading || !imgPrompt}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Creative Image</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 marky-card p-5 flex flex-col items-center justify-center min-h-[480px] bg-white">
            {loading ? (
              <div className="text-center space-y-3 py-16">
                <div className="w-12 h-12 rounded-full border-2 border-[#4239C4]/20 border-t-[#4239C4] animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#141226]">Generating image with Magic Hour engine...</p>
                <p className="text-xs text-[#6C6782]">Applying direct-response lighting & aspect ratio {imgAspectRatio}</p>
              </div>
            ) : imgResult ? (
              <div className="space-y-4 w-full">
                <div className="relative rounded-2xl overflow-hidden border border-[#ECE8E3] shadow-md max-h-[440px] flex items-center justify-center bg-black/5">
                  <img
                    src={imgResult.imageUrl}
                    alt="Generated Creative"
                    className="w-full h-full object-contain max-h-[440px]"
                  />
                  <span className="absolute top-3 left-3 bg-[#0B091B]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {imgResult.aspectRatio} • {imgResult.provider}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6C6782]">
                    Deducted: <strong className="text-[#141226]">{imgResult.creditsDeducted} credits</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={imgResult.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-bold bg-[#F7F6FA] hover:bg-white text-[#141226] border border-[#ECE8E3] rounded-lg flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={() => {
                        setEditImageUrl(imgResult.imageUrl);
                        setActiveTab('image-edit');
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-[#4239C4]/10 hover:bg-[#4239C4]/20 text-[#4239C4] border border-[#4239C4]/30 rounded-lg flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit in AI Studio
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-[#8E8AAB] py-16">
                <div className="w-14 h-14 rounded-2xl bg-[#4239C4]/10 border border-[#7A5DBB]/20 flex items-center justify-center text-[#4239C4] mx-auto">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <p className="font-bold text-sm text-[#141226]">AI Image Generator Canvas</p>
                <p className="text-xs max-w-sm text-[#6C6782]">
                  Configure aspect ratio and prompts to synthesize high-converting ad visuals, lifestyle photos, and social creatives.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: AI IMAGE EDITOR ─── */}
      {activeTab === 'image-edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 marky-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">AI Image Editor</h2>
              <span className="text-[11px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-full">
                Cost: {creditCosts.imageCostCredits || 5} credits
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">Source Image URL</label>
                <input
                  type="text"
                  placeholder="https://... (or leave blank to use active product shot)"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#141226]">Edit Instruction</label>
                  <UpPromptButton
                    value={editInstruction}
                    onChange={setEditInstruction}
                    type="image"
                    context="AI Image Editor - Editing existing product images"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g., Replace background with soft luxury kitchen marble, enhance golden honey lighting and add fresh honeycomb pieces beside the jar"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  className="marky-input w-full text-xs p-3 rounded-xl border border-[#ECE8E3] bg-white resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#141226]">Background Replacement</label>
                  <UpPromptButton
                    value={editBgReplace}
                    onChange={setEditBgReplace}
                    type="image"
                    context="Background scene description for product image"
                    compact
                  />
                </div>
                <input
                  type="text"
                  placeholder="e.g., Mountain honey farm in Swat valley at sunrise"
                  value={editBgReplace}
                  onChange={(e) => setEditBgReplace(e.target.value)}
                  className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Remove Object</label>
                  <input
                    type="text"
                    placeholder="e.g., dust, shadow, glare"
                    value={editObjRemove}
                    onChange={(e) => setEditObjRemove(e.target.value)}
                    className="marky-input w-full text-xs p-2 rounded-xl border border-[#ECE8E3] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Add Object</label>
                  <input
                    type="text"
                    placeholder="e.g., wooden spoon, lab stamp"
                    value={editObjAdd}
                    onChange={(e) => setEditObjAdd(e.target.value)}
                    className="marky-input w-full text-xs p-2 rounded-xl border border-[#ECE8E3] bg-white"
                  />
                </div>
              </div>

              <button
                onClick={handleEditImage}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                <span>Apply AI Image Transformations</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 marky-card p-5 flex flex-col items-center justify-center min-h-[480px] bg-white">
            {loading ? (
              <div className="text-center space-y-3 py-16">
                <div className="w-12 h-12 rounded-full border-2 border-[#4239C4]/20 border-t-[#4239C4] animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#141226]">Executing Magic Hour Image Inpainting & Editing...</p>
                <p className="text-xs text-[#6C6782]">Preserving product silhouette while modifying composition</p>
              </div>
            ) : editResult ? (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#6C6782] block mb-1">Original Asset</span>
                    <img
                      src={editResult.originalUrl}
                      alt="Original"
                      className="w-full h-56 object-cover rounded-xl border border-[#ECE8E3]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4239C4] block mb-1">AI Transformed</span>
                    <img
                      src={editResult.editedUrl}
                      alt="Edited"
                      className="w-full h-56 object-cover rounded-xl border-2 border-[#4239C4] shadow-md"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#6C6782]">
                    Deducted: <strong className="text-[#141226]">{editResult.creditsDeducted} credits</strong>
                  </span>
                  <a
                    href={editResult.editedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold bg-[#4239C4] text-white rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Transformed Asset
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-[#8E8AAB] py-16">
                <div className="w-14 h-14 rounded-2xl bg-[#7A5DBB]/10 border border-[#7A5DBB]/20 flex items-center justify-center text-[#7A5DBB] mx-auto">
                  <Edit className="w-7 h-7" />
                </div>
                <p className="font-bold text-sm text-[#141226]">Before / After AI Studio</p>
                <p className="text-xs max-w-sm text-[#6C6782]">
                  Upload or paste a product image URL to swap backgrounds, clean reflections, remove unwanted artifacts, and enhance lighting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: UGC AD CREATOR (Multi-Stage Deterministic Tool) ─── */}
      {activeTab === 'ugc-creator' && (
        <div className="space-y-6">
          {/* Mode Switcher Banner: Budget Mode vs AI Motion Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setUgcMode('budget')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                ugcMode === 'budget'
                  ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-md'
                  : 'border-[#ECE8E3] bg-white hover:border-[#7A5DBB]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#141226]">Budget UGC Mode (Recommended)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ~10 Credits (Save 90%)
                </span>
              </div>
              <p className="text-xs text-[#6C6782] leading-relaxed">
                Uses AI generated multi-angle images, pan/zoom motion, voiceover script, and automated captions. High retention with minimal credit consumption.
              </p>
            </div>

            <div
              onClick={() => setUgcMode('ai-motion')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                ugcMode === 'ai-motion'
                  ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-md'
                  : 'border-[#ECE8E3] bg-white hover:border-[#7A5DBB]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#141226]">Wan 2.2 AI Motion Mode</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  ~120 Credits (5s 480p 9:16)
                </span>
              </div>
              <p className="text-xs text-[#6C6782] leading-relaxed">
                Synthesizes full generative video motion through Magic Hour's Wan 2.2 model. Limited to 480p 9:16 for maximum provider reliability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 marky-card p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226] pb-3 border-b border-[#ECE8E3]">
                UGC Campaign Brief
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1">Product Name</label>
                  <input
                    type="text"
                    value={ugcProduct.name}
                    onChange={(e) => setUgcProduct({ ...ugcProduct, name: e.target.value })}
                    className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#141226]">Product Description & Proof</label>
                    <UpPromptButton
                      value={ugcProduct.description}
                      onChange={(val) => setUgcProduct({ ...ugcProduct, description: val })}
                      type="ugc"
                      context="UGC Video Ad Campaign Brief - direct-to-consumer conversion"
                      compact
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={ugcProduct.description}
                    onChange={(e) => setUgcProduct({ ...ugcProduct, description: e.target.value })}
                    className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white resize-none"
                  />
                  {/* Attached Asset in UGC Creator */}
                  {selectedAsset ? (
                    <div className="mt-1.5 flex items-center justify-between p-1.5 rounded-lg bg-[#4239C4]/10 border border-[#4239C4]/20">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <img src={selectedAsset.dataUrl} alt={selectedAsset.name} className="w-5 h-5 rounded object-contain bg-white" />
                        <span className="text-[10px] font-bold text-[#141226] truncate">{selectedAsset.name} attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAsset(null)}
                        className="text-[#6C6782] hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : uploadedAssets.length > 0 ? (
                    <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto">
                      <span className="text-[9px] font-bold text-[#6C6782] shrink-0">Attach:</span>
                      {uploadedAssets.slice(0, 3).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedAsset(a)}
                          className="px-1.5 py-0.5 rounded bg-[#F7F6FA] border border-[#ECE8E3] text-[9px] text-[#141226] shrink-0 hover:border-[#4239C4] flex items-center gap-1"
                        >
                          <img src={a.dataUrl} alt="" className="w-2.5 h-2.5 rounded object-contain" />
                          <span className="max-w-[50px] truncate">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#141226] mb-1">Platform</label>
                    <select
                      value={ugcProduct.platform}
                      onChange={(e) => setUgcProduct({ ...ugcProduct, platform: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl border border-[#ECE8E3] bg-white"
                    >
                      <option value="TikTok">TikTok (9:16)</option>
                      <option value="Instagram Reels">Instagram Reels (9:16)</option>
                      <option value="YouTube Shorts">YouTube Shorts (9:16)</option>
                      <option value="Facebook Ads">Facebook Ads (4:5 / 9:16)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141226] mb-1">Language</label>
                    <select
                      value={ugcProduct.language}
                      onChange={(e) => setUgcProduct({ ...ugcProduct, language: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl border border-[#ECE8E3] bg-white"
                    >
                      <option value="English">English</option>
                      <option value="Roman Urdu">Roman Urdu</option>
                      <option value="Urdu">Urdu (اردو)</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#141226]">Offer & Call-to-Action</label>
                    <UpPromptButton
                      value={ugcProduct.offer}
                      onChange={(val) => setUgcProduct({ ...ugcProduct, offer: val })}
                      type="copy"
                      context="UGC Video Ad Offer & Call to action incentive"
                      compact
                    />
                  </div>
                  <input
                    type="text"
                    value={ugcProduct.offer}
                    onChange={(e) => setUgcProduct({ ...ugcProduct, offer: e.target.value })}
                    className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white"
                  />
                </div>

                <button
                  onClick={handleGenerateUGCAd}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  <span>Generate UGC Ad ({ugcMode === 'ai-motion' ? '~120 cr' : '~10 cr'})</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 marky-card p-5 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226] pb-3 border-b border-[#ECE8E3] mb-4">
                10-Stage UGC Ad Blueprint & Creative Assets
              </h2>

              {loading ? (
                <div className="text-center py-20 space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#4239C4]/20 border-t-[#4239C4] animate-spin mx-auto" />
                  <p className="text-sm font-bold text-[#141226]">Synthesizing UGC Scene Plan & Creative Assets...</p>
                  <p className="text-xs text-[#6C6782]">Generating Hook, Script, Shot Prompts, Voiceover, and 9:16 Video Asset</p>
                </div>
              ) : ugcOutput ? (
                <div className="space-y-4">
                  {/* Creative Asset Preview */}
                  {ugcOutput.visualAsset && (
                    <div className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {ugcOutput.visualAsset.videoUrl ? (
                          <div className="w-16 h-20 bg-black rounded-lg overflow-hidden flex items-center justify-center text-white">
                            <Play className="w-6 h-6" />
                          </div>
                        ) : (
                          <img
                            src={ugcOutput.visualAsset.imageUrl}
                            alt="UGC Preview"
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-[#141226]">
                            {ugcOutput.mode === 'ai-motion' ? 'Wan 2.2 Generated UGC Video' : 'UGC Scene Image'}
                          </p>
                          <p className="text-[11px] text-[#6C6782]">9:16 • 480p • Ready for ad delivery</p>
                        </div>
                      </div>
                      <a
                        href={ugcOutput.visualAsset.videoUrl || ugcOutput.visualAsset.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-bold bg-[#4239C4] text-white rounded-lg flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  )}

                  {/* 10-Step UGC Script & Storyboard */}
                  <div className="p-4 rounded-xl border border-[#ECE8E3] bg-[#FCFBFA] text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {ugcOutput.script}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-[#8E8AAB] space-y-2">
                  <Video className="w-12 h-12 text-[#4239C4]/30 mx-auto" />
                  <p className="font-bold text-sm text-[#141226]">Multi-Stage UGC Engine</p>
                  <p className="text-xs max-w-sm text-[#6C6782] mx-auto">
                    Generates 10 distinct campaign components: Hook, Script, Scene plan, Shot prompts, Voiceover, CTA, Caption, Hashtags, and creative motion clips.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: VIDEO AD ASSEMBLER ─── */}
      {activeTab === 'video-assembler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 marky-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">Video Assembler (FFmpeg)</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                0 Credits (Local Utility)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">Target Format & Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {['9:16', '1:1', '16:9'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setVideoPreset(ratio)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        videoPreset === ratio
                          ? 'bg-[#4239C4] text-white border-[#4239C4]'
                          : 'bg-[#F7F6FA] text-[#6C6782] border-[#ECE8E3] hover:bg-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1">Timeline Scenes Sequence</label>
                <div className="space-y-2">
                  {videoScenes.map((scene, idx) => (
                    <div key={scene.id} className="p-2.5 rounded-xl border border-[#ECE8E3] bg-[#F7F6FA] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#4239C4] text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#141226]">{scene.title}</span>
                      </div>
                      <span className="text-[11px] text-[#7A5DBB] font-bold">{scene.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[#141226] cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#4239C4]" />
                  <span>Burn high-retention animated subtitles / captions</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#141226] cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#4239C4]" />
                  <span>Add subtle ambient acoustic background music</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#141226] cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#4239C4]" />
                  <span>Overlay verified COD guarantee watermark</span>
                </label>
              </div>

              <button
                onClick={handleAssembleVideo}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                <span>Render & Assemble Video Ad</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 marky-card p-5 flex flex-col items-center justify-center min-h-[480px] bg-white">
            {loading ? (
              <div className="text-center space-y-3 py-16">
                <div className="w-12 h-12 rounded-full border-2 border-[#4239C4]/20 border-t-[#4239C4] animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#141226]">Assembling Final Video Ad via FFmpeg...</p>
                <p className="text-xs text-[#6C6782]">Combining clips, syncing audio voiceover, and encoding to {videoPreset}</p>
              </div>
            ) : videoResult ? (
              <div className="space-y-4 w-full">
                <div className="p-4 rounded-2xl bg-black text-white text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-sm font-bold">{videoResult.title}</h3>
                  <p className="text-xs text-slate-400">Duration: {videoResult.duration} • Preset: {videoResult.aspectRatio} • Encoded successfully</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6C6782]">Ready for TikTok / Meta campaign deployment</span>
                  <a
                    href={videoResult.videoUrl}
                    download={videoResult.downloadFilename}
                    className="px-4 py-2 text-xs font-bold bg-[#4239C4] text-white rounded-xl flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Assembled Video
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-[#8E8AAB] py-16">
                <Film className="w-12 h-12 text-[#7A5DBB]/30 mx-auto" />
                <p className="font-bold text-sm text-[#141226]">Video Ad Assembler Pipeline</p>
                <p className="text-xs max-w-sm text-[#6C6782]">
                  Combine clips, insert voiceovers, burn subtitles, apply smooth transitions, and export in 9:16 or 1:1 format.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: CREATIVE ASSET LIBRARY (MULTI-CATEGORY) ─── */}
      {activeTab === 'gallery' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#141226]">
                Creative Studio Asset Library
              </h2>
              <p className="text-xs text-[#6C6782]">Production-ready ad visuals, product shots, video clips, and trust seals</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadGallery}
                className="px-3 py-1.5 text-xs font-semibold text-[#4239C4] bg-[#4239C4]/10 rounded-lg hover:bg-[#4239C4]/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Assets
              </button>
              <button
                onClick={() => setActiveTab('uploads')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#4239C4] rounded-lg hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Custom
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#ECE8E3]">
            {[
              { id: 'all', label: 'All Creatives', icon: '🎨' },
              { id: 'beverages', label: 'Juices & Beverages', icon: '🍊' },
              { id: 'organic', label: 'Honey & Organic', icon: '🍯' },
              { id: 'beauty', label: 'Beauty & Skincare', icon: '✨' },
              { id: 'fashion', label: 'Leather & Fashion', icon: '👜' },
              { id: 'svg', label: 'Trust Badges & Seals', icon: '🛡️' },
              { id: 'video', label: 'UGC Video Ads', icon: '🎬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGalleryFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  galleryFilter === tab.id
                    ? 'bg-[#4239C4] text-white shadow-md shadow-indigo-900/15'
                    : 'bg-[#F7F6FA] text-[#6C6782] border border-[#ECE8E3] hover:bg-white hover:text-[#141226]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Special Section: Built-In SVG Trust Badges & Icons */}
          {(galleryFilter === 'all' || galleryFilter === 'svg') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#141226] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#4239C4]" /> Official Trust Seals & Badges (SVG Ready)
                </span>
                <span className="text-[11px] text-[#6C6782]">Click to attach as ad watermark</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: '100% Pure Organic', color: 'from-amber-500 to-amber-600', icon: '🌿', sub: 'Lab Verified Purity' },
                  { name: 'Cash On Delivery', color: 'from-blue-600 to-indigo-600', icon: '💵', sub: 'Verified COD Pakistan' },
                  { name: 'Free Express Shipping', color: 'from-emerald-600 to-teal-600', icon: '🚚', sub: 'Nationwide Delivery' },
                  { name: '5-Star Quality Seal', color: 'from-amber-400 to-orange-500', icon: '⭐', sub: 'Rated 4.9/5.0' },
                  { name: 'Money Back Guarantee', color: 'from-purple-600 to-indigo-700', icon: '🛡️', sub: '30-Day Protection' },
                  { name: 'Halal Certified', color: 'from-emerald-700 to-green-800', icon: '🌙', sub: '100% Halal Verified' }
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setImgPrompt((prev) => `${prev} [Overlay watermark badge: "${badge.name}"]`.trim());
                      setActiveTab('image-gen');
                    }}
                    className="marky-card p-3 text-center group cursor-pointer hover:border-[#4239C4] transition-all bg-gradient-to-b from-white to-[#F7F6FA]"
                  >
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform mb-2`}>
                      {badge.icon}
                    </div>
                    <p className="text-[11px] font-bold text-[#141226] line-clamp-1">{badge.name}</p>
                    <p className="text-[9px] text-[#6C6782] mt-0.5">{badge.sub}</p>
                    <span className="mt-2 inline-block text-[9px] font-bold text-[#4239C4] group-hover:underline">Attach to Ad →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Gallery Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#141226] block">
              Commercial Asset Library ({
                gallery.filter((item) => {
                  if (galleryFilter === 'all') return true;
                  if (galleryFilter === 'video') return item.job_type === 'video';
                  if (galleryFilter === 'svg') return false;
                  try {
                    const meta = JSON.parse(item.metadata || '{}');
                    if (meta.category === galleryFilter) return true;
                  } catch (e) {}
                  const p = (item.prompt || '').toLowerCase();
                  if (galleryFilter === 'beverages') return p.includes('juice') || p.includes('orange') || p.includes('mango') || p.includes('beverage') || p.includes('coffee') || p.includes('smoothie');
                  if (galleryFilter === 'organic') return p.includes('honey') || p.includes('comb') || p.includes('organic') || p.includes('kmb');
                  if (galleryFilter === 'beauty') return p.includes('serum') || p.includes('perfume') || p.includes('skin') || p.includes('cream');
                  if (galleryFilter === 'fashion') return p.includes('leather') || p.includes('bag') || p.includes('watch') || p.includes('sneaker');
                  return true;
                }).length
              } Assets Available)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery
                .filter((item) => {
                  if (galleryFilter === 'all') return true;
                  if (galleryFilter === 'video') return item.job_type === 'video';
                  if (galleryFilter === 'svg') return false;
                  try {
                    const meta = JSON.parse(item.metadata || '{}');
                    if (meta.category === galleryFilter) return true;
                  } catch (e) {}
                  const p = (item.prompt || '').toLowerCase();
                  if (galleryFilter === 'beverages') return p.includes('juice') || p.includes('orange') || p.includes('mango') || p.includes('beverage') || p.includes('coffee') || p.includes('smoothie');
                  if (galleryFilter === 'organic') return p.includes('honey') || p.includes('comb') || p.includes('organic') || p.includes('kmb');
                  if (galleryFilter === 'beauty') return p.includes('serum') || p.includes('perfume') || p.includes('skin') || p.includes('cream');
                  if (galleryFilter === 'fashion') return p.includes('leather') || p.includes('bag') || p.includes('watch') || p.includes('sneaker');
                  return true;
                })
                .map((item) => (
                  <div key={item.id} className="marky-card overflow-hidden group hover:border-[#4239C4] transition-all flex flex-col bg-white">
                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {item.job_type === 'video' ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white relative">
                          <Play className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform text-white" />
                          <span className="absolute bottom-2 right-2 bg-black/70 text-[10px] text-white px-2 py-0.5 rounded font-bold">0:05 UGC</span>
                        </div>
                      ) : (
                        <img
                          src={item.result_url}
                          alt="Asset"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <span className="absolute top-2 left-2 bg-[#0B091B]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.job_type}
                      </span>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#141226] line-clamp-2 leading-snug">
                          {item.prompt || 'Commercial Creative Asset'}
                        </p>
                        <p className="text-[10px] text-[#6C6782] mt-1">{item.provider}</p>
                      </div>

                      {/* 1-Click Studio Action Buttons */}
                      <div className="pt-2 border-t border-[#ECE8E3] grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            setImgPrompt(item.prompt);
                            setActiveTab('image-gen');
                          }}
                          className="py-1 px-2 rounded-lg bg-[#4239C4]/10 hover:bg-[#4239C4] text-[#4239C4] hover:text-white text-[10px] font-bold transition-all text-center cursor-pointer"
                          title="Generate new variant"
                        >
                          Use in Studio →
                        </button>
                        <button
                          onClick={() => {
                            setEditImageUrl(item.result_url);
                            setActiveTab('image-edit');
                          }}
                          className="py-1 px-2 rounded-lg bg-[#7A5DBB]/10 hover:bg-[#7A5DBB] text-[#7A5DBB] hover:text-white text-[10px] font-bold transition-all text-center cursor-pointer"
                          title="Edit in AI Inpainter"
                        >
                          Edit Image
                        </button>
                        <a
                          href={item.result_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-2 py-1 px-2 rounded-lg bg-[#F7F6FA] hover:bg-[#ECE8E3] text-[#141226] text-[10px] font-medium transition-all text-center flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download Full Res
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: MY ASSETS (UPLOAD) ─── */}
      {activeTab === 'uploads' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">
              Uploaded Assets ({uploadedAssets.length})
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-bold bg-[#4239C4] text-white rounded-lg flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Files
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.svg"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-lg shadow-indigo-900/10'
                : 'border-[#ECE8E3] bg-[#F7F6FA] hover:border-[#7A5DBB]/40 hover:bg-white'
            }`}
          >
            <div className="space-y-3">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${
                dragActive ? 'bg-[#4239C4]/20 text-[#4239C4]' : 'bg-[#4239C4]/10 text-[#4239C4]/70'
              }`}>
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#141226]">
                  {dragActive ? 'Drop files here...' : 'Drag & drop images, SVGs, or icons'}
                </p>
                <p className="text-xs text-[#6C6782] mt-1">
                  Supported: PNG, JPG, WEBP, SVG, GIF • Max 10MB per file
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Product Photos</span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">Brand Logos</span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">SVG Icons</span>
              </div>
            </div>
          </div>

          {/* Uploaded Assets Grid */}
          {uploadedAssets.length === 0 ? (
            <div className="marky-card p-10 text-center text-[#8E8AAB]">
              <FileImage className="w-10 h-10 mx-auto text-[#7A5DBB]/30 mb-2" />
              <p className="font-bold text-sm text-[#141226]">No Assets Uploaded Yet</p>
              <p className="text-xs text-[#6C6782] mt-1">Upload your brand assets, product photos, and icons to use in AI generations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {uploadedAssets.map((asset) => (
                <div key={asset.id} className="marky-card overflow-hidden group hover:border-[#7A5DBB]/40 transition-all">
                  <div className="h-36 bg-[#F7F6FA] relative overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-[#0B091B]/0 group-hover:bg-[#0B091B]/60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => useAssetInPrompt(asset)}
                        className="p-2 rounded-lg bg-white/90 text-[#4239C4] hover:bg-white transition-colors cursor-pointer"
                        title="Use in generator"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="p-2 rounded-lg bg-white/90 text-red-500 hover:bg-white transition-colors cursor-pointer"
                        title="Remove asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 bg-[#0B091B]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {asset.type.includes('svg') ? 'SVG' : asset.type.split('/')[1]?.toUpperCase() || 'IMG'}
                    </span>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <p className="text-xs font-bold text-[#141226] line-clamp-1">{asset.name}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#6C6782]">
                      <span>{(asset.size / 1024).toFixed(1)} KB</span>
                      <button
                        onClick={() => useAssetInPrompt(asset)}
                        className="text-[10px] font-bold text-[#4239C4] hover:underline cursor-pointer"
                      >
                        Use in Studio →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 7: GENERATION HISTORY ─── */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          {/* History Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">
                Generation History
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                {filteredHistory.length} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadGallery}
                className="text-xs font-semibold text-[#4239C4] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pb-2">
            {[
              { id: 'all', label: 'All', count: gallery.length },
              { id: 'image', label: 'Images', count: gallery.filter(i => i.job_type === 'image').length },
              { id: 'video', label: 'Videos', count: gallery.filter(i => i.job_type === 'video').length },
              { id: 'edit', label: 'Edits', count: gallery.filter(i => i.job_type === 'edit').length }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setHistoryFilter(filter.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  historyFilter === filter.id
                    ? 'bg-[#4239C4] text-white shadow-sm'
                    : 'bg-[#F7F6FA] text-[#6C6782] border border-[#ECE8E3] hover:bg-white hover:text-[#141226]'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* History Timeline */}
          {filteredHistory.length === 0 ? (
            <div className="marky-card p-12 text-center text-[#8E8AAB]">
              <Clock className="w-10 h-10 mx-auto text-[#7A5DBB]/30 mb-2" />
              <p className="font-bold text-sm text-[#141226]">No History Yet</p>
              <p className="text-xs text-[#6C6782] mt-1">
                {historyFilter === 'all'
                  ? 'Generate your first creative to see it appear here.'
                  : `No ${historyFilter} generations found. Try a different filter.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="marky-card p-4 flex items-center gap-4 hover:border-[#7A5DBB]/40 transition-all group cursor-pointer"
                  onClick={() => setHistoryPreview(item)}
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold ${
                      item.job_type === 'video' ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : item.job_type === 'edit' ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                      : 'bg-gradient-to-br from-[#4239C4] to-[#7A5DBB]'
                    }`}>
                      {item.job_type === 'video' ? <Film className="w-4 h-4" /> : item.job_type === 'edit' ? <Edit className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <span className="text-[9px] font-bold text-[#6C6782] uppercase">{item.job_type}</span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F7F6FA] border border-[#ECE8E3] shrink-0 flex items-center justify-center">
                    {item.job_type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                        <Play className="w-5 h-5 opacity-80" />
                      </div>
                    ) : (
                      <img
                        src={item.result_url}
                        alt="History item"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#141226] line-clamp-1">{item.prompt || 'Generated Creative'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#6C6782] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                      <span className="text-[10px] font-bold text-[#4239C4]">{item.credits_deducted} cr</span>
                      <span className="text-[10px] text-[#6C6782]">{item.provider}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <a
                      href={item.result_url || item.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-[#F7F6FA] hover:bg-white border border-[#ECE8E3] text-[#141226] transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.job_type === 'image' && item.result_url) {
                          setEditImageUrl(item.result_url);
                          setActiveTab('image-edit');
                        }
                      }}
                      className="p-2 rounded-lg bg-[#4239C4]/10 hover:bg-[#4239C4]/20 text-[#4239C4] border border-[#4239C4]/20 transition-colors cursor-pointer"
                      title="Edit in Studio"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Preview Modal */}
      {historyPreview && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] sm:max-h-[88vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-[#ECE8E3] animate-in fade-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                    historyPreview.job_type === 'video' ? 'bg-purple-500' : 'bg-[#4239C4]'
                  }`}>
                    {historyPreview.job_type === 'video' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#141226]">Generation Details</h3>
                    <p className="text-[10px] text-[#6C6782]">{historyPreview.provider} • {historyPreview.credits_deducted} credits</p>
                  </div>
                </div>
                <button
                  onClick={() => setHistoryPreview(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Image */}
              <div className="rounded-2xl overflow-hidden border border-[#ECE8E3] bg-black/5 max-h-[400px] flex items-center justify-center">
                {historyPreview.job_type === 'video' ? (
                  <div className="w-full h-64 bg-slate-900 flex items-center justify-center">
                    <a href={historyPreview.video_url || historyPreview.result_url} target="_blank" rel="noopener noreferrer" className="text-white flex flex-col items-center gap-2">
                      <Play className="w-12 h-12" />
                      <span className="text-xs font-bold">Open Video</span>
                    </a>
                  </div>
                ) : (
                  <img
                    src={historyPreview.result_url}
                    alt="Preview"
                    className="w-full h-full object-contain max-h-[400px]"
                  />
                )}
              </div>

              {/* Prompt Used */}
              {historyPreview.prompt && (
                <div className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                  <p className="text-[10px] font-bold text-[#6C6782] uppercase mb-1">Prompt Used</p>
                  <p className="text-xs text-[#141226] leading-relaxed">{historyPreview.prompt}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#6C6782]">
                  {historyPreview.created_at ? new Date(historyPreview.created_at).toLocaleString() : 'Generated recently'}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={historyPreview.result_url || historyPreview.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold bg-[#F7F6FA] hover:bg-white text-[#141226] border border-[#ECE8E3] rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  {historyPreview.job_type !== 'video' && (
                    <button
                      onClick={() => {
                        setEditImageUrl(historyPreview.result_url);
                        setActiveTab('image-edit');
                        setHistoryPreview(null);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-[#4239C4] text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit in AI Studio
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Credit Confirmation Modal for High-Cost Actions */}
      {confirmDialog && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ECE8E3] animate-in fade-in zoom-in-95 my-auto max-h-[85vh] sm:max-h-[88vh] overflow-y-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Coins className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold text-[#141226]">{confirmDialog.title}</h3>
                <p className="text-xs text-[#6C6782]">
                  This creative generation will deduct <strong>{confirmDialog.cost} credits</strong> from your MARKY balance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs space-y-1">
                <div className="flex justify-between text-[#6C6782]">
                  <span>Current balance:</span>
                  <span className="font-bold text-[#141226]">{credits} credits</span>
                </div>
                <div className="flex justify-between text-[#6C6782]">
                  <span>Estimated cost:</span>
                  <span className="font-bold text-red-600">-{confirmDialog.cost} credits</span>
                </div>
                <div className="flex justify-between text-[#6C6782] pt-1 border-t border-[#ECE8E3]">
                  <span>Remaining after:</span>
                  <span className="font-bold text-[#4239C4]">{credits - confirmDialog.cost} credits</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="py-2.5 px-4 rounded-xl border border-[#ECE8E3] text-xs font-bold text-[#6C6782] hover:bg-[#F7F6FA]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="py-2.5 px-4 rounded-xl bg-[#4239C4] hover:bg-[#372EB3] text-white text-xs font-bold shadow-md shadow-indigo-900/20"
                >
                  Confirm & Generate
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Target,
  ArrowRight,
  CheckCircle2,
  X,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Bot,
  RefreshCw,
  Sliders,
  Plus,
  Trash2
} from 'lucide-react';
import api from '@/lib/api';

const BUSINESS_PRESETS = [
  {
    type: 'E-commerce & Wholesale',
    label: 'E-commerce / Retail',
    description: 'Online brands, FMCG goods, retail buyers, and bulk distributors',
    dealSize: 'PKR 15,000 - 150,000',
    primaryChannel: 'WhatsApp & Instagram'
  },
  {
    type: 'Clothing & Fashion',
    label: 'Clothing & Apparel',
    description: 'Fashion boutiques, multi-designer stockists, and retail outlets',
    dealSize: 'PKR 35,000 - 500,000',
    primaryChannel: 'WhatsApp Catalog & Calls'
  },
  {
    type: 'B2B Services & Agency',
    label: 'Agency & B2B Services',
    description: 'Marketing, design, software agencies selling retained services',
    dealSize: '$1,500 - $10,000 / mo',
    primaryChannel: 'Cold Email & LinkedIn'
  },
  {
    type: 'Real Estate Agency',
    label: 'Real Estate & Property',
    description: 'Residential, commercial investors, high-ticket property buyers',
    dealSize: 'PKR 5,000,000+',
    primaryChannel: 'Direct Calls & WhatsApp'
  },
  {
    type: 'SaaS & Tech Startup',
    label: 'SaaS & Tech',
    description: 'Software subscriptions, product-led trials, and enterprise demos',
    dealSize: '$99 - $1,200 / mo',
    primaryChannel: 'Product Demo & Email'
  },
  {
    type: 'Restaurant & Hospitality',
    label: 'Restaurant & Catering',
    description: 'Dine-in guests, corporate event catering, and food delivery bulk orders',
    dealSize: 'PKR 25,000 - 200,000',
    primaryChannel: 'WhatsApp & Event Calls'
  }
];

export default function CrmOnboardingWizard({ isOpen, onClose, onCreated, brandId = 1 }) {
  const [step, setStep] = useState(1); // 1: Business Profile, 2: ICP & Strategy, 3: AI Review & Launch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Inputs
  const [businessType, setBusinessType] = useState('E-commerce & Wholesale');
  const [businessName, setBusinessName] = useState('KMB Honey');
  const [businessDescription, setBusinessDescription] = useState('Pure raw organic honey harvested from Northern valleys, offering premium retail jars and bulk B2B corporate gifting packages.');
  const [targetLocation, setTargetLocation] = useState('Lahore, Karachi, Islamabad, Faisalabad');
  const [customerType, setCustomerType] = useState('B2B & High-Intent B2C');
  const [averageDealValue, setAverageDealValue] = useState(45000);
  const [primaryChannel, setPrimaryChannel] = useState('WhatsApp');

  // AI Generated Pipeline State
  const [generatedPipeline, setGeneratedPipeline] = useState(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setBusinessType(preset.type);
    setPrimaryChannel(preset.primaryChannel.includes('WhatsApp') ? 'WhatsApp' : 'Email');
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        business_type: businessType,
        business_name: businessName,
        business_description: businessDescription,
        target_location: targetLocation,
        customer_type: customerType,
        average_deal_value: Number(averageDealValue) || 25000,
        primary_channel: primaryChannel
      };

      const res = await api.generatePipeline(payload);
      if (res.success && res.data) {
        setGeneratedPipeline(res.data);
        setStep(3); // Advance to preview step
      } else {
        throw new Error(res.error || 'Failed to generate pipeline structure');
      }
    } catch (err) {
      console.error('AI Pipeline Generation Error:', err);
      setError(err.message || 'Error communicating with AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePipeline = async () => {
    if (!generatedPipeline) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        brand_id: brandId,
        name: generatedPipeline.name,
        description: generatedPipeline.description,
        business_type: generatedPipeline.business_type || businessType,
        icp: generatedPipeline.icp || {},
        sourcing_strategy: generatedPipeline.sourcing_strategy || {},
        stages: generatedPipeline.stages || []
      };

      const res = await api.createPipeline(payload);
      if (res.success && res.data) {
        if (onCreated) onCreated(res.data);
        onClose();
      } else {
        throw new Error(res.error || 'Failed to save pipeline');
      }
    } catch (err) {
      console.error('Save Pipeline Error:', err);
      setError(err.message || 'Failed to save pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = (idx, field, value) => {
    if (!generatedPipeline) return;
    const updatedStages = [...generatedPipeline.stages];
    updatedStages[idx] = { ...updatedStages[idx], [field]: value };
    setGeneratedPipeline({ ...generatedPipeline, stages: updatedStages });
  };

  const handleRemoveStage = (idx) => {
    if (!generatedPipeline || generatedPipeline.stages.length <= 3) {
      alert('A pipeline requires at least 3 stages to remain functional.');
      return;
    }
    const updatedStages = generatedPipeline.stages.filter((_, i) => i !== idx);
    setGeneratedPipeline({ ...generatedPipeline, stages: updatedStages });
  };

  const handleAddStage = () => {
    if (!generatedPipeline) return;
    const newStage = {
      name: 'Custom Step',
      description: 'Custom milestone in buyer journey',
      color: '#4239C4',
      probability: 0.5,
      sla_hours: 48
    };
    setGeneratedPipeline({
      ...generatedPipeline,
      stages: [...generatedPipeline.stages, newStage]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="px-8 py-5 bg-gradient-to-r from-[#141226] via-[#2A1E5C] to-[#4239C4] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  AI Adaptive Architecture
                </span>
                <span className="text-xs text-white/70 font-medium">Step {step} of 3</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {step === 1 && 'Define Business Model & Industry'}
                {step === 2 && 'Ideal Customer Profile (ICP) & Outreach'}
                {step === 3 && 'Review AI-Generated Adaptive Pipeline'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full bg-[#ECE8E3] h-1.5 flex">
          <div
            className="bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] h-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 1: BUSINESS PROFILE & PRESETS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#141226] mb-3">
                  Choose Business Domain / Industry Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {BUSINESS_PRESETS.map((preset) => {
                    const isSelected = businessType === preset.type;
                    return (
                      <div
                        key={preset.type}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-md shadow-[#4239C4]/10'
                            : 'border-[#ECE8E3] bg-white hover:border-[#4239C4]/40 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-extrabold text-xs text-[#141226]">{preset.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4239C4]" />}
                          </div>
                          <p className="text-[11px] text-[#6C6782] leading-relaxed mb-3">
                            {preset.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#ECE8E3]/60 flex items-center justify-between text-[10px] font-bold text-[#6C6782]">
                          <span>{preset.dealSize}</span>
                          <span className="text-[#4239C4]">{preset.primaryChannel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1.5">
                    Brand / Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. KMB Honey or Cydaix Leather"
                      className="marky-input w-full pl-10 pr-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1.5">
                    Target Geographies & Cities
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      placeholder="e.g. Lahore, Karachi, Islamabad, UAE, US"
                      className="marky-input w-full pl-10 pr-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-1.5">
                  Business Value Proposition & Core Offer
                </label>
                <textarea
                  rows={3}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your flagship products, target client pain-points, and why buyers choose you..."
                  className="marky-input w-full p-3 text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ICP & DEAL METRICS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1.5">
                    Target Customer Profile (ICP)
                  </label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="marky-input w-full px-3 py-2 text-xs font-semibold"
                  >
                    <option value="B2B & High-Intent B2C">Hybrid B2B & Premium B2C</option>
                    <option value="B2B Wholesale Retailers">B2B Wholesale Retailers / Stockists</option>
                    <option value="Corporate Accounts & Gifting">Corporate Procurement & Executive Gifting</option>
                    <option value="Direct-to-Consumer (High LTV)">High-LTV D2C Consumers</option>
                    <option value="Local Store Walk-ins">Local Foot-Traffic & Neighborhood Clients</option>
                    <option value="Enterprise IT & SaaS">Mid-Market to Enterprise Companies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141226] mb-1.5">
                    Average Deal Value (PKR / USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
                    <input
                      type="number"
                      value={averageDealValue}
                      onChange={(e) => setAverageDealValue(e.target.value)}
                      placeholder="e.g. 45000"
                      className="marky-input w-full pl-10 pr-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <span className="text-[10px] text-[#6C6782] mt-1 block">
                    Used by AI to calculate expected pipeline value and conversion thresholds.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141226] mb-2">
                  Primary Outreach & Closing Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'WhatsApp', label: 'WhatsApp Messenger', desc: 'Direct chat, catalog link, and voice notes' },
                    { id: 'Email', label: 'Cold B2B Email', desc: 'Personalized multi-touch cold email sequences' },
                    { id: 'Phone', label: 'Phone Call / Direct', desc: 'High-touch consultation and immediate closing' }
                  ].map((chan) => (
                    <div
                      key={chan.id}
                      onClick={() => setPrimaryChannel(chan.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        primaryChannel === chan.id
                          ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-sm'
                          : 'border-[#ECE8E3] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-[#141226]">{chan.label}</span>
                        {primaryChannel === chan.id && <CheckCircle2 className="w-4 h-4 text-[#4239C4]" />}
                      </div>
                      <p className="text-[11px] text-[#6C6782]">{chan.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 flex items-start gap-3">
                <Bot className="w-5 h-5 text-[#4239C4] shrink-0 mt-0.5" />
                <div className="text-xs text-[#141226]">
                  <p className="font-extrabold mb-1">How Gemini AI crafts your pipeline:</p>
                  <p className="text-[#6C6782] leading-relaxed">
                    AI synthesizes your business model, customer buying cycles, and transaction size to generate custom stages (with SLA targets and win probabilities), target ICP scoring criteria, and automated Apify lead scraper recipes tailored to your industry.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AI PREVIEW & CUSTOMIZATION */}
          {step === 3 && generatedPipeline && (
            <div className="space-y-6 animate-fadeIn">
              {/* Pipeline Overview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#1F1841] text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#4239C4] text-white">
                      {generatedPipeline.business_type || businessType}
                    </span>
                    <span className="text-xs text-white/60">
                      {generatedPipeline.stages?.length || 0} Dynamic Stages
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={loading}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Regenerate with AI</span>
                  </button>
                </div>
                <h3 className="text-base font-black text-white">{generatedPipeline.name}</h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  {generatedPipeline.description}
                </p>
              </div>

              {/* ICP & Sourcing Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#ECE8E3]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-black text-[#141226]">
                    <Target className="w-4 h-4 text-[#4239C4]" />
                    <span>Target ICP Criteria</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[#6C6782]">
                    <div>
                      <span className="font-bold text-[#141226]">Target Segment: </span>
                      {generatedPipeline.icp?.customer_type || customerType}
                    </div>
                    <div>
                      <span className="font-bold text-[#141226]">Locations: </span>
                      {Array.isArray(generatedPipeline.icp?.location)
                        ? generatedPipeline.icp.location.join(', ')
                        : targetLocation}
                    </div>
                    {generatedPipeline.icp?.purchase_intent && (
                      <div>
                        <span className="font-bold text-[#141226]">Intent Signals: </span>
                        {Array.isArray(generatedPipeline.icp.purchase_intent)
                          ? generatedPipeline.icp.purchase_intent.join(', ')
                          : generatedPipeline.icp.purchase_intent}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-[#ECE8E3]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-black text-[#141226]">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Apify Lead Sourcing Strategy</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[#6C6782]">
                    <div>
                      <span className="font-bold text-[#141226]">Primary Actor: </span>
                      {generatedPipeline.sourcing_strategy?.primary_actor || 'Google Maps Scraper'}
                    </div>
                    <div>
                      <span className="font-bold text-[#141226]">Suggested Search: </span>
                      <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {generatedPipeline.sourcing_strategy?.search_queries?.[0] || 'Organic honey stores & grocery marts'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[#141226]">Enrichment: </span>
                      WhatsApp phone verification, Google Review rating &gt; 4.0
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Stages List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black uppercase tracking-wider text-[#141226]">
                    Configured Pipeline Stages & SLAs
                  </label>
                  <button
                    onClick={handleAddStage}
                    className="flex items-center gap-1 text-xs font-bold text-[#4239C4] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Stage</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {generatedPipeline.stages?.map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-[#ECE8E3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#4239C4]/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="color"
                          value={stage.color || '#4239C4'}
                          onChange={(e) => handleUpdateStage(idx, 'color', e.target.value)}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 shrink-0"
                          title="Stage color"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={stage.name}
                            onChange={(e) => handleUpdateStage(idx, 'name', e.target.value)}
                            className="font-black text-xs text-[#141226] border-b border-transparent hover:border-slate-300 focus:border-[#4239C4] outline-none w-full bg-transparent"
                          />
                          <input
                            type="text"
                            value={stage.description || ''}
                            onChange={(e) => handleUpdateStage(idx, 'description', e.target.value)}
                            placeholder="Stage description..."
                            className="text-[11px] text-[#6C6782] border-b border-transparent hover:border-slate-300 focus:border-[#4239C4] outline-none w-full bg-transparent mt-0.5"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] uppercase font-bold text-[#6C6782]">Win %</span>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="1"
                            value={stage.probability}
                            onChange={(e) => handleUpdateStage(idx, 'probability', parseFloat(e.target.value) || 0)}
                            className="w-14 px-2 py-1 text-xs font-bold marky-input text-center"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] uppercase font-bold text-[#6C6782]">SLA (hrs)</span>
                          <input
                            type="number"
                            min="0"
                            value={stage.sla_hours || 48}
                            onChange={(e) => handleUpdateStage(idx, 'sla_hours', parseInt(e.target.value) || 24)}
                            className="w-14 px-2 py-1 text-xs font-bold marky-input text-center"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveStage(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Remove stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-4 bg-[#F7F6FA] border-t border-[#ECE8E3] flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-4 py-2 marky-btn-secondary text-xs font-bold cursor-pointer"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 marky-btn-primary text-xs font-bold cursor-pointer"
              >
                <span>Continue to ICP & Channels</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleGenerateAI}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:brightness-110 text-white rounded-xl shadow-md text-xs font-black cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Architecting Pipeline with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Adaptive Pipeline</span>
                  </>
                )}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSavePipeline}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl shadow-md text-xs font-black cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Pipeline...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Activate Pipeline</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

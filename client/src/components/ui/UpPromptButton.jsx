'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

/**
 * Universal "Up-Prompt" Button
 * Takes a user's rough/basic prompt and transforms it into a 
 * detailed, high-quality, commercial-grade prompt using the AI engine.
 * 
 * Props:
 *  - value: string — the current prompt text
 *  - onChange: (enhancedPrompt: string) => void — callback to update the prompt
 *  - type: 'image' | 'text' | 'copy' | 'video' — context type for enhancement
 *  - context: string — optional additional context for the enhancer
 *  - disabled: boolean — disable the button
 *  - className: string — optional additional class names
 *  - compact: boolean — render a smaller version (icon-only on small screens)
 */
export default function UpPromptButton({ value, onChange, type = 'text', context = '', disabled = false, className = '', compact = false }) {
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  const handleUpPrompt = async () => {
    if (!value || !value.trim() || loading || disabled) return;

    setLoading(true);
    setEnhanced(false);

    try {
      const res = await api.upPrompt({
        prompt: value.trim(),
        type,
        context
      });

      if (res.success && res.data?.enhancedPrompt) {
        onChange(res.data.enhancedPrompt);
        setEnhanced(true);
        setTimeout(() => setEnhanced(false), 3000);
      }
    } catch (err) {
      console.error('Up-Prompt failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleUpPrompt}
        disabled={loading || disabled || !value?.trim()}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative p-1.5 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
          enhanced
            ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
            : 'bg-gradient-to-r from-[#4239C4]/10 to-[#7A5DBB]/10 text-[#4239C4] border border-[#4239C4]/20 hover:from-[#4239C4]/20 hover:to-[#7A5DBB]/20 hover:shadow-sm'
        } ${className}`}
        title="Up-Prompt: Enhance with AI"
      >
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : enhanced ? (
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        ) : (
          <Wand2 className="w-3.5 h-3.5" />
        )}

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#0B091B] text-white text-[10px] font-bold rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-xl">
            ✨ Enhance prompt with AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0B091B]" />
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleUpPrompt}
      disabled={loading || disabled || !value?.trim()}
      className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        enhanced
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'
          : 'bg-gradient-to-r from-[#4239C4]/10 to-[#7A5DBB]/15 text-[#4239C4] border border-[#4239C4]/25 hover:from-[#4239C4]/20 hover:to-[#7A5DBB]/25 hover:shadow-md hover:shadow-indigo-900/10 hover:-translate-y-[1px]'
      } ${className}`}
    >
      {loading ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Enhancing...</span>
        </>
      ) : enhanced ? (
        <>
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Enhanced!</span>
        </>
      ) : (
        <>
          <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span>Up-Prompt</span>
        </>
      )}

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#4239C4]/0 to-[#7A5DBB]/0 group-hover:from-[#4239C4]/5 group-hover:to-[#7A5DBB]/5 transition-all duration-300 pointer-events-none" />
    </button>
  );
}

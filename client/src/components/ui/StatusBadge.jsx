'use client';

import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null;

  const normalized = String(status).trim().toLowerCase();

  const configMap = {
    // Active / Live
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    connected: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

    // In Progress / Running
    running: 'bg-[#4239C4]/10 text-[#4239C4] border-[#4239C4]/25',
    'in progress': 'bg-[#4239C4]/10 text-[#4239C4] border-[#4239C4]/25',
    scheduled: 'bg-[#7A5DBB]/10 text-[#7A5DBB] border-[#7A5DBB]/25',

    // Draft / Paused / Inactive
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    paused: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-slate-100 text-slate-600 border-slate-200',
    'needs review': 'bg-amber-50 text-amber-700 border-amber-200',
    'needs attention': 'bg-amber-50 text-amber-700 border-amber-200',

    // Threat / Critical / Error
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',

    // Medium / Info
    medium: 'bg-[#7A5DBB]/10 text-[#7A5DBB] border-[#7A5DBB]/20',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    prospect: 'bg-[#9B4FA5]/10 text-[#9B4FA5] border-[#9B4FA5]/25',
    lead: 'bg-[#4239C4]/10 text-[#4239C4] border-[#4239C4]/25'
  };

  const style = configMap[normalized] || 'bg-[#F7F6FA] text-[#6C6782] border-[#ECE8E3]';

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[10px]' 
    : size === 'lg'
    ? 'px-3.5 py-1 text-xs'
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border tracking-wide select-none ${sizeClasses} ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{status}</span>
    </span>
  );
}

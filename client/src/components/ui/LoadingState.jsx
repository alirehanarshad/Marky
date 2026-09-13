'use client';

import React from 'react';

export default function LoadingState({
  text = 'Loading marketing intelligence...',
  subtext = 'Synchronizing with local SQLite database and active models',
  count = 3
}) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-3 border-[#4239C4]/20 border-t-[#4239C4] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#4239C4] to-[#9B4FA5] opacity-80 animate-ping" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#141226]">{text}</p>
          {subtext && <p className="text-xs text-[#6C6782]">{subtext}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="marky-card p-5 space-y-3">
            <div className="h-4 bg-slate-200/60 rounded-md w-1/3" />
            <div className="h-8 bg-slate-200/80 rounded-md w-2/3" />
            <div className="h-3 bg-slate-200/50 rounded-md w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

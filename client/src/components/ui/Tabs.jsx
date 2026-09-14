'use client';

import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
  size = 'md'
}) {
  if (variant === 'underline') {
    return (
      <div className="flex border-b border-[#ECE8E3] gap-6 text-xs font-bold overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === (tab.id || tab);
          const label = tab.label || tab;
          const count = tab.count;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id || tab}
              type="button"
              onClick={() => onChange(tab.id || tab)}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#4239C4] text-[#4239C4]'
                  : 'border-transparent text-[#6C6782] hover:text-[#141226]'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{label}</span>
              {count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-[#4239C4]/10 text-[#4239C4]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center p-1 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] gap-1 max-w-full">
      {tabs.map((tab) => {
        const isActive = activeTab === (tab.id || tab);
        const label = tab.label || tab;
        const count = tab.count;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id || tab}
            type="button"
            onClick={() => onChange(tab.id || tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-white text-[#4239C4] shadow-xs marky-shadow-subtle'
                : 'text-[#6C6782] hover:text-[#141226] hover:bg-white/50'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  isActive
                    ? 'bg-[#4239C4]/10 text-[#4239C4]'
                    : 'bg-slate-200/60 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

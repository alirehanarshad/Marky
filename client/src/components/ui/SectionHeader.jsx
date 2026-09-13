'use client';

import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  count,
  actions
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ECE8E3]">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#141226] tracking-tight">
              {title}
            </h2>
            {count !== undefined && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7A5DBB]/10 text-[#7A5DBB] border border-[#7A5DBB]/20">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#6C6782] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

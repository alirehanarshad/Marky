'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subvalue,
  trend,
  trendPositive = true,
  icon: Icon,
  accentColor = 'indigo', // 'indigo' | 'violet' | 'purple' | 'magenta' | 'coral'
  variant = 'standard' // 'standard' | 'insight'
}) {
  const colorMap = {
    indigo: {
      iconBg: 'bg-[#4239C4]/10',
      iconText: 'text-[#4239C4]',
      border: 'border-l-[#4239C4]'
    },
    violet: {
      iconBg: 'bg-[#7A5DBB]/10',
      iconText: 'text-[#7A5DBB]',
      border: 'border-l-[#7A5DBB]'
    },
    purple: {
      iconBg: 'bg-[#9B4FA5]/10',
      iconText: 'text-[#9B4FA5]',
      border: 'border-l-[#9B4FA5]'
    },
    magenta: {
      iconBg: 'bg-[#A73B9D]/10',
      iconText: 'text-[#A73B9D]',
      border: 'border-l-[#A73B9D]'
    },
    coral: {
      iconBg: 'bg-[#F0A09F]/20',
      iconText: 'text-[#A73B9D]',
      border: 'border-l-[#F0A09F]'
    }
  };

  const selected = colorMap[accentColor] || colorMap.indigo;

  return (
    <div
      className={`marky-card p-5 space-y-3 ${
        variant === 'insight' ? `border-l-4 ${selected.border}` : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#6C6782] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${selected.iconBg} ${selected.iconText} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-black text-[#141226] tracking-tight">
          {value}
        </h3>

        {(trend || subvalue) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span
                className={`text-[11px] font-bold flex items-center gap-0.5 ${
                  trendPositive ? 'text-[#4239C4]' : 'text-rose-600'
                }`}
              >
                {trendPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{trend}</span>
              </span>
            )}
            {subvalue && (
              <span className="text-[11px] text-[#6C6782] font-medium">
                {subvalue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

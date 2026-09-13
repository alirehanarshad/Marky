'use client';

import React from 'react';
import Link from 'next/link';

export default function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  actions,
  breadcrumbs = [],
  variant = 'dark' // 'dark' | 'glass'
}) {
  if (variant === 'glass') {
    return (
      <div className="card-glass rounded-3xl p-6 md:p-8 border border-[#ECE8E3] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6C6782] mb-1">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-[#4239C4] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4239C4]/10 text-[#4239C4] text-xs font-bold border border-[#7A5DBB]/25">
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#141226] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-[#6C6782] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="marky-hero-banner p-6 md:p-8 relative">
      {/* Subtle brand fluid glow ribbons matching Dashboard */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/20 blur-3xl pointer-events-none" />
      <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-tr from-[#D97FA5]/20 to-transparent blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2.5 max-w-2xl">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1B47] text-[#D1C3FF] text-xs font-bold border border-[#7A5DBB]/30">
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-[#A59FFF]" />}
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h1>

          {description && (
            <p className="text-xs md:text-sm text-[#B4AFCC] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

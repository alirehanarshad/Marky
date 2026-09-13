'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'Get started by creating your first item or adjusting your filters.',
  actionText,
  onAction,
  actionIcon: ActionIcon
}) {
  return (
    <div className="card-glass rounded-2xl p-12 text-center space-y-4 border border-[#ECE8E3] max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4239C4]/10 via-[#7A5DBB]/10 to-[#F3C5A8]/10 text-[#4239C4] flex items-center justify-center mx-auto border border-[#7A5DBB]/20">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-extrabold text-[#141226]">
          {title}
        </h3>
        <p className="text-xs text-[#6C6782] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 marky-btn-primary text-xs font-bold cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

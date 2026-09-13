'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Hook to strictly lock scrolling on document.body and the main layout container
 * whenever a modal/dialog is open.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';

    // Also lock main container scroll if present in AppLayout
    const mainEl = document.querySelector('main');
    const originalMainOverflow = mainEl?.style?.overflow;
    if (mainEl) {
      mainEl.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow || '';
      }
    };
  }, [isLocked]);
}

/**
 * Client Portal that teleports children directly to document.body,
 * avoiding any CSS transform, overflow clipping, or local stacking context traps.
 */
export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
}

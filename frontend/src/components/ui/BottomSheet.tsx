'use client';

import type { ReactNode } from 'react';

/** 아래에서 올라오는 창 */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-app rounded-t-card bg-bg p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="mb-3 text-lg font-bold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

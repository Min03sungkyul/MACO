'use client';

import type { ReactNode } from 'react';

/** 가운데 창. open이 false면 그리지 않는다 */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-sm rounded-card bg-bg p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

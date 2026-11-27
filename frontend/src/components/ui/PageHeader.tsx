'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/** 흐름 화면 위쪽: 뒤로·닫기 + 제목 + 오른쪽 (진행 단계 등) */
export function PageHeader({ title, onBack, close, right }: { title?: string; onBack?: () => void; close?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-bg">
      <button type="button" aria-label={close ? '닫기' : '뒤로'} onClick={onBack ?? (() => router.back())} className="-ml-2 flex size-10 items-center justify-center text-xl">
        {close ? '✕' : '‹'}
      </button>
      {title && <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  );
}

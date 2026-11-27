'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui';
import { useStore } from '@/lib/store';

/** Splash, then the start screen (first run) or 트레이닝 (returning). */
export default function Splash() {
  const router = useRouter();
  const { ready, data } = useStore();
  const next = data.signedUp && data.prog.onboarded ? '/train' : data.signedUp ? '/mode' : '/start';
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => router.replace(next), 1800);
    return () => clearTimeout(t);
  }, [ready, next, router]);
  return (
    <main className="splash" onClick={() => ready && router.replace(next)}>
      <Logo />
      <p>매일 10분 마케팅 트레이닝</p>
      <div className="splash-dots" aria-hidden="true"><i /><i /><i /></div>
    </main>
  );
}

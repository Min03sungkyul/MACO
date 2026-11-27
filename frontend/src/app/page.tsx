'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IS_MOCK } from '@/lib/api/client';
import { getToken } from '@/lib/auth';

/** 스플래시 → 로그인했으면 트레이닝, 아니면 로그인. TODO(주승준): prototype/app/page.tsx 스플래시 화면 */
export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    router.replace(IS_MOCK || getToken() ? '/training' : '/login');
  }, [router]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2">
      <p className="text-3xl font-black text-accent">MACO</p>
      <p className="text-sm text-sub">매일 10분 마케팅 트레이닝</p>
    </main>
  );
}

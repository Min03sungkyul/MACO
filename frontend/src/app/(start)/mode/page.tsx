'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { updateSettings } from '@/lib/api/common';
import type { UserMode } from '@/lib/types/start';

/** S2 모드 선택 (담당: 주승준). TODO(주승준): prototype/app/(onboarding)/mode/page.tsx */
export default function ModePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (mode: UserMode) => updateSettings({ mode }),
    onSuccess: (me) => {
      qc.setQueryData(['me'], me);
      router.push('/store-setup');
    },
  });
  return (
    <main className="flex flex-col gap-6">
      <PageHeader />
      <h1 className="text-2xl font-bold">가게가 있으세요?</h1>
      <p className="text-sm text-sub">같은 트레이닝을 해요. 가게가 없으면 연습 가게로 배워요.</p>
      <div className="flex flex-col gap-3">
        <Button variant="secondary" disabled={m.isPending} onClick={() => m.mutate('STORE')}>🏪 네, 내 가게가 있어요</Button>
        <Button variant="secondary" disabled={m.isPending} onClick={() => m.mutate('LEARNING')}>📚 아직 없어요 (학습 모드)</Button>
      </div>
      {m.isError && <p role="alert" className="text-sm text-bad">{m.error.message}</p>}
    </main>
  );
}

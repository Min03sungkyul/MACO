'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ItemStep } from '@/components/training/ItemStep';
import { Card, LinkButton, PageHeader, QueryView, useXpToast } from '@/components/ui';
import { keepStreakWithBusyReview } from '@/lib/api/common';
import { useWrongNotes } from '@/lib/api/exam';

/**
 * 바쁜 날 2분 복습: 오답 2문제만 풀면 오늘 연속 기록 유지 (기획서 C3, 담당: 주승준, API: 박민하).
 * TODO(주승준): prototype/app/(flow)/train/review/page.tsx
 */
export default function BusyReviewPage() {
  const router = useRouter();
  const { toast } = useXpToast();
  const notes = useWrongNotes();
  const [i, setI] = useState(0);
  const keep = useMutation({ mutationFn: keepStreakWithBusyReview, onSuccess: () => toast('오늘 연속 기록을 지켰어요 🔥') });
  return (
    <main className="flex flex-col gap-5">
      <PageHeader title="2분 복습" close onBack={() => router.push('/training')} />
      <QueryView query={notes} isEmpty={(d) => d.length === 0}
        empty={{ title: '복습할 오답이 없어요', description: '오늘은 레슨 하나로 목표를 채워 보세요', action: <LinkButton href="/training">트레이닝으로</LinkButton> }}>
        {(list) => {
          const items = list.slice(0, 2).map((n) => n.item);
          if (keep.isSuccess || i >= items.length) {
            return (
              <Card className="py-8 text-center">
                <p className="text-4xl">🔥</p>
                <p className="mt-2 font-bold">{keep.isSuccess ? '연속 기록 유지!' : '저장 중…'}</p>
                <div className="mt-4"><LinkButton href="/training" variant="secondary">홈으로</LinkButton></div>
              </Card>
            );
          }
          return <ItemStep key={items[i].id} item={items[i]} context="WRONG_NOTE"
            onDone={() => { if (i + 1 >= items.length) keep.mutate(); setI(i + 1); }} />;
        }}
      </QueryView>
    </main>
  );
}

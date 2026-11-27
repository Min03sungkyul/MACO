'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader, ProgressBar, QueryView, QuestionCard } from '@/components/ui';
import { submitPlacement, usePlacement } from '@/lib/api/training';

/**
 * S4 배치 테스트 10문제 (담당: 주승준). 정답을 바로 알려 주지 않고 끝에 한 번에 제출한다.
 * TODO(주승준): prototype/app/(onboarding)/placement/page.tsx
 */
export default function PlacementPage() {
  const router = useRouter();
  const q = usePlacement();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<{ itemId: number; answer?: string }[]>([]);
  const submit = useMutation({ mutationFn: submitPlacement, onSuccess: () => router.push('/goal') });

  return (
    <main className="flex flex-col gap-5">
      <PageHeader title="배치 테스트" right={<button type="button" className="text-sm text-sub" onClick={() => router.push('/goal')}>건너뛰기</button>} />
      <QueryView query={q} isEmpty={(d) => d.items.length === 0} empty={{ title: '배치 테스트 문제가 아직 없어요' }}>
        {({ items }) => {
          const item = items[i];
          return (
            <>
              <ProgressBar value={i / items.length} label="배치 테스트 진행" />
              <QuestionCard key={item.id} item={item} submitting={submit.isPending}
                submitLabel={i + 1 === items.length ? '결과 보기' : '다음'}
                onSubmit={(a) => {
                  const next = [...answers, { itemId: item.id, answer: a.answer ?? a.answerText }];
                  setAnswers(next);
                  if (i + 1 < items.length) setI(i + 1);
                  else submit.mutate(next);
                }} />
              {submit.isError && <p role="alert" className="text-sm text-bad">{submit.error.message}</p>}
            </>
          );
        }}
      </QueryView>
    </main>
  );
}

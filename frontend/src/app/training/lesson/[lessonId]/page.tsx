'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ItemStep } from '@/components/training/ItemStep';
import { Button, Card, EmptyState, LinkButton, PageHeader, ProgressBar, QueryView, useXpToast } from '@/components/ui';
import { finishLesson, startLesson } from '@/lib/api/training';
import type { FinishResponse } from '@/lib/types/training';

/**
 * S7~S10 레슨: 개념 카드 → 연습 문제(7개) → 피드백 → 레슨 완료 (담당: 주승준).
 * TODO(주승준): prototype/app/(flow)/train/lesson/[node]/page.tsx (레벨 변화·약점 리포트 연출)
 */
export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { showXp } = useXpToast();
  const session = useQuery({ queryKey: ['training', 'session', lessonId], queryFn: () => startLesson(Number(lessonId)), staleTime: Infinity });
  const [step, setStep] = useState(-1); // -1 = 개념 카드
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState<FinishResponse | null>(null);
  const finish = useMutation({
    mutationFn: (c: number) => finishLesson(session.data!.sessionId, { lessonId: Number(lessonId), correctCount: c, totalCount: session.data!.items.length }),
    onSuccess: (r) => { setDone(r); showXp(r.xp); },
  });

  return (
    <main className="flex flex-col gap-5">
      <PageHeader close onBack={() => router.push('/training')}
        right={session.data && <span className="text-sm text-sub">{Math.max(0, step) + (step >= 0 ? 1 : 0)}/{session.data.items.length}</span>} />
      <QueryView query={session} isEmpty={(s) => s.items.length === 0} empty={{ title: '이 레슨은 문제가 아직 없어요', action: <LinkButton href="/training" variant="secondary">돌아가기</LinkButton> }}>
        {(s) => {
          if (done) {
            return (
              <Card className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-4xl">🎉</p>
                <h2 className="text-xl font-bold">레슨 완료!</h2>
                <p className="text-sub">정답률 {done.accuracy}% · +{done.xp.gained} XP</p>
                {done.weakReport && <p className="text-sm text-accent">{done.weakReport}</p>}
                <LinkButton href="/training" variant="accent">트레이닝 홈으로</LinkButton>
              </Card>
            );
          }
          if (step < 0) {
            return s.conceptCard ? (
              <Card className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-accent">개념 카드</p>
                <h2 className="text-xl font-bold">{s.conceptCard.title}</h2>
                <p className="leading-relaxed">{s.conceptCard.body}</p>
                {s.conceptCard.evidence && <p className="text-xs text-sub">근거: {s.conceptCard.evidence}</p>}
                <Button variant="accent" onClick={() => setStep(0)}>문제 풀기</Button>
              </Card>
            ) : <EmptyState title={s.lesson.title} action={<Button onClick={() => setStep(0)}>문제 풀기</Button>} />;
          }
          const item = s.items[step];
          return (
            <>
              <ProgressBar value={step / s.items.length} label="레슨 진행" />
              <ItemStep key={item.id} item={item} context="LESSON" sessionId={s.sessionId} conceptCard={s.conceptCard}
                nextLabel={step + 1 === s.items.length ? '레슨 마치기' : '계속'}
                onDone={(r) => {
                  const c = correct + (r.correct ? 1 : 0);
                  setCorrect(c);
                  if (step + 1 < s.items.length) setStep(step + 1);
                  else finish.mutate(c);
                }} />
            </>
          );
        }}
      </QueryView>
    </main>
  );
}

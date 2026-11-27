'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, LinkButton, PageHeader, ProgressBar, QueryView, QuestionCard, useXpToast } from '@/components/ui';
import { createDailyQuiz, submitQuiz } from '@/lib/api/exam';
import type { QuizAnswer, QuizResult } from '@/lib/types/exam';

/**
 * S12 쪽지시험: 5문제를 풀고 한 번에 제출 → 100점 만점 점수, XP (담당: 이동성).
 * TODO(이동성): prototype/app/(flow)/test/quiz/page.tsx (점수 연출, 문제별 다시 보기)
 */
export default function QuizPage() {
  const router = useRouter();
  const { showXp } = useXpToast();
  const quiz = useQuery({ queryKey: ['exam', 'quiz'], queryFn: createDailyQuiz, staleTime: Infinity });
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const submit = useMutation({
    mutationFn: (a: QuizAnswer[]) => submitQuiz(quiz.data!.quizId, a),
    onSuccess: (r) => { setResult(r); showXp(r.xp); },
  });
  return (
    <main className="flex flex-col gap-5">
      <PageHeader title="오늘의 쪽지시험" close onBack={() => router.push('/exam')} />
      <QueryView query={quiz} isEmpty={(q) => q.items.length === 0} empty={{ title: '오늘 낼 문제가 없어요' }}>
        {(q) => {
          if (result) {
            return (
              <Card className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-5xl font-black text-accent">{result.score}점</p>
                <p className="text-sub">{result.results.filter((r) => r.correct).length}/{result.results.length} 정답 · +{result.xp.gained} XP</p>
                <p className="text-sm">틀린 문제는 오답 노트에 들어갔어요</p>
                <LinkButton href="/exam/notes" variant="secondary">오답 노트 보기</LinkButton>
              </Card>
            );
          }
          const item = q.items[i];
          return (
            <>
              <ProgressBar value={i / q.items.length} label="쪽지시험 진행" />
              <QuestionCard key={item.id} item={item} submitting={submit.isPending} submitLabel={i + 1 === q.items.length ? '제출하기' : '다음'}
                onSubmit={(a) => {
                  const next = [...answers, { itemId: item.id, answer: a.answer }];
                  setAnswers(next);
                  if (i + 1 < q.items.length) setI(i + 1);
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

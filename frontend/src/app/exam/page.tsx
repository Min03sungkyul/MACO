'use client';

import { Card, LinkButton, QueryView, TopStatusBar } from '@/components/ui';
import { useExamHome } from '@/lib/api/exam';

/** S11 시험 홈: 오늘의 쪽지시험, 오답 노트, 오늘의 상황극 (담당: 이동성). TODO(이동성): prototype/app/(tabs)/test/page.tsx */
export default function ExamPage() {
  const home = useExamHome();
  return (
    <main className="flex flex-col gap-4">
      <TopStatusBar title="시험" />
      <QueryView query={home}>
        {(h) => (
          <>
            <Card>
              <p className="text-xs font-semibold text-accent">오늘의 쪽지시험 · 5문제</p>
              <h2 className="mt-1 text-lg font-bold">{h.quizDoneToday ? `오늘 ${h.quizScore}점` : '배운 것 확인하기'}</h2>
              {!h.quizDoneToday && <div className="mt-3"><LinkButton href="/exam/quiz" variant="accent">시작하기</LinkButton></div>}
            </Card>
            <Card>
              <h2 className="font-bold">오답 노트 <span className="text-accent">{h.wrongNoteCount}</span></h2>
              <p className="text-sm text-sub">틀린 문제를 다시 풀어 굳혀요</p>
              <div className="mt-3"><LinkButton href="/exam/notes" variant="secondary">다시 풀기</LinkButton></div>
            </Card>
            {h.todayScenario && (
              <Card>
                <p className="text-xs font-semibold text-accent">AI 손님 상황극</p>
                <h2 className="mt-1 font-bold">{h.todayScenario.title}</h2>
                <p className="text-sm text-sub">손님과 3번 주고받고 루브릭 리포트를 받아요</p>
                <div className="mt-3"><LinkButton href="/exam/roleplay" variant="secondary">대화 시작</LinkButton></div>
              </Card>
            )}
          </>
        )}
      </QueryView>
    </main>
  );
}

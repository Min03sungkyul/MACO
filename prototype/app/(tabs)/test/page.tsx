'use client';

import Link from 'next/link';
import { WhenReady } from '@/components/ui';
import { TopBar, useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { notes } from '@/lib/train/engine';
import { ROLEPLAY } from '@/lib/ai/adapter';

/** S11 시험 홈: 오늘의 쪽지시험 · 오답 노트 · 오늘의 상황극 */
export default function TestHome() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { t, p, today } = useTrain();
  const quiz = p.quizzes.filter((q) => q.date === today).at(-1);
  const rp = p.roleplays.filter((q) => q.date === today).at(-1);
  const wrong = notes(t);
  return (
    <main className="screen has-tabs t-screen">
      <TopBar />
      <h1 className="t-h1">시험</h1>
      <p className="t-sub">배운 걸 확인하고 굳혀요. 하루 10분 = 레슨 1개 + 쪽지시험.</p>
      <Link className="t-test-card" href="/test/quiz">
        <span className="ic">{TI.quiz}</span>
        <div><b>오늘의 쪽지시험</b><span>오늘 배운 것 + 복습 5문제 · 100점 만점</span></div>
        <em>{quiz ? `${quiz.score}점` : '시작'}</em>
      </Link>
      <Link className="t-test-card" href="/test/notes">
        <span className="ic">{TI.note}</span>
        <div><b>오답 노트</b><span>틀린 문제는 잊을 때쯤 다시 나와요</span></div>
        <em>{wrong.length}개</em>
      </Link>
      <Link className="t-test-card" href="/test/roleplay">
        <span className="ic">{TI.chat}</span>
        <div><b>오늘의 상황극</b><span>{ROLEPLAY.title} · AI 손님과 3턴 대화</span></div>
        <em>{rp ? `${rp.score}점` : '시작'}</em>
      </Link>
      <p className="t-note">상황극의 손님은 연습용 가상 상황이에요. 실제 효과를 약속하지 않아요.</p>
    </main>
  );
}

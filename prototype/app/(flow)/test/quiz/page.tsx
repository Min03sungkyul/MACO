'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { ItemPlayer } from '@/components/train/ItemPlayer';
import { TI } from '@/components/train/icons';
import { QUIZ_SIZE, XP, addXp, quizItems, record } from '@/lib/train/engine';

/** S12 쪽지시험 (T1): 5문제 → 100점 만점, 정답당 4 XP, 만점 보너스 10 */
export default function Quiz() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, setTrain, setProg, today } = useTrain();
  const [items] = useState(() => quizItems(t, today));
  const [i, setI] = useState(0);
  const tally = useRef({ ok: 0, xp: 0 });
  const [score, setScore] = useState<number | null>(null);

  if (score !== null) {
    return (
      <main className="t-center fade">
        <div className="hero">
          <div className="t-score">{score}<small>점</small></div>
          <h1>{score === 100 ? '만점이에요!' : score >= 80 ? '잘했어요!' : '오답 노트에 담았어요'}</h1>
          <p className="lead">{score === 100 ? `만점 보너스 ${XP.quizPerfect} XP를 받았어요.` : '틀린 문제는 내일 다시 나와요.'}</p>
          <div className="t-tiles"><div className="t-tile xp"><span className="k">얻은 XP</span><b>+{tally.current.xp}</b></div><div className="t-tile acc"><span className="k">맞힌 문제</span><b>{tally.current.ok}/{items.length}</b></div></div>
        </div>
        <button type="button" className="btn" onClick={() => router.replace(score < 100 ? '/test/notes' : '/test')}>{score < 100 ? '오답 노트 보기' : '확인'}</button>
      </main>
    );
  }
  const item = items[i];
  return (
    <main className="t-lesson">
      <div className="t-ltop">
        <button type="button" onClick={() => router.push('/test')} aria-label="그만하기">{TI.close}</button>
        <div className="t-bar"><i style={{ width: `${(i / QUIZ_SIZE) * 100}%` }} /></div>
        <span className="t-where">쪽지시험 {i + 1}/{items.length}</span>
      </div>
      <ItemPlayer key={item.id} item={item}
        onAnswer={(a) => {
          const r = record(t, item, a.ok, 'quiz', today, a.ms);
          if (a.ok) tally.current.ok++;
          tally.current.xp += r.xp;
          setTrain(() => r.state);
        }}
        onNext={() => {
          if (i + 1 < items.length) return setI(i + 1);
          const sc = Math.round((tally.current.ok / items.length) * 100);
          if (sc === 100) { tally.current.xp += XP.quizPerfect; setTrain((s) => addXp(s, today, XP.quizPerfect)); }
          setProg((p) => ({ quizzes: [...p.quizzes, { date: today, score: sc }] }));
          setScore(sc);
        }} />
    </main>
  );
}

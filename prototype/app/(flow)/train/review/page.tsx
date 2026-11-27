'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { ItemPlayer } from '@/components/train/ItemPlayer';
import { TI } from '@/components/train/icons';
import { itemById } from '@/lib/train/bank';
import { isDue, markBusy, pickNext, record } from '@/lib/train/engine';

/** 바쁜 날 2분 복습 (C3·C6): 한 문제만 풀어도 오늘 연속 기록이 이어져요. */
export default function BusyReview() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, setTrain, today } = useTrain();
  const [item] = useState(() => {
    const due = Object.keys(t.review).find((id) => isDue(t, id, today));
    return (due && itemById(due)) || pickNext(t, 'review', 3, [], today) || pickNext(t, 'photo', 3, [], today)!;
  });
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main className="t-center fade">
        <div className="hero"><div className="t-flame">{TI.flame}</div><h1>오늘 연속 기록을 지켰어요</h1><p className="lead">바쁜 날은 이 정도면 충분해요. 내일은 레슨 하나로 이어 가요.</p></div>
        <button type="button" className="btn" onClick={() => router.replace('/train')}>확인</button>
      </main>
    );
  }
  return (
    <main className="t-lesson">
      <div className="t-ltop"><button type="button" onClick={() => router.push('/train')} aria-label="닫기">{TI.close}</button><span className="t-where">2분 복습 · 1문제</span></div>
      <ItemPlayer item={item} nextLabel="마치기"
        onAnswer={(a) => setTrain((s) => markBusy(record(s, item, a.ok, 'review', today, a.ms).state, today))}
        onNext={() => setDone(true)} />
    </main>
  );
}

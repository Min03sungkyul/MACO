'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { ItemPlayer } from '@/components/train/ItemPlayer';
import { TI } from '@/components/train/icons';
import { ERRORS, unitOf } from '@/lib/train/bank';
import { notes, record } from '@/lib/train/engine';
import type { Item } from '@/lib/train/types';

/** S13 오답 노트 (T2·B8): 틀린 문제 모음, 다시 풀기. 맞히면 3일·7일 뒤 다시 확인해요. */
export default function Notes() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, setTrain, today } = useTrain();
  const [playing, setPlaying] = useState<Item | null>(null);
  const list = notes(t);

  if (playing) {
    return (
      <main className="t-lesson">
        <div className="t-ltop"><button type="button" onClick={() => setPlaying(null)} aria-label="목록으로">{TI.close}</button><span className="t-where">오답 다시 풀기</span></div>
        <ItemPlayer key={playing.id} item={playing}
          onAnswer={(a) => { const r = record(t, playing, a.ok, 'notes', today, a.ms); setTrain(() => r.state); }}
          onNext={() => setPlaying(null)} nextLabel="목록으로" />
      </main>
    );
  }
  return (
    <main className="screen t-screen">
      <div className="t-ltop flat"><button type="button" onClick={() => router.push('/test')} aria-label="닫기">{TI.close}</button><span className="t-where">오답 노트</span></div>
      <h1 className="t-h1">오답 노트 {list.length}개</h1>
      <p className="t-sub">틀린 다음 날 다시 나오고, 맞히면 3일 → 7일 뒤에 한 번 더 확인해요.</p>
      {list.length === 0 && <p className="t-empty">틀린 문제가 없어요. 레슨이나 쪽지시험을 풀면 여기에 모여요.</p>}
      <ul className="t-notes">
        {list.map((it) => {
          const r = t.review[it.id];
          return (
            <li key={it.id}>
              <button type="button" onClick={() => setPlaying(it)}>
                <span className="k">{unitOf(it.skill).title} · {ERRORS[it.err].name}</span>
                <b>{it.q.replace(/\n/g, ' ')}</b>
                <span>{r.due <= today ? '오늘 복습할 차례' : `${r.due.slice(5).replace('-', '/')} 복습 예정`}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

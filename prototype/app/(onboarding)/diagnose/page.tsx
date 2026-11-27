'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, BackButton, Option, WhenReady } from '@/components/ui';
import { BusyPicker } from '@/components/BusyPicker';
import { BUSY_QUESTION, QUESTIONS } from '@/lib/maco';
import { useStore } from '@/lib/store';

const STEPS = QUESTIONS.length + 1; // six choices, then the busy-time grid

/** ① 진단: six questions one per screen, then "할 일 하기 어려운 시간" on a 7 × 3 grid. */
export default function Diagnose() {
  return <WhenReady><Questions /></WhenReady>;
}

function Questions() {
  const router = useRouter();
  const { data, set } = useStore();
  const [i, setI] = useState(0);
  const grid = i === QUESTIONS.length;
  const q = grid ? null : QUESTIONS[i];
  const value = grid ? null : data.answers[i];
  const last = i === STEPS - 1;

  const choose = (v: number) => set((d) => { const a = [...d.answers]; a[i] = v; return { answers: a }; });
  const next = () => (last ? router.push('/analyzing') : setI(i + 1));
  const back = () => (i === 0 ? router.push('/start') : setI(i - 1));

  return (
    <main className="screen">
      <div className="qtop">
        <BackButton onClick={back} />
        <div className="prog"><i style={{ width: `${((i + 1) / STEPS) * 100}%` }} /></div>
        <div className="count"><b>{i + 1}</b>/{STEPS}</div>
      </div>
      <div key={i} className="fade">
        <h1 className="q">{grid ? BUSY_QUESTION.q : q!.q}</h1>
        <div className="hint"><Avatar size={22} /><span>{grid ? BUSY_QUESTION.hint : q!.hint}</span></div>
        {grid ? (
          <BusyPicker value={data.busyCells} onChange={(busyCells) => set({ busyCells })} />
        ) : (
          <div className={q!.grid ? 'opts grid' : 'opts'}>
            {q!.options.map((o, k) => (
              <Option key={o.label} pressed={value === k} onClick={() => choose(k)} label={o.label} sub={o.sub} />
            ))}
          </div>
        )}
      </div>
      <div className="bottom">
        <button className="btn" type="button" disabled={!grid && value === null} onClick={next}>
          {last ? (data.busyCells.length ? '결과 보기' : '없어요, 결과 보기') : '다음'}
        </button>
      </div>
    </main>
  );
}

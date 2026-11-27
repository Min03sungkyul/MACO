'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chips, Option, TopBar, WhenReady } from '@/components/ui';
import { useStore } from '@/lib/store';

const MINUTES = [5, 10, 15, 20];

/** H 기록: behaviour (required) + customer reaction (optional) — the paper's two-layer measure. */
export default function Record() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { analysis: a, session, today, set, setSession } = useStore();
  const [did, setDid] = useState<'yes' | 'no' | null>(null);
  // Time spent is measured from "지금 하기" and pre-selected; the owner can still change it.
  const elapsed = session.startedAt ? Math.max(1, Math.round((Date.now() - session.startedAt) / 60000)) : null;
  const guess = elapsed === null ? 1 : MINUTES.reduce((best, v, k) => (Math.abs(v - elapsed) < Math.abs(MINUTES[best] - elapsed) ? k : best), 0);
  const [m, setM] = useState(session.busy ? 0 : guess);
  const [likes, setLikes] = useState(0);
  const [inq, setInq] = useState(0);
  const target = session.target ?? today;

  const save = () => {
    if (did === 'no') { router.push('/reason'); return; }
    set((d) => ({ records: { ...d.records, [target]: { status: 'done', minutes: session.busy ? 3 : MINUTES[m], likes, inquiries: inq } } }));
    setSession({ busy: false, caption: null, target: null, startedAt: null });
    router.replace('/today');
  };

  const stepper = (label: string, v: number, setV: (n: number) => void) => (
    <div className="stepper"><span>{label}</span><div>
      <button type="button" aria-label={`${label} 줄이기`} onClick={() => setV(Math.max(0, v - 1))}>−</button>
      <b aria-live="polite">{v}</b>
      <button type="button" aria-label={`${label} 늘리기`} onClick={() => setV(v + 1)}>+</button>
    </div></div>
  );

  return (
    <main className="screen fade">
      <TopBar title="기록" step="3/3" backHref="/post" />
      <h1 className="title">{a.channel}에{'\n'}잘 올렸나요?</h1>
      <p className="body-text">기록은 10초면 끝나요.</p>
      <div className="two">
        <Option check={false} pressed={did === 'yes'} onClick={() => setDid('yes')} label="올렸어요" />
        <Option check={false} pressed={did === 'no'} onClick={() => setDid('no')} label="못 올렸어요" />
      </div>
      {did === 'yes' && (
        <>
          {!session.busy && (
            <div className="sec">
              <div className="k">걸린 시간</div>
              {elapsed !== null && elapsed <= 120 && <div className="d">자동으로 재 보니 {elapsed}분이에요. 다르면 바꿔 주세요.</div>}
              <Chips label="걸린 시간" items={['5분', '10분', '15분', '20분 이상']} value={m} onChange={setM} />
            </div>
          )}
          <div className="sec">
            <div className="k">손님 반응 <span className="tag">선택</span></div>
            <div className="d">지금 몰라도 괜찮아요. 내일 적어도 돼요.</div>
            {stepper('좋아요', likes, setLikes)}
            {stepper('문의·방문', inq, setInq)}
          </div>
        </>
      )}
      <div className="bottom"><button className="btn" type="button" disabled={!did} onClick={save}>{did === 'no' ? '다음' : '기록 저장'}</button></div>
    </main>
  );
}

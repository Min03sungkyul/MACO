'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { GateBars } from '@/components/train/shop';
import { PASS, adsUnlocked } from '@/lib/train/gates';
import { latestGate } from '@/lib/train/progress';

const CHANNELS = ['네이버 플레이스 광고', '인스타그램 광고', '당근 광고'];
const STOPS = ['2주 동안 길찾기가 늘지 않으면 중지', '저장이 이전 2주보다 적으면 중지', '예산을 다 쓰면 중지'];

/** S21 광고 관문 (E2): 찾게·믿게 통과 후 잠금 해제 → 매체 하나·예산·중지 기준을 정한 2주 실험 카드 */
export default function Ads() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { p, setProg, today } = useTrain();
  const g = latestGate(p);
  const open = adsUnlocked(g?.scores ?? null);
  const [channel, setChannel] = useState(p.adPlan?.channel ?? CHANNELS[0]);
  const [budget, setBudget] = useState(p.adPlan?.budget ?? 10);
  const [stop, setStop] = useState(p.adPlan?.stopRule ?? STOPS[0]);

  return (
    <main className="screen t-screen">
      <div className="t-ltop flat"><button type="button" onClick={() => router.push('/shop')} aria-label="닫기">{TI.close}</button><span className="t-where">광고 관문</span></div>
      {!open ? (
        <>
          <div className="t-lock">{TI.lock}</div>
          <h1 className="t-h1 center">아직 광고를 켤 때가 아니에요</h1>
          <p className="t-sub center">찾게와 믿게 관문을 {PASS}점 넘기면 열려요. 정보와 리뷰가 부족한 채로 광고를 켜면, 손님이 와도 떠나요.</p>
          {g ? <GateBars scores={g.scores} /> : <p className="t-muted center">먼저 캡처 진단을 해 주세요.</p>}
        </>
      ) : (
        <>
          <h1 className="t-h1">2주 실험 카드</h1>
          <p className="t-sub">한 번에 매체 하나만, 예산과 그만둘 기준을 먼저 정해요. 결과는 과장하지 않고 확률로 읽어요.</p>
          <label className="t-label" htmlFor="ad-ch">매체 하나</label>
          <select id="ad-ch" className="t-input" value={channel} onChange={(e) => setChannel(e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select>
          <label className="t-label" htmlFor="ad-b">2주 예산 (만 원)</label>
          <input id="ad-b" className="t-input" type="number" min={1} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          <label className="t-label" htmlFor="ad-s">중지 기준</label>
          <select id="ad-s" className="t-input" value={stop} onChange={(e) => setStop(e.target.value)}>{STOPS.map((c) => <option key={c}>{c}</option>)}</select>
          <div className="t-actions"><button type="button" className="btn accent" onClick={() => setProg({ adPlan: { channel, budget, stopRule: stop, start: today } })}>실험 카드 저장</button></div>
          {p.adPlan && (
            <div className="t-card"><b>{p.adPlan.channel} · {p.adPlan.budget}만 원 · 2주</b><p className="t-muted">{p.adPlan.start}부터 · {p.adPlan.stopRule}</p></div>
          )}
        </>
      )}
    </main>
  );
}

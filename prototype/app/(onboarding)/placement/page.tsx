'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { ItemPlayer } from '@/components/train/ItemPlayer';
import { TI } from '@/components/train/icons';
import { placementItems, record, skillLevel, thetaOf } from '@/lib/train/engine';
import { unitOf } from '@/lib/train/bank';

/** S4 배치 테스트 (A3): 10문제로 스킬별 시작 실력을 재요. 문제마다 정답을 바로 알려 주지 않아요. */
export default function Placement() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, setTrain, setProg, today } = useTrain();
  const items = useMemo(() => placementItems(), []);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main className="screen ob fade">
        <div className="ob-step">3 / 4</div>
        <h1 className="title">시작 실력이 나왔어요</h1>
        <p className="body-text">맞힐 확률이 70% 정도인 문제부터 나와요. 풀수록 실력과 난이도가 함께 맞춰져요.</p>
        <ul className="ob-skills">
          {(['photo', 'review'] as const).map((s) => (
            <li key={s}><span>{unitOf(s).title}</span><b>Lv.{skillLevel(thetaOf(t, s))}</b></li>
          ))}
        </ul>
        <div className="bottom"><button className="btn" type="button" onClick={() => { setProg({ placementDone: true }); router.push('/goal'); }}>다음</button></div>
      </main>
    );
  }
  return (
    <main className="t-lesson">
      <div className="t-ltop">
        <button type="button" onClick={() => { setProg({ placementDone: true }); router.push('/goal'); }} aria-label="건너뛰기">{TI.close}</button>
        <div className="t-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>
        <span className="t-where">배치 테스트 {i + 1}/{items.length}</span>
      </div>
      <ItemPlayer key={items[i].id} item={items[i]} feedback={false}
        onAnswer={(a) => setTrain((s) => record(s, items[i], a.ok, 'placement', today, a.ms).state)}
        onNext={() => (i + 1 < items.length ? setI(i + 1) : setDone(true))} />
    </main>
  );
}

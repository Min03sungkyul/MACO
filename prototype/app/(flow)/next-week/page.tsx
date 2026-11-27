'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Option, TopBar, WhenReady } from '@/components/ui';
import { useStore } from '@/lib/store';

/** J 다음 주 정하기 (⑥ 재처방): up / keep / down, recommended from the done rate only. */
export default function NextWeek() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { rec, n, rows, data, set } = useStore();
  const miss = rows.find((r) => r.record?.status === 'rest');
  const [k, setK] = useState<0 | 1 | 2>(rec.k);
  const [ease, setEase] = useState(true);
  const labels: [string, string][] = [
    ['올리기', rec.options[0] > n ? `${rec.options[0]}번으로 늘려요` : '횟수는 그대로, 과제를 조금 어렵게'],
    ['유지', `이번처럼 ${n}번`],
    ['내리기', rec.options[2] < n ? `${rec.options[2]}번으로 줄여요` : '횟수는 그대로, 과제를 더 짧게'],
  ];
  const go = () => {
    set({ nextWeek: { n: rec.options[k], easeDay: ease && miss ? miss.day : null } });
    router.push('/next-week/plan');
  };
  const cycleWeek = ((data.week - 1) % 4) + 1;

  return (
    <main className="screen fade">
      <TopBar title="다음 주 정하기" backHref="/report" />
      <h1 className="title" style={{ marginTop: 12 }}>다음 주는{'\n'}어떻게 갈까요?</h1>
      <div className="hint" style={{ marginTop: 10 }}><Avatar size={22} />
        <span>이번 주 {rec.rate}%라 {['조금 늘리는 걸', '지금 속도를', '조금 줄이는 걸'][rec.k]} 추천해요.</span></div>
      <div className="opts">
        {labels.map(([t, s], i) => (
          <Option key={t} pressed={k === i} onClick={() => setK(i as 0 | 1 | 2)} sub={s}
            label={<>{t}{i === rec.k && <span className="rec">추천</span>}</>} />
        ))}
      </div>
      {miss && (
        <div className="sec">
          <div className="k">막혔던 부분 반영</div>
          <div className="ease">
            <div><strong>{miss.day}요일 과제를 5분짜리로</strong><span>쉬어 간 이유: {miss.record?.reason}</span></div>
            <button className="sw2" type="button" role="switch" aria-checked={ease} aria-label="짧은 과제로 바꾸기" onClick={() => setEase(!ease)} />
          </div>
        </div>
      )}
      <div className="cycle"><span>재진단까지</span><div className="seg">{[1, 2, 3, 4].map((w) => <i key={w} className={w <= cycleWeek ? 'on' : ''} />)}</div><span>{cycleWeek}/4주</span></div>
      <div className="bottom"><button className="btn" type="button" onClick={go}>다음 주 루틴 보기</button></div>
    </main>
  );
}

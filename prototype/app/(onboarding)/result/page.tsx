'use client';

import Link from 'next/link';
import { WhenReady } from '@/components/ui';
import { useStore } from '@/lib/store';

/** C 진단 결과: track, level, channel, time, barrier + fix, first-week goal. */
export default function Result() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { analysis: a, data } = useStore();
  const busy = data.busyCells.length;
  return (
    <main className="screen fade">
      <div className="eyebrow">진단 결과</div>
      <h1 className="title">사장님은{'\n'}{a.track} 트랙,{'\n'}{a.levelName} 단계예요</h1>
      <dl className="stats">
        <div><dt>트랙</dt><dd>{a.track}</dd></div>
        <div><dt>시작 수준</dt><dd>{a.levelName}<span className="lv">{[0, 1, 2].map((k) => <i key={k} className={k <= a.level ? 'on' : ''} />)}</span></dd></div>
        <div><dt>주력 채널</dt><dd>{a.channel}</dd></div>
        <div><dt>홍보에 쓸 시간</dt><dd>{a.hours}</dd></div>
        <div><dt>피할 시간</dt><dd>{busy ? `${busy}칸` : '없음'}</dd></div>
      </dl>
      <div className="box">
        <div className="k">가장 막히는 부분</div>
        <div className="v">{a.barrier.label}</div>
        <div className="r">{a.barrier.fix}</div>
      </div>
      {busy > 0 && <p className="body-text busy-note">바쁘다고 고른 시간은 피해서 루틴을 짜요.</p>}
      <div className="goal"><span className="k">첫 주 목표</span><span className="v">{a.kind} {a.tasksPerWeek}건</span></div>
      <div className="bottom">
        <Link className="btn" href="/plan">이번 주 루틴 받기</Link>
        <div className="foot">4주마다 다시 진단해서 트랙과 수준을 맞춰요</div>
      </div>
    </main>
  );
}

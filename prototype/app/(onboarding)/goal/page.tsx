'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { GOALS } from '@/lib/train/engine';
import { REGIONS } from '@/lib/train/league';

const HABITS = ['마감 정리 후', '오픈 준비 전', '점심 장사 후', '퇴근길'];

/** S5 목표 설정 (A5·C2·G2): 하루 목표, 습관 고리, 랭킹 지역 */
export default function GoalPage() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, p, setTrain, setProg } = useTrain();
  const [goal, setGoal] = useState(t.goal);
  const [habit, setHabit] = useState(p.habit ?? HABITS[0]);
  const [region, setRegion] = useState(p.region);

  const finish = () => {
    setTrain((s) => ({ ...s, goal }));
    setProg({ habit, region, onboarded: true });
    router.replace(p.mode === 'shop' ? '/shop/diagnose?first=1' : '/train');
  };
  return (
    <main className="screen ob fade">
      <div className="ob-step">4 / 4</div>
      <h1 className="title">하루 목표를 정해요</h1>
      <div className="ob-goals" role="group" aria-label="하루 목표">
        {GOALS.map((g) => (
          <button key={g.xp} type="button" aria-pressed={goal === g.xp} onClick={() => setGoal(g.xp)}>
            <b>{g.label}</b><span>하루 {g.min}분 · {g.xp} XP</span>
          </button>
        ))}
      </div>
      <h2 className="ob-h2">언제 할까요?</h2>
      <p className="ob-note">이미 매일 하는 일 뒤에 붙이면 잊지 않아요 (습관 고리).</p>
      <div className="chips" role="group" aria-label="훈련 시간">
        {HABITS.map((h) => <button key={h} type="button" className="chip" aria-pressed={habit === h} onClick={() => setHabit(h)}>{h}</button>)}
      </div>
      <h2 className="ob-h2">랭킹 지역</h2>
      <p className="ob-note">{p.mode === 'shop' ? '가게 주소의 구로 정했어요. 바꿀 수 있어요.' : '관심 지역을 골라 주세요.'}</p>
      <select className="ob-select" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="랭킹 지역">
        {[...new Set([region, ...REGIONS])].map((r) => <option key={r}>{r}</option>)}
      </select>
      <div className="bottom"><button className="btn" type="button" onClick={finish}>트레이닝 시작하기</button></div>
    </main>
  );
}

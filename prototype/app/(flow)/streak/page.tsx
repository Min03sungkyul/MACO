'use client';

import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { bestStreak, goalMet } from '@/lib/train/engine';

/** 스트릭 (C3): 일일 목표를 채운 연속 일수 */
export default function Streak() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, today, dates, streakNow } = useTrain();
  const names = ['월', '화', '수', '목', '금', '토', '일'];
  const doneToday = goalMet(t, today);
  return (
    <main className="t-center fade">
      <div className="hero">
        <div className="t-flame">{TI.flame}</div>
        <div className="t-streak-n">{streakNow}</div>
        <h1>{streakNow ? `${streakNow}일 연속 목표 달성` : '오늘 목표를 채워 볼까요?'}</h1>
        <p className="lead">{doneToday ? `내일도 목표를 채우면 ${streakNow + 1}일이 돼요. 바쁜 날은 2분 복습으로 이어 갈 수 있어요.` : `하루 목표 ${t.goal} XP를 채우면 연속 기록이 쌓여요.`}</p>
        <div className="t-week" aria-label="이번 주 목표 달성">
          {dates.map((d, i) => <span key={d} className={d === today ? 'today' : ''}><i className={goalMet(t, d) ? 'on' : ''}>{goalMet(t, d) ? TI.check : null}</i>{names[i]}</span>)}
        </div>
        <p className="t-note">최고 기록 <b>{bestStreak(t)}</b>일</p>
      </div>
      <button type="button" className="btn" onClick={() => router.replace('/train')}>{doneToday ? '확인' : '트레이닝하러 가기'}</button>
    </main>
  );
}

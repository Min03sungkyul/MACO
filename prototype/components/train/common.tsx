'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui';
import { streak, totalXp, type TrainState } from '@/lib/train/engine';
import type { Progress } from '@/lib/train/progress';
import { useStore } from '@/lib/store';
import { TI } from './icons';

/** Store access for the training screens. */
export function useTrain() {
  const st = useStore();
  const t = st.data.train, p = st.data.prog;
  const setTrain = (f: (t: TrainState) => TrainState) => st.set((d) => ({ train: f(d.train) }));
  const setProg = (patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) =>
    st.set((d) => ({ prog: { ...d.prog, ...(typeof patch === 'function' ? patch(d.prog) : patch) } }));
  const xpToday = t.days[st.today]?.xp ?? 0;
  return { ...st, t, p, setTrain, setProg, xpToday, streakNow: streak(t, st.today), total: totalXp(t) };
}

/** 일일 목표 링 (기획서 C2): 오늘 XP / 목표 XP */
export function GoalRing({ xp, goal, size = 44, label = true }: { xp: number; goal: number; size?: number; label?: boolean }) {
  const r = 18, c = 2 * Math.PI * r, f = Math.min(1, xp / goal);
  return (
    <span className="t-ring" style={{ width: size, height: size }} aria-label={`오늘 ${xp} / ${goal} XP`}>
      <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r={r} className="bg" /><circle cx="22" cy="22" r={r} className={`fg ${f >= 1 ? 'full' : ''}`} strokeDasharray={`${c * f} ${c}`} /></svg>
      {label && <b>{f >= 1 ? TI.check : Math.round(f * 100)}</b>}
    </span>
  );
}

/** 탭 위쪽 막대: 로고 · 스트릭 · 오늘 XP와 목표 링 */
export function TopBar() {
  const { t, xpToday, streakNow } = useTrain();
  return (
    <header className="t-top">
      <Logo className="t-logo" />
      <Link className={`t-stat fire ${streakNow ? '' : 'off'}`} href="/streak" aria-label={`연속 ${streakNow}일`}>{TI.flame}<span>{streakNow}</span></Link>
      <Link className="t-stat xp" href="/me" aria-label={`오늘 ${xpToday} XP`}>{TI.bolt}<span>{xpToday}</span></Link>
      <GoalRing xp={xpToday} goal={t.goal} size={34} label={false} />
    </header>
  );
}

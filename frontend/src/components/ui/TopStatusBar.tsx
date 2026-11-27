'use client';

import { useStatus } from '@/lib/api/common';
import { GoalRing } from './GoalRing';

/** 상단 바: 스트릭 🔥, 오늘 XP, 일일 목표 링 (GET /me/status) */
export function TopStatusBar({ title }: { title: string }) {
  const { data } = useStatus();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-bg">
      <h1 className="flex-1 text-xl font-bold">{title}</h1>
      <span className="text-sm font-semibold" aria-label={`연속 ${data?.streakDays ?? 0}일`}>🔥 {data?.streakDays ?? 0}</span>
      <span className="text-sm text-body">{data?.todayXp ?? 0} XP</span>
      <GoalRing xp={data?.todayXp ?? 0} goal={data?.goalXp ?? 60} size={36} />
    </header>
  );
}

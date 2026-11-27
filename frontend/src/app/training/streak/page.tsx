'use client';

import { Card, GoalRing, PageHeader, QueryView } from '@/components/ui';
import { useStatus } from '@/lib/api/common';
import { useStats } from '@/lib/api/me';

/** 연속 기록 (담당: 주승준). TODO(주승준): prototype/app/(flow)/streak/page.tsx (달력·최고 기록 연출) */
export default function StreakPage() {
  const status = useStatus();
  const stats = useStats();
  return (
    <main className="flex flex-col gap-5">
      <PageHeader title="연속 기록" />
      <QueryView query={status}>
        {(s) => (
          <Card className="flex items-center gap-4">
            <GoalRing xp={s.todayXp} goal={s.goalXp} size={64} />
            <div>
              <p className="text-3xl font-black">🔥 {s.streakDays}일</p>
              <p className="text-sm text-sub">오늘 {s.todayXp}/{s.goalXp} XP · {s.today}</p>
            </div>
          </Card>
        )}
      </QueryView>
      <QueryView query={stats}>{(s) => <p className="text-sm text-sub">최고 기록 {s.bestStreak}일</p>}</QueryView>
    </main>
  );
}

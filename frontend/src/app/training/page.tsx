'use client';

import Link from 'next/link';
import { Card, GoalRing, LinkButton, QueryView } from '@/components/ui';
import { LessonPath } from '@/components/training/LessonPath';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { useStatus } from '@/lib/api/common';
import { usePath, useToday } from '@/lib/api/training';

/**
 * S6 트레이닝 홈 (담당: 주승준): 왼쪽 위 프로필, 오늘 목표, 오늘의 추천 레슨, 지그재그 돌다리 유닛 경로.
 * 지금 할 레슨(OPEN) 돌이 화면의 주 버튼이고, 추천 카드는 보조로 둔다 (accent는 한 곳만).
 * TODO(주승준): 약점 리포트 배너 (prototype/app/(tabs)/train/page.tsx)
 */
export default function TrainingPage() {
  const status = useStatus();
  const today = useToday();
  const path = usePath();
  const s = status.data;
  const goal = s?.goalXp ?? 60;
  const xp = s?.todayXp ?? 0;

  return (
    <main className="flex flex-col gap-5">
      <TrainingHeader />

      <Card className="flex items-center gap-4">
        <GoalRing xp={xp} goal={goal} size={56} />
        <div className="min-w-0">
          <p className="font-bold">{xp >= goal ? '오늘 목표를 채웠어요!' : `오늘 목표까지 ${goal - xp} XP`}</p>
          <p className="text-sm text-sub">
            오늘 {Math.round((s?.trainingSeconds ?? 0) / 60)}분 · {s?.solvedCount ?? 0}문제 · 연속 {s?.streakDays ?? 0}일
          </p>
        </div>
      </Card>

      {s?.needsRestart && (
        <Link href="/training/review" className="rounded-card bg-achieve-text/10 p-4">
          <p className="font-bold text-achieve-text">오늘은 2분만 해 볼까요?</p>
          <p className="text-sm text-body">며칠 쉬었어도 괜찮아요. 한 문제로 다시 시작해요.</p>
        </Link>
      )}

      <QueryView query={today}>
        {(t) => (
          <Card className="bg-soft">
            <p className="text-xs font-semibold text-sub">오늘의 추천 레슨</p>
            <h2 className="mt-1 text-lg font-bold">{t.title}</h2>
            <p className="text-sm text-sub">{t.reason}</p>
            <div className="mt-3"><LinkButton href={`/training/lesson/${t.lessonId}`} variant="primary">시작하기</LinkButton></div>
          </Card>
        )}
      </QueryView>

      <QueryView query={path} isEmpty={(d) => d.units.length === 0} empty={{ title: '아직 레슨이 없어요' }}>
        {(p) => (
          <div className="flex flex-col gap-8">
            {p.units.map((u, i) => <LessonPath key={u.skillCode} unit={u} no={i + 1} />)}
          </div>
        )}
      </QueryView>

      <Link href="/training/review" className="text-center text-sm text-sub underline">바쁜 날엔 2분 복습만 해도 연속 기록이 이어져요</Link>
    </main>
  );
}

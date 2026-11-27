'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, PageHeader, QueryView } from '@/components/ui';
import { updateSettings, useMe, useRegions } from '@/lib/api/common';

const GOALS = [{ xp: 30, label: '가볍게 5분' }, { xp: 60, label: '기본 10분' }, { xp: 120, label: '열심히 20분' }]; // 가정값 (XpPolicy)

/** S5 목표 설정: 하루 목표, 습관 고리, 랭킹 지역 (담당: 주승준). TODO(주승준): prototype/app/(onboarding)/goal/page.tsx */
export default function GoalPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const me = useMe();
  const regions = useRegions();
  const [goal, setGoal] = useState(60);
  const [habit, setHabit] = useState('마감 정리 후');
  const [regionId, setRegionId] = useState<number | null>(null);
  const save = useMutation({
    mutationFn: () => updateSettings({ dailyGoalXp: goal, habitCue: habit, regionId: regionId ?? undefined }),
    onSuccess: (m) => {
      qc.setQueryData(['me'], m);
      router.replace(m.mode === 'STORE' ? '/store/diagnose?first=1' : '/training');
    },
  });
  return (
    <main className="flex flex-col gap-6">
      <PageHeader />
      <h1 className="text-2xl font-bold">하루 얼마나 트레이닝할까요?</h1>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="하루 목표">
        {GOALS.map((g) => (
          <button key={g.xp} type="button" role="radio" aria-checked={goal === g.xp} onClick={() => setGoal(g.xp)}
            className={`rounded-option border-2 px-4 py-3 text-left ${goal === g.xp ? 'border-accent bg-accent-soft' : 'border-line'}`}>
            {g.label} <span className="text-sm text-sub">· {g.xp} XP</span>
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        언제 할까요? (습관 고리)
        <input value={habit} onChange={(e) => setHabit(e.target.value)} maxLength={50} className="rounded-option border border-line px-4 py-3 font-normal" />
      </label>
      <QueryView query={regions}>
        {(list) => (
          <label className="flex flex-col gap-2 text-sm font-semibold">
            랭킹 지역
            <select value={regionId ?? me.data?.region?.id ?? ''} onChange={(e) => setRegionId(Number(e.target.value))} className="rounded-option border border-line px-4 py-3 font-normal">
              <option value="">선택해 주세요</option>
              {list.map((r) => <option key={r.id} value={r.id}>{r.sido} {r.sigungu}</option>)}
            </select>
          </label>
        )}
      </QueryView>
      <Button variant="accent" disabled={save.isPending} onClick={() => save.mutate()}>시작하기</Button>
      {save.isError && <p role="alert" className="text-sm text-bad">{save.error.message}</p>}
    </main>
  );
}

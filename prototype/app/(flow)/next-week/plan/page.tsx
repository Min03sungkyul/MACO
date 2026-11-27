'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanView } from '@/components/PlanView';
import { WhenReady } from '@/components/ui';
import { buildPlan } from '@/lib/maco';
import { useStore } from '@/lib/store';

/** D2: next week's routine after re-prescription. Applied automatically next Monday. */
export default function NextPlan() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { analysis, data, dates, n, toast } = useStore();
  useEffect(() => { if (!data.nextWeek) router.replace('/next-week'); }, [data.nextWeek, router]);
  if (!data.nextWeek) return null;
  const tasks = buildPlan(analysis, data.nextWeek.n ?? n, data.nextWeek.easeDay, data.busyCells);
  const [y, m, d] = dates[0].split('-').map(Number);
  return (
    <PlanView eyebrow={`재처방 · ${data.week + 1}주차`} lead="다음 주는" tasks={tasks} firstDay={new Date(y, m - 1, d + 7)}
      cta="이대로 확정하기" onCta={() => { toast('다음 주 루틴을 확정했어요. 월요일부터 적용돼요'); router.push('/today'); }} />
  );
}

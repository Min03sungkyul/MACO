'use client';

import { useState } from 'react';
import { Card, QueryView, RankRow, TopStatusBar } from '@/components/ui';
import { useLeague, useRegionRank } from '@/lib/api/ranking';

/**
 * S22~S23 주간 리그·지역 랭킹 (담당: 박민하). 친구(S24)는 P1.
 * TODO(박민하): prototype/app/(tabs)/rank/page.tsx (남은 시간, 승급선 연출, 친구 탭)
 */
export default function RankingPage() {
  const [tab, setTab] = useState<'region' | 'league'>('region');
  return (
    <main className="flex flex-col gap-4">
      <TopStatusBar title="랭킹" />
      <div className="grid grid-cols-2 rounded-option bg-soft p-1" role="tablist">
        {(['region', 'league'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-option py-2 text-sm font-semibold ${tab === t ? 'bg-bg text-ink shadow-sm' : 'text-sub'}`}>
            {t === 'region' ? '지역 랭킹' : '주간 리그'}
          </button>
        ))}
      </div>
      {tab === 'region' ? <Region /> : <LeagueView />}
    </main>
  );
}

function Region() {
  const q = useRegionRank();
  return (
    <QueryView query={q}>
      {(r) => (
        <>
          <Card className="text-center">
            <p className="text-sm text-sub">이번 주 {r.region}</p>
            <p className="text-3xl font-black">{r.rank}위 <span className="text-base font-semibold text-sub">/ {r.total}명</span></p>
            <p className="text-sm text-accent">상위 {r.topPercent}%</p>
          </Card>
          <section>
            <h2 className="mb-1 font-bold">상위 10명</h2>
            <ol>{r.top.map((x) => <RankRow key={x.rank} {...x} />)}</ol>
          </section>
          <section>
            <h2 className="mb-1 font-bold">내 앞뒤</h2>
            <ol>{r.around.map((x) => <RankRow key={x.rank} {...x} />)}</ol>
          </section>
        </>
      )}
    </QueryView>
  );
}

function LeagueView() {
  const q = useLeague();
  return (
    <QueryView query={q} isEmpty={(l) => l.rows.length === 0} empty={{ title: '이번 주 리그에 아직 배정되지 않았어요', description: '오늘 목표를 채우면 리그에 들어가요' }}>
      {(l) => (
        <>
          <Card>
            <p className="font-bold">{l.tierName} 리그 · {l.myRank}위</p>
            <p className="text-sm text-sub">승급선까지 {l.xpToPromote} XP · 마감까지 {l.hoursLeft}시간</p>
          </Card>
          <ol>
            {l.rows.map((x) => (
              <RankRow key={x.rank} {...x} mark={x.rank <= l.promoteLine ? 'promote' : x.rank > l.demoteLine ? 'demote' : undefined} />
            ))}
          </ol>
        </>
      )}
    </QueryView>
  );
}

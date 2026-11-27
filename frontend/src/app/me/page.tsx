'use client';

import { Badge, Card, LinkButton, QueryView, TopStatusBar } from '@/components/ui';
import { useMe } from '@/lib/api/common';
import { useReport, useSkills, useStats } from '@/lib/api/me';

/**
 * S25 성장 리포트·학습 기록·스킬 맵 (담당: 박민하).
 * TODO(박민하): prototype/app/(tabs)/me/page.tsx (관문 점수 변화 그래프, 배지)
 */
export default function MePage() {
  const me = useMe();
  const stats = useStats();
  const report = useReport();
  const skills = useSkills();
  return (
    <main className="flex flex-col gap-4">
      <TopStatusBar title="내 정보" />
      <QueryView query={me}>
        {(m) => (
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">{m.nickname}</p>
              <p className="text-sm text-sub">{m.mode === 'STORE' ? '내 가게 모드' : '학습 모드'} · {m.region?.sigungu ?? '지역 없음'} · 오늘 {m.today}</p>
            </div>
            <LinkButton href="/me/settings" variant="secondary" full={false}>설정</LinkButton>
          </Card>
        )}
      </QueryView>
      <QueryView query={stats}>
        {(s) => (
          <Card className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xl font-bold">{s.weekXp}</p><p className="text-xs text-sub">이번 주 XP</p></div>
            <div><p className="text-xl font-bold">{s.trainingMinutesWeek}분</p><p className="text-xs text-sub">트레이닝 시간</p></div>
            <div><p className="text-xl font-bold">{s.accuracy}%</p><p className="text-xs text-sub">정답률</p></div>
          </Card>
        )}
      </QueryView>
      <QueryView query={report} isEmpty={(r) => r.weeks.length === 0} empty={{ title: '아직 기록이 없어요' }}>
        {(r) => (
          <Card>
            <h2 className="mb-3 font-bold">성장 리포트 (4주)</h2>
            <div className="flex h-32 items-end gap-3" aria-label="주차별 믿게 점수">
              {r.weeks.map((w) => (
                <div key={w.weekStart} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-accent" style={{ height: `${Math.max(4, w.trustScore ?? 0)}%` }} />
                  <span className="text-[10px] text-sub">{w.weekStart.slice(5) || w.weekStart}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-sub">막대: 믿게 관문 점수</p>
          </Card>
        )}
      </QueryView>
      <QueryView query={skills}>
        {(list) => (
          <Card>
            <h2 className="mb-2 font-bold">스킬 맵</h2>
            <ul className="grid grid-cols-2 gap-2">
              {list.map((s) => (
                <li key={s.skillCode} className="flex items-center justify-between rounded-option bg-soft px-3 py-2 text-sm">
                  {s.name}{s.ready ? <Badge tone="accent">Lv {s.level}</Badge> : <Badge>준비 중</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </QueryView>
    </main>
  );
}

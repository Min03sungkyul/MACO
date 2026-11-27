'use client';

import Link from 'next/link';
import { Badge, Card, LinkButton, QueryView, TopStatusBar } from '@/components/ui';
import { usePath, useToday } from '@/lib/api/training';

/**
 * S6 트레이닝 홈: 오늘의 추천 레슨, 유닛 경로 (담당: 주승준).
 * TODO(주승준): prototype/app/(tabs)/train/page.tsx (레슨 경로형 A안, 약점 리포트, 다시 시작 제안)
 */
export default function TrainingPage() {
  const today = useToday();
  const path = usePath();
  return (
    <main className="flex flex-col gap-5">
      <TopStatusBar title="트레이닝" />
      <QueryView query={today}>
        {(t) => (
          <Card className="bg-accent-soft">
            <p className="text-xs font-semibold text-accent">오늘의 추천 레슨</p>
            <h2 className="mt-1 text-lg font-bold">{t.title}</h2>
            <p className="text-sm text-sub">{t.reason}</p>
            <div className="mt-3"><LinkButton href={`/training/lesson/${t.lessonId}`} variant="accent">시작하기</LinkButton></div>
          </Card>
        )}
      </QueryView>
      <QueryView query={path} isEmpty={(d) => d.units.length === 0} empty={{ title: '아직 레슨이 없어요' }}>
        {(p) => (
          <div className="flex flex-col gap-4">
            {p.units.map((u) => (
              <section key={u.skillCode}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold">{u.name}</h3>
                  {u.ready ? <Badge tone="accent">Lv {u.skillLevel}</Badge> : <Badge>준비 중</Badge>}
                </div>
                <ol className="flex flex-col gap-2">
                  {u.nodes.map((n) => (
                    <li key={n.lessonId}>
                      {n.status === 'LOCKED' ? (
                        <div className="rounded-option border border-line p-3 text-sub">🔒 Lv{n.level} {n.title}</div>
                      ) : (
                        <Link href={`/training/lesson/${n.lessonId}`} className="block rounded-option border-2 border-accent p-3 font-semibold">
                          {n.status === 'DONE' ? '✅' : '▶'} Lv{n.level} {n.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </QueryView>
      <Link href="/training/review" className="text-center text-sm text-sub underline">바쁜 날엔 2분 복습만 해도 연속 기록이 이어져요</Link>
    </main>
  );
}

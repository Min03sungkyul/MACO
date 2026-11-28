'use client';

import Link from 'next/link';
import { QueryView } from '@/components/ui';
import { GATE_STYLE, buildSections } from '@/components/training/sections';
import { usePath } from '@/lib/api/training';

/**
 * S6 섹션 목록 (담당: 주승준): 관문 3개를 섹션으로 보여 주고, 누르면 경로의 그 섹션으로 간다.
 * 상단 유닛 띠의 오른쪽 버튼으로 들어온다.
 */
export default function TrainingSectionsPage() {
  const path = usePath();
  return (
    <main className="flex flex-col gap-4">
      <header className="sticky top-0 z-10 -mx-page flex h-14 items-center border-b border-line bg-bg px-page">
        <Link href="/training" aria-label="닫기" className="-ml-2 flex h-10 w-10 items-center justify-center text-ink">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
        <h1 className="flex-1 pr-8 text-center text-lg font-bold">트레이닝 경로</h1>
      </header>

      <QueryView query={path} isEmpty={(d) => d.units.length === 0} empty={{ title: '아직 섹션이 없어요' }}>
        {(p) => (
          <ol className="flex flex-col gap-4">
            {buildSections(p.units).map((s) => {
              const gate = GATE_STYLE[s.gate];
              const ratio = s.lessonCount ? s.doneCount / s.lessonCount : 0;
              const readyUnits = s.units.filter((u) => u.ready).length;
              return (
                <li key={s.gate}>
                  <Link href={`/training#section-${s.no}`} className="block overflow-hidden rounded-card border border-line bg-bg">
                    <div className="bg-soft p-4">
                      <p className="relative rounded-option bg-bg px-4 py-3 text-sm text-body">
                        {s.goal}
                        <span aria-hidden="true" className="absolute -bottom-1.5 right-10 h-3 w-3 rotate-45 bg-bg" />
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <h2 className="flex-1 text-xl font-bold">섹션 {s.no}</h2>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-bg ${gate.bg}`}>{s.name} 관문</span>
                      </div>
                      <p className="mt-1 text-xs text-sub">유닛 {s.units.length}개 · 열린 유닛 {readyUnits}개 · 레슨 {s.doneCount}/{s.lessonCount} 완료</p>
                      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`섹션 ${s.no} 진행`}>
                        <div className={`h-full rounded-full ${gate.bg}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
                      </div>
                      <p className={`mt-3 text-sm font-bold ${gate.text}`}>이 섹션으로 가기</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </QueryView>
    </main>
  );
}

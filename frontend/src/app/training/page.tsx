'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, GoalRing, LinkButton, QueryView } from '@/components/ui';
import { SectionPath } from '@/components/training/LessonPath';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { UnitBanner } from '@/components/training/UnitBanner';
import { buildSections, currentUnit } from '@/components/training/sections';
import { useStatus } from '@/lib/api/common';
import { usePath, useToday } from '@/lib/api/training';

/** 상단 바(64px) + 유닛 띠 아래를 지나간 유닛을 "지금 보는 유닛"으로 본다 */
const BANNER_LINE_PX = 200;

/**
 * S6 트레이닝 홈 (담당: 주승준)
 * 왼쪽 위 프로필 → 지금 보는 유닛 띠(고정) → 오늘 목표 → 추천 레슨 → 섹션(관문 3개) → 유닛(섹션마다 1~6) → 돌다리 레슨.
 * 돌을 누르면 카드가 열리고 그 안의 버튼으로 레슨을 시작한다.
 * TODO(주승준): 약점 리포트 배너 (prototype/app/(tabs)/train/page.tsx)
 */
export default function TrainingPage() {
  const status = useStatus();
  const today = useToday();
  const path = usePath();
  const sections = useMemo(() => (path.data ? buildSections(path.data.units) : []), [path.data]);
  const units = useMemo(() => sections.flatMap((s) => s.units), [sections]);

  const [selected, setSelected] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  // 스크롤 위치로 상단 띠의 유닛과 "맨 위로" 버튼을 바꾼다
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setShowTop(window.scrollY > 600);
        let key: string | null = null;
        for (const el of document.querySelectorAll<HTMLElement>('[data-unit-key]')) {
          if (el.getBoundingClientRect().top <= BANNER_LINE_PX) key = el.dataset.unitKey ?? null;
        }
        setActiveKey(key);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [units.length]);

  // 섹션 목록에서 "이 섹션으로 가기"로 들어오면 그 섹션까지 내려간다 (#section-2)
  useEffect(() => {
    if (!units.length || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [units.length]);

  const bannerUnit = units.find((u) => u.key === activeKey) ?? currentUnit(sections);
  const s = status.data;
  const goal = s?.goalXp ?? 60;
  const xp = s?.todayXp ?? 0;

  return (
    <main className="flex flex-col gap-5">
      <TrainingHeader />
      {bannerUnit && <UnitBanner unit={bannerUnit} />}

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
        {() => (
          <div className="flex flex-col gap-10">
            {sections.map((sec) => <SectionPath key={sec.gate} section={sec} selected={selected} onSelect={setSelected} />)}
          </div>
        )}
      </QueryView>

      <Link href="/training/review" className="text-center text-sm text-sub underline">바쁜 날엔 2분 복습만 해도 연속 기록이 이어져요</Link>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로"
          className="fixed bottom-[calc(var(--spacing-tabbar)+20px)] right-[max(16px,calc(50%-224px))] z-20 flex h-12 w-12 items-center justify-center rounded-option border-2 border-line bg-bg text-ink shadow-[0_4px_0_var(--color-line)]"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </main>
  );
}

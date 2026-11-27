'use client';

import Link from 'next/link';
import { useMe, useStatus } from '@/lib/api/common';

const MODE_LABEL = { LEARNING: '학습 모드', STORE: '내 가게 모드' } as const;

/**
 * S6 트레이닝 홈 상단 바: 왼쪽 위 프로필(누르면 내 정보), 오른쪽 연속 기록·오늘 XP.
 * 다른 탭은 공통 TopStatusBar를 그대로 쓴다.
 */
export function TrainingHeader() {
  const { data: me } = useMe();
  const { data: status } = useStatus();
  const name = me?.nickname ?? '';
  const streak = status?.streakDays ?? 0;

  return (
    <header className="sticky top-0 z-10 -mx-page flex h-16 items-center gap-3 border-b border-line bg-bg px-page">
      <Link href="/me" aria-label="내 정보 보기" className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-line bg-soft text-base font-bold text-ink">
          {name.slice(0, 1) || '나'}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{name || '내 프로필'}</span>
          <span className="block text-xs text-sub">{me?.mode ? MODE_LABEL[me.mode] : '트레이닝'}</span>
        </span>
      </Link>
      <span className="flex items-center gap-1 text-sm font-bold text-achieve-text" aria-label={`연속 ${streak}일`}>
        <FlameIcon /> {streak}
      </span>
      <span className="text-sm font-bold text-body" aria-label={`오늘 ${status?.todayXp ?? 0} XP`}>
        {status?.todayXp ?? 0} XP
      </span>
    </header>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.5 3-1.5 4.8-3 6.6C7.6 10.3 6 12 6 14.8A6 6 0 0 0 18 15c0-2.6-1.3-4.4-2.6-5.6.1 1.6-.5 2.8-1.6 3.3.3-3.6-.8-7.8-1.8-10.7Z" />
    </svg>
  );
}

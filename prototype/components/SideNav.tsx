'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo, TABS } from '@/components/ui';
import { GoalRing, useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';

/** 컴퓨터 화면용 왼쪽 메뉴. 휴대폰에서는 숨기고 아래 탭 바를 써요. */
export function SideNav() {
  const pathname = usePathname();
  const { t, p, xpToday, streakNow, ready } = useTrain();
  return (
    <aside className="sidenav" aria-label="메뉴">
      <Link href="/train" className="sidenav-logo" aria-label="MACO 트레이닝"><Logo /></Link>
      <nav>
        {TABS.map((tab) => {
          const on = pathname === tab.href || ('also' in tab && tab.also?.includes(pathname));
          return (
            <Link key={tab.href} href={tab.href} aria-current={on ? 'page' : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">{tab.icon}</svg>
              {tab.href === '/shop' && p.mode === 'learn' ? '연습 가게' : tab.label}
            </Link>
          );
        })}
      </nav>
      {ready && (
        <div className="sidenav-today">
          <GoalRing xp={xpToday} goal={t.goal} size={52} />
          <div><b>오늘 {xpToday} / {t.goal} XP</b><span>{TI.flame}연속 {streakNow}일</span></div>
        </div>
      )}
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMe } from '@/lib/api/common';

/** 하단 5탭. 학습 모드에서는 "내 가게"가 "연습 가게"로 바뀐다 (기획서 9장) */
export function TabBar() {
  const path = usePathname();
  const me = useMe();
  const tabs = [
    { href: '/training', label: '트레이닝', icon: '📚' },
    { href: '/exam', label: '시험', icon: '📝' },
    { href: '/store', label: me.data?.mode === 'LEARNING' ? '연습 가게' : '내 가게', icon: '🏪' },
    { href: '/ranking', label: '랭킹', icon: '🏆' },
    { href: '/me', label: '내 정보', icon: '👤' },
  ];
  return (
    <nav aria-label="탭" className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-tabbar max-w-app border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]">
      {tabs.map((t) => {
        const on = path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center text-[11px] ${on ? 'font-bold text-ink' : 'text-sub'}`}>
            <span className="text-lg" aria-hidden>{t.icon}</span>{t.label}
          </Link>
        );
      })}
    </nav>
  );
}

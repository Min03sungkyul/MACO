'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { IS_MOCK } from '@/lib/api/client';
import { getToken } from '@/lib/auth';
import { TabBar } from './TabBar';

const TAB_ROOTS = ['/training', '/exam', '/store', '/ranking', '/me'];
const PUBLIC = ['/', '/login'];

const subscribe = () => () => {};

/**
 * 앱 틀 (모바일 375~430px, 큰 화면은 가운데 480px). 탭 첫 화면에만 하단 탭을 보여 준다.
 * 로그인하지 않았으면 /login 으로 보낸다 (목업 모드는 그대로 통과).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const hasToken = useSyncExternalStore(subscribe, () => IS_MOCK || !!getToken(), () => true);
  const isPublic = PUBLIC.includes(path);
  const showTabs = TAB_ROOTS.includes(path);

  useEffect(() => {
    if (!isPublic && !hasToken) router.replace('/login');
  }, [isPublic, hasToken, router]);

  return (
    <div className={`relative mx-auto min-h-dvh max-w-app bg-bg px-page ${showTabs ? 'pb-[calc(var(--spacing-tabbar)+24px)]' : 'pb-8'}`}>
      {IS_MOCK && <p className="bg-accent-soft py-1 text-center text-[11px] text-accent">목업 모드 · 서버 없이 시연 데이터로 동작해요</p>}
      {children}
      {showTabs && <TabBar />}
    </div>
  );
}

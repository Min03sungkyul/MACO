'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Avatar, WhenReady } from '@/components/ui';
import { useStore } from '@/lib/store';
import { ALARMS } from '@/components/PlanView';

/** After login: marks the account as signed up, then shows when the first alarm comes. */
export default function Ready() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { rows, data, set, today } = useStore();

  useEffect(() => {
    if (status === 'authenticated' && !data.signedUp) {
      const via = new URLSearchParams(window.location.search).get('via');
      set({
        signedUp: true,
        joinedAt: today,
        ownerName: session?.user?.name ?? null,
        loginWith: via === 'kakao' || via === 'apple' || via === 'test' ? via : null,
      });
    }
    if (status === 'unauthenticated' && !data.signedUp) router.replace('/plan');
  }, [status, session, data.signedUp, set, router, today]);

  if (!data.signedUp) return null;
  const first = rows.find((r) => r.isToday || !r.past);
  return (
    <main className="screen done-screen fade">
      <Avatar size={64} alt="마코 캐릭터" />
      <h1 className="title">{data.ownerName ? `${data.ownerName} 사장님,\n` : ''}환영해요!</h1>
      <p className="body-text">
        지금까지 배운 기록이 저장됐어요. 내일도 한 단계씩 이어 가면 연속 기록이 쌓여요.{'\n'}학습 알림은 {!first ? '다음 주 월요일' : first.isToday ? '오늘' : `${first.day}요일`} {ALARMS[data.alarm]}에 드릴게요.
      </p>
      <div className="bottom"><Link className="btn" href="/learn">학습 계속하기</Link></div>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import type { Mode } from '@/lib/train/progress';

/** S2 모드 선택 (기획서 F1): "가게가 있으세요?" */
export default function ModePage() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { data, set, today, setProg } = useTrain();

  useEffect(() => {
    if (status === 'authenticated' && !data.signedUp) {
      const via = new URLSearchParams(window.location.search).get('via');
      set({ signedUp: true, joinedAt: today, ownerName: session?.user?.name ?? null, loginWith: via === 'kakao' || via === 'naver' || via === 'test' ? via : null });
    }
  }, [status, session, data.signedUp, set, today]);

  const choose = (mode: Mode) => { setProg({ mode }); router.push('/store'); };
  return (
    <main className="screen ob fade">
      <div className="ob-step">1 / 4</div>
      <h1 className="title">가게가 있으세요?</h1>
      <p className="body-text">같은 트레이닝을 하되, 문제의 배경이 달라져요. 나중에 언제든 바꿀 수 있고 실력은 그대로 이어져요.</p>
      <div className="ob-modes">
        <button type="button" onClick={() => choose('shop')}>
          <b>네, 운영 중이에요</b><span>내 가게 모드 · 내 가게 화면과 리뷰로 연습하고 실제로 적용해요</span>
        </button>
        <button type="button" onClick={() => choose('learn')}>
          <b>아직이에요</b><span>학습 모드 · 업종별 연습 가게로 배워요 (예비 창업자, 입문자)</span>
        </button>
      </div>
    </main>
  );
}

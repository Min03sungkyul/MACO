'use client';

import { useRouter } from 'next/navigation';
import { GateBars } from '@/components/store/GateBars';
import { Card, LinkButton, PageHeader, QueryView } from '@/components/ui';
import { useAdGate } from '@/lib/api/store';

/**
 * S21 광고 관문: 찾게·믿게를 통과해야 열린다. 2주 실험 카드는 P1 (담당: 강민국).
 * TODO(강민국): prototype/app/(flow)/shop/ads/page.tsx (매체·예산·중지 기준 실험 카드)
 */
export default function AdsPage() {
  const router = useRouter();
  const gate = useAdGate();
  return (
    <main className="flex flex-col gap-4">
      <PageHeader title="광고 관문" close onBack={() => router.push('/store')} />
      <QueryView query={gate}>
        {(g) => (
          <>
            <Card className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-5xl">{g.locked ? '🔒' : '🔓'}</p>
              <h1 className="text-xl font-bold">{g.locked ? '아직 광고는 일러요' : '광고를 시험해 볼 때예요'}</h1>
              {g.reason && <p className="text-sm text-sub">{g.reason}</p>}
            </Card>
            <Card><GateBars scores={g.scores} /></Card>
            {g.locked ? <LinkButton href="/training" variant="accent">관문 통과 트레이닝 하기</LinkButton>
              : <Card><b>2주 실험 카드</b><p className="mt-1 text-sm text-sub">매체 하나, 하루 예산, 멈출 기준을 정하고 2주만 시험해요. (준비 중)</p></Card>}
          </>
        )}
      </QueryView>
    </main>
  );
}

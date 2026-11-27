'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Button, Card, PageHeader, QueryView, useXpToast } from '@/components/ui';
import { addReviewRequest, createReviewCard } from '@/lib/api/store';

/**
 * S20 리뷰 요청 QR 카드: 미리보기·출력, 오늘 요청 수 기록 (담당: 강민국).
 * 문구는 대가 없는 요청만 (공정위 추천·보증 심사지침). TODO(강민국): prototype/app/(flow)/shop/qr/page.tsx
 */
export default function QrPage() {
  const router = useRouter();
  const { toast } = useXpToast();
  const card = useQuery({ queryKey: ['store', 'review-card'], queryFn: () => createReviewCard() });
  const [qr, setQr] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const add = useMutation({ mutationFn: addReviewRequest, onSuccess: (c) => { setCount(c.requestsToday); toast('오늘 요청 +1'); } });

  useEffect(() => {
    if (card.data) QRCode.toDataURL(card.data.qrTargetUrl, { margin: 1, width: 240 }).then(setQr).catch(() => setQr(null));
  }, [card.data]);

  return (
    <main className="flex flex-col gap-4">
      <PageHeader title="리뷰 요청 QR 카드" close onBack={() => router.push('/store')} />
      <QueryView query={card}>
        {(c) => (
          <>
            <Card className="flex flex-col items-center gap-3 py-6 text-center print:border-0">
              <p className="text-lg font-bold">{c.storeName}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr ? <img src={qr} alt="리뷰 남기기 QR 코드" width={200} height={200} /> : <div className="size-[200px] animate-pulse bg-soft" />}
              <p className="text-[15px]">{c.message}</p>
            </Card>
            <Button variant="secondary" onClick={() => window.print()}>카드 출력하기</Button>
            <Button variant="accent" disabled={add.isPending} onClick={() => add.mutate()}>오늘 손님께 부탁했어요 (+1)</Button>
            <p className="text-center text-sm text-sub">오늘 요청 {count ?? c.requestsToday}번</p>
          </>
        )}
      </QueryView>
    </main>
  );
}

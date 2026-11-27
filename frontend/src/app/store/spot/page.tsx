'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, LinkButton, PageHeader, QueryView, useXpToast } from '@/components/ui';
import { startSpotGame, tapSpot } from '@/lib/api/store';
import type { SpotTapResult } from '@/lib/types/store';

/**
 * S18 내 화면 틀린 곳 찾기: 진단 결과로 그린 플레이스 화면에서 손님이 떠나는 곳을 탭 (+5 XP, 담당: 강민국).
 * TODO(강민국): prototype/app/(flow)/shop/spot/page.tsx (실제 캡처 위 표시, 다 찾았을 때 연출)
 */
export default function SpotPage() {
  const router = useRouter();
  const { showXp, toast } = useXpToast();
  const game = useQuery({ queryKey: ['store', 'spot'], queryFn: startSpotGame, staleTime: Infinity });
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<SpotTapResult | null>(null);
  const tap = useMutation({
    mutationFn: (key: string) => tapSpot(game.data!.gameId, key),
    onSuccess: (r, key) => {
      setLast(r);
      showXp(r.xp);
      if (r.found) setFound((f) => (f.includes(key) ? f : [...f, key]));
      else toast(r.card);
    },
  });
  return (
    <main className="flex flex-col gap-4">
      <PageHeader title={game.data ? `틀린 곳 찾기 ${found.length}/${game.data.toFind}` : '틀린 곳 찾기'} close onBack={() => router.push('/store')} />
      <QueryView query={game}>
        {(g) => (
          <>
            <h1 className="text-xl font-bold">손님이 떠나는 곳 {g.toFind}개를 찾아 보세요</h1>
            <div className="overflow-hidden rounded-card border border-line">
              {g.rows.map((r) => (
                <button key={r.key} type="button" onClick={() => tap.mutate(r.key)} disabled={tap.isPending}
                  className={`flex w-full flex-col items-start border-b border-line px-4 py-3 text-left last:border-0 ${found.includes(r.key) ? 'bg-bad-soft' : ''}`}>
                  <b className={r.key === 'title' ? 'text-lg' : 'text-[15px]'}>{r.label}</b>
                  <span className="text-sm text-sub">{r.sub}</span>
                </button>
              ))}
            </div>
            {last?.found && <Card className="bg-accent-soft"><b>{last.card}</b>{last.tip && <p className="mt-1 text-sm">{last.tip}</p>}</Card>}
            {found.length >= g.toFind && <LinkButton href="/store" variant="accent">다 찾았어요!</LinkButton>}
          </>
        )}
      </QueryView>
    </main>
  );
}

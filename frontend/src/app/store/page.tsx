'use client';

import Link from 'next/link';
import { DiagnosisCards } from '@/components/store/DiagnosisCards';
import { GateBars } from '@/components/store/GateBars';
import { Badge, Card, LinkButton, ProgressBar, QueryView, TopStatusBar } from '@/components/ui';
import { useStoreHome } from '@/lib/api/store';

/**
 * S15 내 가게 홈 (학습 모드는 연습 가게): 3관문 점수, 진단 카드, 미션, 퀘스트 (담당: 강민국).
 * TODO(강민국): prototype/app/(tabs)/shop/page.tsx 화면 다듬기
 */
export default function StorePage() {
  const home = useStoreHome();
  return (
    <main className="flex flex-col gap-4">
      <TopStatusBar title={home.data?.store.practice ? '연습 가게' : '내 가게'} />
      <QueryView query={home}>
        {(h) => (
          <>
            <Card>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{h.store.name}</h2>
                {h.store.practice && <Badge tone="accent">연습</Badge>}
              </div>
              {h.latest ? (
                <div className="mt-3 flex flex-col gap-3">
                  <GateBars scores={h.latest.scores} />
                  <p className="text-xs text-sub">{h.latest.checkDate} 진단 · 70점이면 통과</p>
                </div>
              ) : <p className="mt-2 text-sm text-sub">아직 진단하지 않았어요</p>}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <LinkButton href="/store/diagnose" variant="accent">캡처 진단</LinkButton>
                <LinkButton href="/store/spot" variant="secondary">틀린 곳 찾기</LinkButton>
              </div>
            </Card>
            {h.latest && <Card><h3 className="mb-2 font-bold">진단 카드</h3><DiagnosisCards cards={h.latest.cards} /></Card>}
            <Card>
              <h3 className="mb-2 font-bold">실전 미션</h3>
              <ul className="flex flex-col gap-2">
                {h.missions.map((m) => (
                  <li key={m.id}>
                    {m.unlocked ? (
                      <Link href={`/store/mission/${m.id}`} className="block rounded-option border border-line p-3">
                        <b>{m.passed ? '✅ ' : ''}{m.title}</b>
                        <p className="text-sm text-sub">{m.description}</p>
                      </Link>
                    ) : <div className="rounded-option border border-line p-3 text-sub">🔒 {m.title} (스킬 Lv{m.unlockLevel}부터)</div>}
                  </li>
                ))}
              </ul>
            </Card>
            {h.quest && (
              <Card>
                <h3 className="font-bold">{h.quest.title}</h3>
                <div className="mt-2"><ProgressBar value={h.quest.done / h.quest.total} label="퀘스트 진행" /></div>
                <p className="mt-1 text-xs text-sub">{h.quest.done}/{h.quest.total}</p>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-2">
              <LinkButton href="/store/qr" variant="secondary">리뷰 요청 QR</LinkButton>
              <LinkButton href="/store/ads" variant="secondary">광고 관문</LinkButton>
            </div>
          </>
        )}
      </QueryView>
    </main>
  );
}

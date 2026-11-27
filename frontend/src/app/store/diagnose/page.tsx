'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DiagnosisCards } from '@/components/store/DiagnosisCards';
import { GateBars } from '@/components/store/GateBars';
import { Button, Card, ImageUploader, LinkButton, PageHeader } from '@/components/ui';
import { confirmCapture, uploadCapture } from '@/lib/api/store';
import type { CaptureReadResponse, GateCheck, Readings } from '@/lib/types/store';

const BOOL_FIELDS: [keyof Readings, string][] = [
  ['hours', '영업시간이 있어요'], ['menuPrice', '메뉴에 가격이 있어요'], ['contact', '전화·주소가 있어요'],
  ['news', '소식을 올렸어요'], ['coupon', '쿠폰이 있어요'], ['insta', '인스타그램이 연결돼 있어요'],
];
const NUM_FIELDS: [keyof Readings, string, number][] = [
  ['photos', '사진 수', 1], ['reviews', '리뷰 수', 1], ['replied', '답글 단 리뷰 수', 1], ['rating', '별점', 0.1], ['recentReviewDays', '마지막 리뷰가 며칠 전', 1],
];

/**
 * S16~S17 캡처 진단: 플레이스 캡처 → AI가 읽은 항목 확인·수정 → 3관문 진단 (담당: 강민국).
 * AI가 FALLBACK이면 빈 값이 오고 사장님이 직접 채운다. 크롤링은 하지 않는다.
 * TODO(강민국): prototype/app/(flow)/shop/diagnose/page.tsx (첫 진단 연출, 인스타 캡처 예시)
 */
export default function DiagnosePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [read, setRead] = useState<CaptureReadResponse | null>(null);
  const [values, setValues] = useState<Readings | null>(null);
  const [result, setResult] = useState<GateCheck | null>(null);
  const upload = useMutation({ mutationFn: (f: File) => uploadCapture(f), onSuccess: (r) => { setRead(r); setValues(r.readings); } });
  const confirm = useMutation({
    mutationFn: () => confirmCapture(read!.captureId, values!),
    onSuccess: (g) => { setResult(g); qc.invalidateQueries({ queryKey: ['store'] }); },
  });

  return (
    <main className="flex flex-col gap-5">
      <PageHeader title="캡처 진단" close onBack={() => router.push('/store')} />
      {!read && (
        <>
          <h1 className="text-xl font-bold">네이버 플레이스 화면을 캡처해서 올려 주세요</h1>
          <p className="text-sm text-sub">마코가 영업시간·사진·리뷰 수를 읽고, 사장님이 확인해요.</p>
          <ImageUploader disabled={upload.isPending} onSelect={(f) => upload.mutate(f)} label="캡처 고르기" />
          {upload.isPending && <p className="text-sm text-sub">읽는 중이에요…</p>}
          {upload.isError && <p role="alert" className="text-sm text-bad">{upload.error.message}</p>}
        </>
      )}
      {read && values && !result && (
        <Card className="flex flex-col gap-3">
          <h2 className="font-bold">읽은 항목이 맞나요?</h2>
          {read.source === 'FALLBACK' && <p className="text-xs text-accent">자동으로 읽지 못했어요. 직접 채워 주세요.</p>}
          {BOOL_FIELDS.map(([k, label]) => (
            <label key={k} className="flex items-center justify-between text-[15px]">
              {label}
              <input type="checkbox" className="size-5 accent-accent" checked={values[k] as boolean} onChange={(e) => setValues({ ...values, [k]: e.target.checked })} />
            </label>
          ))}
          {NUM_FIELDS.map(([k, label, step]) => (
            <label key={k} className="flex items-center justify-between text-[15px]">
              {label}
              <input type="number" step={step} min={0} value={values[k] as number} onChange={(e) => setValues({ ...values, [k]: Number(e.target.value) })}
                className="w-24 rounded-option border border-line px-2 py-1 text-right" />
            </label>
          ))}
          <Button variant="accent" disabled={confirm.isPending} onClick={() => confirm.mutate()}>확인하고 진단 받기</Button>
          {confirm.isError && <p role="alert" className="text-sm text-bad">{confirm.error.message}</p>}
        </Card>
      )}
      {result && (
        <>
          <Card><GateBars scores={result.scores} /></Card>
          <Card>
            <h2 className="mb-2 font-bold">{result.scores.adUnlocked ? '광고 관문이 열렸어요 🔓' : '손님이 떠나는 곳부터 고쳐요'}</h2>
            <DiagnosisCards cards={result.cards} />
          </Card>
          <LinkButton href="/store/spot" variant="accent">내 화면에서 틀린 곳 찾기</LinkButton>
        </>
      )}
    </main>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { GateBars } from '@/components/train/shop';
import { readCapture, type Readings } from '@/lib/ai/adapter';
import { unitOf } from '@/lib/train/bank';
import { diagnosisCards, gateScores } from '@/lib/train/gates';

/** S16 캡처 진단 → S17 진단 결과 (A4·F4): 캡처 → AI가 항목 읽기 → 사장님이 확인·수정 → 규칙으로 관문 점수 */
export default function Diagnose() {
  return <WhenReady><Body /></WhenReady>;
}

const FIELDS: { key: keyof Readings; label: string; kind: 'bool' | 'num' }[] = [
  { key: 'hours', label: '영업시간이 있어요', kind: 'bool' },
  { key: 'menuPrice', label: '메뉴에 가격이 있어요', kind: 'bool' },
  { key: 'contact', label: '전화·주소가 있어요', kind: 'bool' },
  { key: 'photos', label: '사진 수', kind: 'num' },
  { key: 'reviews', label: '리뷰 수', kind: 'num' },
  { key: 'replied', label: '답글 단 리뷰 수', kind: 'num' },
  { key: 'rating', label: '별점', kind: 'num' },
  { key: 'recentReviewDays', label: '마지막 리뷰 (며칠 전)', kind: 'num' },
  { key: 'news', label: '소식이 있어요', kind: 'bool' },
  { key: 'coupon', label: '쿠폰이 있어요', kind: 'bool' },
  { key: 'insta', label: '인스타그램이 연결돼 있어요', kind: 'bool' },
];

function Body() {
  const router = useRouter();
  const { p, setProg, today } = useTrain();
  const first = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('first') === '1';
  const [img, setImg] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'reading' | 'confirm' | 'result'>('upload');
  const [r, setR] = useState<Readings | null>(null);

  const start = async (file: File | null) => {
    if (file) setImg(URL.createObjectURL(file));
    setStep('reading');
    setR(await readCapture(file));
    setStep('confirm');
  };
  const save = () => {
    if (!r) return;
    setProg((pp) => ({ gateChecks: [...pp.gateChecks, { date: today, readings: r, scores: gateScores(r) }] }));
    setStep('result');
  };
  const done = () => router.replace(first ? '/train' : '/shop');

  return (
    <main className="screen t-screen">
      <div className="t-ltop flat"><button type="button" onClick={done} aria-label="닫기">{TI.close}</button><span className="t-where">{first ? '시작 · ' : ''}캡처 진단</span></div>
      {step === 'upload' && (
        <>
          <h1 className="t-h1">플레이스 화면을 캡처해 주세요</h1>
          <p className="t-sub">네이버 플레이스 홈 화면 한 장이면 돼요. 크롤링하지 않고, 사장님이 올린 캡처만 읽어요.</p>
          <label className="t-upload">
            {TI.camera}<b>캡처 올리기</b><span>휴대폰 사진첩에서 골라요</span>
            <input type="file" accept="image/*" onChange={(e) => start(e.target.files?.[0] ?? null)} />
          </label>
          <button type="button" className="btn ghost" onClick={() => start(null)}>{p.mode === 'learn' ? '연습 가게 예시 캡처로 하기' : '예시 캡처로 해 보기'}</button>
          {first && <button type="button" className="link center" onClick={done}>나중에 할게요</button>}
        </>
      )}
      {step === 'reading' && (
        <div className="t-reading">{img && <img src={img} alt="올린 캡처" />}<p>마코가 캡처에서 항목을 읽고 있어요…</p></div>
      )}
      {step === 'confirm' && r && (
        <>
          <h1 className="t-h1">읽은 항목을 확인해 주세요</h1>
          <p className="t-sub">숫자가 틀렸으면 고쳐 주세요. 확인한 값으로만 점수를 매겨요.</p>
          <p className="t-demo">시연용: 미리 저장한 읽기 결과예요. AI 키를 연결하면 실제 캡처를 읽어요.</p>
          <ul className="t-fields">
            {FIELDS.map((f) => (
              <li key={f.key}>
                <label htmlFor={`f-${f.key}`}>{f.label}</label>
                {f.kind === 'bool'
                  ? <input id={`f-${f.key}`} type="checkbox" checked={!!r[f.key]} onChange={(e) => setR({ ...r, [f.key]: e.target.checked })} />
                  : <input id={`f-${f.key}`} type="number" inputMode="decimal" step={f.key === 'rating' ? 0.1 : 1} min={0} value={Number(r[f.key])} onChange={(e) => setR({ ...r, [f.key]: Number(e.target.value) })} />}
              </li>
            ))}
          </ul>
          <div className="t-actions"><button type="button" className="btn accent" onClick={save}>이대로 점수 보기</button></div>
        </>
      )}
      {step === 'result' && r && (
        <>
          <h1 className="t-h1">기본기 진단 결과</h1>
          <GateBars scores={gateScores(r)} />
          <p className="t-note">70점 통과선은 가설이에요. 전문가 검토와 파일럿으로 맞춰 가요.</p>
          <h2 className="t-h2">진단 카드</h2>
          <ul className="t-diag">
            {diagnosisCards(r).map((c) => {
              const u = unitOf(c.skill);
              return (
                <li key={c.key}>
                  <span className="k">{c.gate}</span><b>{c.card}</b>
                  {u.ready ? <Link href={`/train/lesson/${c.skill}-1`}>{u.title} 연습하기</Link> : <span className="t-muted">{u.title} 레슨 준비 중</span>}
                </li>
              );
            })}
          </ul>
          <div className="t-actions">
            <Link className="btn accent" href="/shop/spot">내 화면에서 틀린 곳 찾기</Link>
            <button type="button" className="btn ghost" onClick={done}>{first ? '트레이닝 시작하기' : '내 가게로'}</button>
          </div>
        </>
      )}
    </main>
  );
}

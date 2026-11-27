'use client';

import Link from 'next/link';
import { WhenReady } from '@/components/ui';
import { TopBar, useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { GateBars, MISSIONS, missionOpen } from '@/components/train/shop';
import { unitOf } from '@/lib/train/bank';
import { adsUnlocked } from '@/lib/train/gates';
import { latestGate, shopName } from '@/lib/train/progress';

/** S15 내 가게 홈 (학습 모드에선 "연습 가게"): 관문 점수 · 해금된 미션 · 리뷰 QR · 광고 관문 */
export default function Shop() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { t, p } = useTrain();
  const g = latestGate(p);
  const learn = p.mode === 'learn';
  return (
    <main className="screen has-tabs t-screen">
      <TopBar />
      <h1 className="t-h1">{learn ? '연습 가게' : '내 가게'}</h1>
      <p className="t-sub">{shopName(p)} · {learn ? '연습 가게 화면으로 실제처럼 적용해 봐요' : '배운 걸 실제로 적용하는 곳이에요'}</p>

      <section className="t-card">
        <div className="t-row"><b>기본기 3관문</b>{g && <span className="t-muted">{g.date.slice(5).replace('-', '/')} 진단</span>}</div>
        {g ? <GateBars scores={g.scores} /> : <p className="t-muted">플레이스 화면 캡처 한 장으로 찾게 · 믿게 · 알리게 점수를 매겨요.</p>}
        <div className="t-actions row">
          <Link className="btn accent sm" href="/shop/diagnose">{g ? '다시 캡처하기' : '캡처로 진단하기'}</Link>
          {g && <Link className="btn ghost sm" href="/shop/spot">내 화면 틀린 곳 찾기</Link>}
        </div>
      </section>

      <h2 className="t-h2">실전 미션</h2>
      {MISSIONS.map((m) => {
        const open = missionOpen(t, m), done = p.missions[m.id];
        return open ? (
          <Link key={m.id} className="t-test-card" href={`/shop/mission/${m.id}`}>
            <span className="ic">{m.skill === 'photo' ? TI.camera : TI.chat}</span>
            <div><b>{m.title}</b><span>{done ? `첨삭 통과 · ${done.score}점` : learn ? '제출하고 첨삭받기' : '실행하고 첨삭받기 · +50 XP'}</span></div>
            <em>{done ? '완료' : '열림'}</em>
          </Link>
        ) : (
          <div key={m.id} className="t-test-card off">
            <span className="ic">{TI.lock}</span>
            <div><b>{m.title}</b><span>{unitOf(m.skill).title} Lv.{m.need}이 되면 열려요</span></div>
          </div>
        );
      })}

      <Link className="t-test-card" href="/shop/qr">
        <span className="ic">{TI.qr}</span>
        <div><b>첫 리뷰 20 프로그램</b><span>대가 없는 리뷰 요청 QR 카드 · 부탁한 손님 {p.qr.requests}명</span></div>
        <em>{(g?.readings.reviews ?? 0)}/20</em>
      </Link>

      <Link className={`t-test-card ${adsUnlocked(g?.scores ?? null) ? '' : 'locked'}`} href="/shop/ads">
        <span className="ic">{adsUnlocked(g?.scores ?? null) ? TI.megaphone : TI.lock}</span>
        <div><b>광고 관문</b><span>{adsUnlocked(g?.scores ?? null) ? '2주 실험 카드로 작게 시작해요' : '찾게·믿게 관문을 통과하면 열려요'}</span></div>
      </Link>

    </main>
  );
}

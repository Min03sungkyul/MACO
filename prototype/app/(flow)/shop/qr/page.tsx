'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { shopName } from '@/lib/train/progress';

/** S20 리뷰 요청 QR 카드 (D3 첫 리뷰 20): 대가 없는 요청 문구, 출력, 요청 수 기록 */
export default function QrCard() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { p, setProg, toast } = useTrain();
  const name = shopName(p);
  const [url, setUrl] = useState(p.qr.url || `https://map.naver.com/p/search/${encodeURIComponent(name)}`);
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#111111', light: '#ffffff' } }).then(setQr).catch(() => setQr(null));
  }, [url]);

  return (
    <main className="screen t-screen">
      <div className="t-ltop flat no-print"><button type="button" onClick={() => router.push('/shop')} aria-label="닫기">{TI.close}</button><span className="t-where">첫 리뷰 20 프로그램</span></div>
      <h1 className="t-h1 no-print">리뷰 요청 QR 카드</h1>
      <p className="t-sub no-print">계산대에 두고, 손님께 직접 한 번 부탁해요. 할인·서비스 같은 대가는 주지 않아요.</p>
      <div className="t-qrcard">
        <span className="k">{name}</span>
        <h2>오늘 어떠셨어요?</h2>
        {qr ? <img src={qr} alt="리뷰 페이지 QR 코드" /> : <div className="t-qr-empty">QR을 만들고 있어요</div>}
        <p>솔직한 한 줄 후기가 작은 가게에 큰 힘이 돼요.<br />카메라로 비추면 리뷰 페이지가 열려요.</p>
      </div>
      <label className="t-label no-print" htmlFor="qr-url">리뷰 페이지 주소</label>
      <input id="qr-url" className="t-input no-print" value={url} onChange={(e) => { setUrl(e.target.value); setProg((pp) => ({ qr: { ...pp.qr, url: e.target.value } })); }} />
      <div className="t-actions no-print">
        <button type="button" className="btn accent" onClick={() => window.print()}>카드 출력하기</button>
        <button type="button" className="btn ghost" onClick={() => { setProg((pp) => ({ qr: { ...pp.qr, requests: pp.qr.requests + 1 } })); toast('기록했어요. 오늘도 한 분께 부탁했어요!'); }}>
          손님 한 분께 부탁했어요 · 지금까지 {p.qr.requests}명
        </button>
      </div>
      <p className="t-note no-print">대가를 주고 받은 리뷰는 광고로 볼 수 있어요 (공정위 추천·보증 심사지침).</p>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { PRACTICE_STORES } from '@/lib/train/progress';
import { REGIONS } from '@/lib/train/league';

type Place = { name: string; category: string; address: string; demo?: boolean };

/** S3 가게 등록 (A2, 네이버 지역 검색) 또는 연습 가게 선택 (F2) */
export default function StorePage() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { p, setProg, toast } = useTrain();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Place[] | null>(null);
  const [demo, setDemo] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    const r = await fetch(`/api/local-search?q=${encodeURIComponent(q.trim())}`).then((x) => x.json()).catch(() => ({ items: [] }));
    setItems(r.items); setDemo(!!r.demo);
  };
  const pickShop = (x: Place) => {
    const gu = x.address.match(/(\S+구)/)?.[1];
    setProg({ shop: { name: x.name, category: x.category, address: x.address }, region: gu && REGIONS.includes(gu) ? gu : gu ?? p.region });
    router.push('/placement');
  };
  const pickPractice = (id: string, ready: boolean) => {
    if (!ready) return toast('MVP에서는 카페 연습 가게만 열려 있어요');
    setProg({ practice: id });
    router.push('/placement');
  };

  return (
    <main className="screen ob fade">
      <div className="ob-step">2 / 4</div>
      {p.mode === 'shop' ? (
        <>
          <h1 className="title">가게를 찾아볼게요</h1>
          <p className="body-text">네이버에 등록된 가게 이름으로 상호·업종·주소를 확인해요.</p>
          <form className="ob-search" onSubmit={(e) => { e.preventDefault(); search(); }}>
            <input id="shop-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="예: 부평 무화과 카페" aria-label="가게 이름" />
            <button type="submit" className="btn">검색</button>
          </form>
          {items && (
            <ul className="ob-results">
              {items.length === 0 && <li className="empty">검색 결과가 없어요. 이름을 다시 확인해 주세요.</li>}
              {items.map((x) => (
                <li key={x.name + x.address}><button type="button" onClick={() => pickShop(x)}><b>{x.name}</b><span>{x.category} · {x.address}</span></button></li>
              ))}
            </ul>
          )}
          {demo && <p className="ob-note">시연용 검색 결과예요. 검색 API 키를 연결하면 실제 가게가 나와요.</p>}
        </>
      ) : (
        <>
          <h1 className="title">어떤 가게로 연습할까요?</h1>
          <p className="body-text">관심 업종의 연습 가게 화면·메뉴·리뷰로 문제가 나와요.</p>
          <ul className="ob-results">
            {PRACTICE_STORES.map((s) => (
              <li key={s.id}><button type="button" className={s.ready ? '' : 'off'} onClick={() => pickPractice(s.id, s.ready)}><b>{s.name}</b><span>{s.category}{s.ready ? '' : ' · 준비 중'}</span></button></li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { placeRows } from '@/components/train/shop';
import { ERRORS } from '@/lib/train/bank';
import { XP, addXp } from '@/lib/train/engine';
import { RULES } from '@/lib/train/gates';
import { latestGate, shopName } from '@/lib/train/progress';

/** S18 내 화면 틀린 곳 찾기 (F6): 내 플레이스 화면에서 손님이 떠나는 곳을 탭. 찾을 때마다 +5 XP. */
export default function Spot() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { p, setProg, setTrain, today, toast } = useTrain();
  const g = latestGate(p);
  const [open, setOpen] = useState<string | null>(null);
  if (!g) { if (typeof window !== 'undefined') router.replace('/shop/diagnose'); return null; }
  const rows = placeRows(g.readings, shopName(p));
  const bad = rows.filter((x) => x.rule);
  const key = (id: string) => `${g.date}:${id}`;
  const found = bad.filter((x) => p.spotFound.includes(key(x.id))).length;

  const tap = (row: (typeof rows)[number]) => {
    if (!row.rule) return toast('여긴 괜찮아요');
    setOpen(row.id);
    if (p.spotFound.includes(key(row.id))) return;
    setProg((pp) => ({ spotFound: [...pp.spotFound, key(row.id)] }));
    setTrain((s) => addXp(s, today, XP.spot));
    toast(`찾았어요! +${XP.spot} XP`);
  };
  const rule = open ? RULES.find((x) => x.key === rows.find((r) => r.id === open)?.rule) : null;

  return (
    <main className="screen t-screen">
      <div className="t-ltop flat"><button type="button" onClick={() => router.push('/shop')} aria-label="닫기">{TI.close}</button><span className="t-where">틀린 곳 찾기 {found}/{bad.length}</span></div>
      <h1 className="t-h1">손님이 떠나는 곳 {bad.length}개를 찾아 보세요</h1>
      <p className="t-sub">내 플레이스 화면을 손님 눈으로 봐요. 이상한 곳을 탭해요.</p>
      <div className="t-place">
        {rows.map((x) => {
          const hit = x.rule && p.spotFound.includes(key(x.id));
          return (
            <button key={x.id} type="button" className={`t-place-row ${x.id === 'title' ? 'title' : ''} ${hit ? 'hit' : ''}`} onClick={() => tap(x)}>
              <b>{x.label}</b><span>{x.sub}</span>{hit && <i>{TI.check}</i>}
            </button>
          );
        })}
      </div>
      {rule && (
        <div className="t-mini reason"><b>{rule.card}</b><span>{rule.skill === 'photo' ? ERRORS['photo-hero'].tip : rule.skill === 'review' ? ERRORS['reply-late'].tip : '플레이스 정보를 채우면 손님이 묻지 않고 찾아와요.'}</span></div>
      )}
      {found === bad.length && <div className="t-actions"><button type="button" className="btn accent" onClick={() => router.push('/shop')}>다 찾았어요!</button></div>}
    </main>
  );
}

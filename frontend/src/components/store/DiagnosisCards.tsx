import Link from 'next/link';
import type { DiagnosisCard } from '@/lib/types/store';

const GATE = { FIND: '찾게', TRUST: '믿게', NOTIFY: '알리게' } as const;

/** 진단 카드: 점수가 낮은 항목부터, 연결된 트레이닝으로 */
export function DiagnosisCards({ cards }: { cards: DiagnosisCard[] }) {
  if (cards.length === 0) return <p className="text-sm text-good">모든 항목을 채웠어요 👏</p>;
  return (
    <ul className="flex flex-col gap-2">
      {cards.map((c) => (
        <li key={c.key} className="flex items-center gap-3 rounded-option border border-line p-3">
          <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-semibold text-body">{GATE[c.gate]}</span>
          <span className="flex-1 text-[15px]">{c.card}</span>
          {(c.skill === 'PHOTO' || c.skill === 'REVIEW') && <Link href="/training" className="text-sm font-semibold text-accent">연습</Link>}
        </li>
      ))}
    </ul>
  );
}

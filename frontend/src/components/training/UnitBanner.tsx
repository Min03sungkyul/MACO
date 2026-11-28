import Link from 'next/link';
import { GATE_STYLE, type TrainingUnit } from './sections';

/** S6 상단 고정 띠: 지금 보고 있는 유닛 (스크롤하면 바뀜), 오른쪽 버튼은 섹션 목록 */
export function UnitBanner({ unit }: { unit: TrainingUnit }) {
  const gate = GATE_STYLE[unit.gate];
  return (
    <div className="sticky top-16 z-10 -mx-page bg-bg px-page pb-3 pt-2">
      <div className={`flex items-stretch overflow-hidden rounded-card text-bg ${gate.banner}`}>
        <div className="min-w-0 flex-1 px-4 py-3" aria-live="polite">
          <p className="text-xs font-semibold opacity-90">섹션 {unit.sectionNo}, 유닛 {unit.no} · {unit.skillName}</p>
          <p className="truncate text-base font-bold">{unit.title}</p>
        </div>
        <Link href="/training/sections" aria-label="섹션 목록 보기" className="flex w-14 shrink-0 items-center justify-center border-l border-bg/30">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

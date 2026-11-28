import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import type { PathNode } from '@/lib/types/training';
import { GATE_STYLE, type GateStyle, type TrainingSection, type TrainingUnit } from './sections';

/** 돌다리 가로 위치(px). 가운데 → 오른쪽 → 가운데 → 왼쪽으로 물결처럼 반복한다. 375px에서도 화면 안에 들어오는 폭 */
const OFFSET = [0, 44, 60, 44, 0, -44, -60, -44];

const LOCKED_STONE = 'bg-off shadow-[0_6px_0_var(--color-off-deep)]';
const TROPHY_DONE = 'bg-achieve shadow-[0_6px_0_var(--color-achieve-text)]';

type Props = {
  section: TrainingSection;
  /** 말풍선 카드가 열린 돌 (`유닛key:레슨id`) */
  selected: string | null;
  onSelect: (key: string | null) => void;
};

/** S6 섹션 하나: 섹션 머리 + 유닛 1~6 + 지그재그 돌다리 + 섹션 끝 트로피 */
export function SectionPath({ section, selected, onSelect }: Props) {
  const gate = GATE_STYLE[section.gate];
  const allDone = section.lessonCount > 0 && section.doneCount === section.lessonCount;
  let step = 0; // 섹션 안에서 이어지는 돌 순서 (지그재그 위치)

  return (
    <section id={`section-${section.no}`} data-unit-key={section.units[0]?.key} aria-label={`섹션 ${section.no} ${section.name}`} className="scroll-mt-40">
      <div className="rounded-card border border-line bg-bg p-4">
        <p className={`text-xs font-bold ${gate.text}`}>섹션 {section.no} · {section.name} 관문</p>
        <p className="mt-1 text-sm text-body">{section.goal}</p>
        <p className="mt-2 text-xs text-sub">레슨 {section.doneCount}/{section.lessonCount} 완료 · 유닛 {section.units.length}개</p>
      </div>

      {section.units.map((unit) => {
        const stones = unit.ready ? unit.nodes : [null];
        return (
          <div key={unit.key} data-unit-key={unit.key} className="pt-6">
            <UnitDivider unit={unit} />
            <ol className="flex flex-col items-center gap-7 pt-6">
              {stones.map((node, i) => {
                const x = OFFSET[step++ % OFFSET.length];
                const key = `${unit.key}:${node?.lessonId ?? 'soon'}`;
                const open = selected === key;
                return (
                  <Fragment key={key}>
                    <li style={{ transform: `translateX(${x}px)` }}>
                      <Stone node={node} gate={gate} unit={unit} expanded={open} onClick={() => onSelect(open ? null : key)} />
                    </li>
                    {open && (
                      <li className="w-full">
                        <StoneCard node={node} gate={gate} unit={unit} index={i} offset={x} />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ol>
          </div>
        );
      })}

      <div className="flex flex-col items-center pt-8" style={{ transform: `translateX(${OFFSET[step % OFFSET.length]}px)` }}>
        <span className={`flex h-16 w-16 items-center justify-center rounded-full text-bg ${allDone ? TROPHY_DONE : LOCKED_STONE}`}>
          <TrophyIcon />
        </span>
        <span className={`mt-2 text-xs font-semibold ${allDone ? 'text-achieve-text' : 'text-sub'}`}>{section.name} 관문 통과</span>
      </div>
    </section>
  );
}

function UnitDivider({ unit }: { unit: TrainingUnit }) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-sub">
      <span className="h-px flex-1 bg-line" />
      <span className="max-w-[70%] text-center">유닛 {unit.no} · {unit.title}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Stone({ node, gate, unit, expanded, onClick }: {
  node: PathNode | null; gate: GateStyle; unit: TrainingUnit; expanded: boolean; onClick: () => void;
}) {
  const status = node?.status ?? 'LOCKED';
  const isOpen = status === 'OPEN';
  const label = node ? `Lv${node.level} ${node.title}` : `${unit.skillName} 준비 중`;
  const stoneClass = status === 'LOCKED' ? LOCKED_STONE : gate.stone;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={`${label} · ${status === 'DONE' ? '완료' : isOpen ? '지금 할 레슨' : '잠김'}`}
      className="group relative flex flex-col items-center"
    >
      {isOpen && !expanded && (
        <span className={`absolute -top-11 z-[1] whitespace-nowrap rounded-option border-2 border-line bg-bg px-3 py-1 text-sm font-bold motion-safe:animate-bounce ${gate.text}`}>
          시작
        </span>
      )}
      <span className="relative flex h-[92px] w-[92px] items-center justify-center">
        {isOpen && <ProgressRing unit={unit} gate={gate} />}
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full text-bg transition group-active:translate-y-1 group-active:shadow-none ${stoneClass}`}
        >
          {status === 'DONE' ? <CheckIcon /> : isOpen ? <StarIcon /> : <LockIcon />}
        </span>
      </span>
      <span className={`mt-1 max-w-32 text-center text-xs font-semibold ${status === 'LOCKED' ? 'text-sub' : 'text-body'}`}>{label}</span>
    </button>
  );
}

/** 지금 할 돌 둘레: 이 유닛에서 끝낸 레슨 비율 */
function ProgressRing({ unit, gate }: { unit: TrainingUnit; gate: GateStyle }) {
  const done = unit.nodes.filter((n) => n.status === 'DONE').length;
  const ratio = unit.nodes.length ? done / unit.nodes.length : 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 92 92" className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx="46" cy="46" r={r} fill="none" strokeWidth="7" className="stroke-line" />
      <circle cx="46" cy="46" r={r} fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(ratio, 0.04))} className={gate.ring} />
    </svg>
  );
}

/** 돌을 누르면 열리는 카드: 레슨 이름, 유닛 안 순서, 시작 버튼 */
function StoneCard({ node, gate, unit, index, offset }: { node: PathNode | null; gate: GateStyle; unit: TrainingUnit; index: number; offset: number }) {
  const status = node?.status ?? 'LOCKED';
  const locked = status === 'LOCKED';
  return (
    <div className={`relative rounded-card p-4 ${locked ? 'border border-line bg-soft text-body' : `${gate.bg} text-bg`}`}>
      {/* 돌을 가리키는 작은 꼬리 */}
      <span
        aria-hidden="true"
        className={`absolute -top-1.5 left-1/2 h-3 w-3 rotate-45 ${locked ? 'border-l border-t border-line bg-soft' : gate.bg}`}
        style={{ marginLeft: offset - 6 }}
      />
      <p className="text-xs font-semibold opacity-90">섹션 {unit.sectionNo}, 유닛 {unit.no} · {unit.skillName}</p>
      <h3 className="mt-1 text-lg font-bold">{node ? node.title : unit.title}</h3>
      <p className="text-sm opacity-90">
        {!node
          ? '준비 중이에요. 곧 레슨이 열려요.'
          : locked
            ? '앞 레슨을 끝내면 열려요.'
            : `레슨 ${index + 1}/${unit.nodes.length}${node.bestAccuracy != null ? ` · 최고 정답률 ${node.bestAccuracy}%` : ''}`}
      </p>
      {node && !locked && (
        <Link
          href={`/training/lesson/${node.lessonId}`}
          className={`mt-3 flex min-h-12 w-full items-center justify-center rounded-button bg-bg text-base font-bold shadow-[0_4px_0_var(--color-line)] active:translate-y-1 active:shadow-none ${gate.text}`}
        >
          {status === 'DONE' ? '다시 하기' : '시작하기'}
        </Link>
      )}
    </div>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const CheckIcon = () => <Svg><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
const StarIcon = () => <Svg><path fill="currentColor" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" /></Svg>;
const LockIcon = () => <Svg><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>;
const TrophyIcon = () => <Svg><path d="M8 4h8v5a4 4 0 0 1-8 0Z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" /></Svg>;

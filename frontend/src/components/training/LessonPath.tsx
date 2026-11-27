import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PathNode, PathUnit } from '@/lib/types/training';

/** 돌다리 가로 위치(px). 가운데 → 오른쪽 → 가운데 → 왼쪽으로 물결처럼 반복한다. 375px에서도 화면 안에 들어오는 폭 */
const OFFSET = [0, 44, 60, 44, 0, -44, -60, -44];

type GateStyle = { label: string; banner: string; stone: string; bubble: string };

/** 관문별 색 (tokens.css의 gate 색). Tailwind가 클래스를 찾을 수 있게 전체 이름으로 적는다 */
const GATE: Record<string, GateStyle> = {
  FIND: {
    label: '찾게',
    banner: 'bg-gate-find shadow-[0_4px_0_var(--color-gate-find-deep)]',
    stone: 'bg-gate-find shadow-[0_6px_0_var(--color-gate-find-deep)]',
    bubble: 'text-gate-find',
  },
  TRUST: {
    label: '믿게',
    banner: 'bg-gate-trust shadow-[0_4px_0_var(--color-gate-trust-deep)]',
    stone: 'bg-gate-trust shadow-[0_6px_0_var(--color-gate-trust-deep)]',
    bubble: 'text-gate-trust',
  },
  NOTIFY: {
    label: '알리게',
    banner: 'bg-gate-notify shadow-[0_4px_0_var(--color-gate-notify-deep)]',
    stone: 'bg-gate-notify shadow-[0_6px_0_var(--color-gate-notify-deep)]',
    bubble: 'text-gate-notify',
  },
};

const LOCKED_STONE = 'bg-off shadow-[0_6px_0_var(--color-off-deep)]';
const TROPHY_DONE = 'bg-achieve shadow-[0_6px_0_var(--color-achieve-text)]';

/** S6 유닛 하나: 관문 색 띠 + 지그재그 돌다리 (레슨마다 돌 하나, 끝에 유닛 완료 트로피) */
export function LessonPath({ unit, no }: { unit: PathUnit; no: number }) {
  const gate = GATE[unit.gate] ?? GATE.FIND;
  const ready = unit.ready && unit.nodes.length > 0;
  const allDone = ready && unit.nodes.every((n) => n.status === 'DONE');

  return (
    <section aria-label={`유닛 ${no} ${unit.name}`} className="flex flex-col gap-6">
      <div className={`rounded-card p-4 ${ready ? `${gate.banner} text-bg` : 'bg-soft text-sub'}`}>
        <p className="text-xs font-semibold opacity-90">유닛 {no} · {gate.label} 관문</p>
        <h2 className="mt-0.5 text-lg font-bold">{unit.name}</h2>
        <p className="mt-0.5 text-sm opacity-90">{ready ? `지금 Lv ${unit.skillLevel}` : '준비 중이에요. 곧 레슨이 열려요.'}</p>
      </div>

      {ready && (
        <ol className="flex flex-col items-center gap-7 pb-2">
          {unit.nodes.map((n, i) => (
            <li key={n.lessonId} style={{ transform: `translateX(${OFFSET[i % OFFSET.length]}px)` }} className={n.status === 'OPEN' ? 'mt-8' : ''}>
              <Stone node={n} gate={gate} />
            </li>
          ))}
          <li style={{ transform: `translateX(${OFFSET[unit.nodes.length % OFFSET.length]}px)` }}>
            <div className="flex flex-col items-center" aria-label={allDone ? '유닛 완료' : '유닛 완료 (아직)'}>
              <span className={`flex h-16 w-16 items-center justify-center rounded-full text-bg ${allDone ? TROPHY_DONE : LOCKED_STONE}`}>
                <TrophyIcon />
              </span>
              <span className={`mt-2 text-xs font-semibold ${allDone ? 'text-achieve-text' : 'text-sub'}`}>유닛 완료</span>
            </div>
          </li>
        </ol>
      )}
    </section>
  );
}

function Stone({ node, gate }: { node: PathNode; gate: GateStyle }) {
  const label = `Lv${node.level} ${node.title}`;

  if (node.status === 'LOCKED') {
    return (
      <div className="flex flex-col items-center" aria-label={`${label} · 잠김`}>
        <span className={`flex h-16 w-16 items-center justify-center rounded-full text-bg ${LOCKED_STONE}`}><LockIcon /></span>
        <Caption muted>{label}</Caption>
      </div>
    );
  }

  const open = node.status === 'OPEN';
  return (
    <Link
      href={`/training/lesson/${node.lessonId}`}
      aria-label={`${label} · ${open ? '시작하기' : '다시 하기'}`}
      className="group relative flex flex-col items-center"
    >
      {open && (
        <span className={`absolute -top-10 whitespace-nowrap rounded-option border-2 border-line bg-bg px-3 py-1 text-sm font-bold motion-safe:animate-bounce ${gate.bubble}`}>
          시작
        </span>
      )}
      <span
        className={`flex items-center justify-center rounded-full text-bg transition group-active:translate-y-1 group-active:shadow-none ${gate.stone} ${
          open ? 'h-[76px] w-[76px] ring-4 ring-line ring-offset-4 ring-offset-bg' : 'h-16 w-16'
        }`}
      >
        {open ? <StarIcon /> : <CheckIcon />}
      </span>
      <Caption>{label}</Caption>
    </Link>
  );
}

function Caption({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <span className={`mt-2.5 max-w-32 text-center text-xs font-semibold ${muted ? 'text-sub' : 'text-body'}`}>{children}</span>;
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

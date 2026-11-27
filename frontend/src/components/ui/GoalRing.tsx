/** 일일 목표 링 (오늘 XP / 목표 XP). 목표를 채우면 achieve 색 */
export function GoalRing({ xp, goal, size = 44, showLabel = true }: { xp: number; goal: number; size?: number; showLabel?: boolean }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const ratio = goal > 0 ? Math.min(1, xp / goal) : 0;
  const done = ratio >= 1;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} aria-label={`오늘 목표 ${xp}/${goal} XP`}>
      <svg viewBox="0 0 40 40" width={size} height={size} className="-rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-line" />
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio)}
          className={done ? 'stroke-achieve' : 'stroke-accent'} />
      </svg>
      {showLabel && <span className="absolute text-[10px] font-bold text-ink">{Math.round(ratio * 100)}%</span>}
    </div>
  );
}

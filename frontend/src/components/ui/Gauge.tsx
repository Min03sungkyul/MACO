/** 관문 점수 막대 (0~100) + 통과선 (찾게·믿게·알리게) */
export function Gauge({ label, score, pass = 70 }: { label: string; score: number; pass?: number }) {
  const ok = score >= pass;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm font-semibold text-ink">{label}</span>
      <div className="relative h-3 flex-1 rounded-full bg-soft">
        <div className={`h-full rounded-full ${ok ? 'bg-good' : 'bg-accent'}`} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
        <span className="absolute -top-1 h-5 w-0.5 bg-ink" style={{ left: `${pass}%` }} aria-hidden />
      </div>
      <b className={`w-8 text-right text-sm ${ok ? 'text-good' : 'text-ink'}`}>{score}</b>
    </div>
  );
}

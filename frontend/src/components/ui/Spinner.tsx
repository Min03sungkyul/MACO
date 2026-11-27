/** 로딩 표시 */
export function Spinner({ label = '불러오는 중이에요' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-sub">
      <span className="size-8 animate-spin rounded-full border-4 border-line border-t-accent" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

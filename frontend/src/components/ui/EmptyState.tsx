import type { ReactNode } from 'react';

/** 빈 상태: 데이터가 없을 때 이유와 다음 행동 하나 */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-sub">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

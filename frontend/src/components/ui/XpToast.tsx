'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { XpResult } from '@/lib/types/common';

type Toast = { id: number; text: string; achieve: boolean };
const Ctx = createContext<{ showXp: (xp: XpResult | null | undefined) => void; toast: (text: string) => void }>({
  showXp: () => {},
  toast: () => {},
});

/**
 * XP 알림. 응답에 xp가 있으면 showXp(xp) 한 줄로 "+10 XP"·목표 달성·레벨 업을 보여 주고 상단 바를 새로 고친다.
 */
export function XpToastProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, achieve = false) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text, achieve }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const showXp = useCallback((xp: XpResult | null | undefined) => {
    if (!xp) return;
    qc.invalidateQueries({ queryKey: ['me', 'status'] });
    if (xp.gained > 0) push(`+${xp.gained} XP`);
    if (xp.goalAchievedNow) push('오늘 목표 달성! 🔥', true);
    xp.levelUps.forEach((l) => push(`${l.skill} 레벨 ${l.from} → ${l.to}`, true));
  }, [qc, push]);

  return (
    <Ctx.Provider value={{ showXp, toast: (t) => push(t) }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-16 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-full px-4 py-2 text-sm font-bold shadow ${t.achieve ? 'bg-achieve text-bg' : 'bg-ink text-bg'}`}>{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useXpToast = () => useContext(Ctx);

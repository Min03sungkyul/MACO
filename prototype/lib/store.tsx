'use client';

// 앱 상태 (프로토타입). 서버가 생기기 전까지 모두 브라우저 localStorage에 저장해요.
// train = 트레이닝 엔진 기록, prog = 모드·가게·관문·미션·시험·설정.
// 서버로 옮길 때의 모양은 docs/api-contract.md 를 보세요.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY_TRAIN, type TrainState } from './train/engine';
import { EMPTY_PROGRESS, type Progress } from './train/progress';

export type Persisted = {
  signedUp: boolean;
  ownerName: string | null;
  joinedAt: string | null; // YYYY-MM-DD
  loginWith: 'kakao' | 'naver' | 'apple' | 'test' | null;
  train: TrainState;
  prog: Progress;
};

const EMPTY: Persisted = { signedUp: false, ownerName: null, joinedAt: null, loginWith: null, train: EMPTY_TRAIN, prog: EMPTY_PROGRESS };

const KEY = 'maco:v2';

/** 월요일부터 일요일까지 날짜 (YYYY-MM-DD) */
export function weekDates(now: Date): string[] {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - dayIndex(now));
  return Array.from({ length: 7 }, (_, i) => ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i)));
}
export const dayIndex = (now: Date) => (now.getDay() + 6) % 7; // 월 = 0
const ymd = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

type Ctx = {
  ready: boolean;
  data: Persisted;
  set: (patch: Partial<Persisted> | ((d: Persisted) => Partial<Persisted>)) => void;
  reset: () => void;
  dates: string[];
  todayIndex: number;
  today: string;
  yesterday: string;
  toast: (msg: string) => void;
  toastMsg: string | null;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Persisted>(EMPTY);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 시연 도구 "날짜 넘기기": 앱의 모든 날짜가 dayOffset만큼 움직여요.
  const offset = data.prog.dayOffset;
  const now = useMemo(() => new Date(Date.now() + offset * 86400000), [offset]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const saved = JSON.parse(raw); setData({ ...EMPTY, ...saved, train: { ...EMPTY_TRAIN, ...saved.train }, prog: { ...EMPTY_PROGRESS, ...saved.prog } }); }
    } catch { /* 저장소를 못 쓰면 새로 시작 */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data, ready]);

  const set = useCallback<Ctx['set']>((patch) => {
    setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }));
  }, []);
  const reset = useCallback(() => setData(EMPTY), []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2000);
  }, []);

  const derived = useMemo(() => {
    const dates = weekDates(now);
    const todayIndex = dayIndex(now);
    const today = dates[todayIndex];
    const yesterday = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    return { dates, todayIndex, today, yesterday };
  }, [now]);

  const value: Ctx = { ready, data, set, reset, toast, toastMsg, ...derived };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function formatDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  return `${m}월 ${d}일`;
}

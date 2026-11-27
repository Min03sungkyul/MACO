'use client';

// App state for the prototype build. Everything lives in the browser
// (localStorage) until the team adds a backend; the shape below is the
// record format the backend should store per user.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  analyze, buildPlan, recommend, weekDates, weekRows, dayIndex,
  type Answers, type DayName, type DayRecord, type Task, type WeekRow,
} from './maco';
import { EMPTY_TRAIN, type TrainState } from './train/engine';
import { EMPTY_PROGRESS, type Progress } from './train/progress';

export type Persisted = {
  answers: Answers;
  busyCells: number[]; // diagnosis question 7: day × 3 + slot the owner marked hard
  diagnosed: boolean;
  signedUp: boolean;
  ownerName: string | null;
  joinedAt: string | null; // YYYY-MM-DD; tasks before this day are not counted
  loginWith: 'kakao' | 'naver' | 'apple' | 'test' | null;
  tasksPerWeek: number | null; // null = use the diagnosis value
  easeDay: DayName | null;
  nextWeek: { n: number; easeDay: DayName | null } | null; // confirmed re-prescription
  week: number;
  weekStart: string | null; // Monday of the week the routine is running
  records: Record<string, DayRecord>; // key = YYYY-MM-DD
  alarm: 0 | 1 | 2;
  train: TrainState; // training engine: Elo skill scores, attempts, XP per day, review schedule
  prog: Progress; // mode, shop, gate checks, missions, tests, settings
};

const EMPTY: Persisted = {
  answers: Array(6).fill(null),
  busyCells: [],
  diagnosed: false,
  signedUp: false,
  ownerName: null,
  joinedAt: null,
  loginWith: null,
  tasksPerWeek: null,
  easeDay: null,
  nextWeek: null,
  week: 1,
  weekStart: null,
  records: {},
  alarm: 0,
  train: EMPTY_TRAIN,
  prog: EMPTY_PROGRESS,
};

const KEY = 'maco:v2';
const SESSION_KEY = 'maco:flow';

type Session = {
  startedAt: number | null; // when "지금 하기" was pressed, to measure time spent
  target: string | null; // date (YYYY-MM-DD) of the task being done in the shoot → post → record flow
  busy: boolean; // today swapped to the 3-minute task
  photo: string | null; // object URL of the photo taken this session
  fromAlbum: boolean;
  caption: string | null;
  draftMinutes: number;
};

type Ctx = {
  ready: boolean;
  data: Persisted;
  set: (patch: Partial<Persisted> | ((d: Persisted) => Partial<Persisted>)) => void;
  reset: () => void;
  session: Session;
  setSession: (patch: Partial<Session>) => void;
  // derived
  analysis: ReturnType<typeof analyze>;
  n: number;
  plan: Task[];
  rows: WeekRow[];
  dates: string[];
  todayIndex: number;
  today: string;
  yesterday: string;
  todayRow: WeekRow | undefined;
  nextRow: WeekRow | undefined;
  rec: ReturnType<typeof recommend>;
  toast: (msg: string) => void;
  toastMsg: string | null;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Persisted>(EMPTY);
  const [session, setSessionState] = useState<Session>({ startedAt: null, target: null, busy: false, photo: null, fromAlbum: false, caption: null, draftMinutes: 10 });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 시연 도구 "날짜 넘기기": every date in the app moves with dayOffset.
  const offset = data.prog.dayOffset;
  const now = useMemo(() => new Date(Date.now() + offset * 86400000), [offset]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const saved = JSON.parse(raw); setData({ ...EMPTY, ...saved, train: { ...EMPTY_TRAIN, ...saved.train }, prog: { ...EMPTY_PROGRESS, ...saved.prog } }); }
      // The shoot → post → record flow survives a refresh (the photo itself does not).
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) setSessionState((cur) => ({ ...cur, ...JSON.parse(s), photo: null }));
    } catch { /* storage blocked: start fresh */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const { photo: _photo, ...rest } = session;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(rest));
    } catch { /* ignore */ }
  }, [session, ready]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data, ready]);

  // A new Monday: count the week up and apply the re-prescription confirmed last week (stage ⑥ → ②).
  useEffect(() => {
    if (!ready || !data.signedUp) return;
    const monday = weekDates(now)[0];
    if (data.weekStart === monday) return;
    setData((d) => ({
      ...d,
      weekStart: monday,
      week: d.weekStart ? d.week + 1 : d.week,
      ...(d.weekStart && d.nextWeek ? { tasksPerWeek: d.nextWeek.n, easeDay: d.nextWeek.easeDay, nextWeek: null } : {}),
    }));
  }, [ready, data.signedUp, data.weekStart, now]);

  const set = useCallback<Ctx['set']>((patch) => {
    setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }));
  }, []);
  const reset = useCallback(() => setData(EMPTY), []);
  const setSession = useCallback((patch: Partial<Session>) => setSessionState((s) => ({ ...s, ...patch })), []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2000);
  }, []);

  const derived = useMemo(() => {
    const analysis = analyze(data.answers);
    const n = data.tasksPerWeek ?? analysis.tasksPerWeek;
    const plan = buildPlan(analysis, n, data.easeDay, data.busyCells);
    // Tasks on days before the owner signed up are left out, so a mid-week start isn't counted as missed.
    const rows = weekRows(plan, data.records, now).filter((r) => !data.joinedAt || r.date >= data.joinedAt || r.record);
    const dates = weekDates(now);
    const todayIndex = dayIndex(now);
    const today = dates[todayIndex];
    const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    const todayRow = rows.find((r) => r.isToday);
    const nextRow = rows.find((r) => DAY_ORDER(r) > todayIndex && !r.record);
    // A week is judged on the tasks whose day has come (today included).
    const due = rows.filter((r) => r.past || r.isToday || r.record);
    const rec = recommend(due.length ? due : rows, n);
    return { analysis, n, plan, rows, dates, todayIndex, today, yesterday, todayRow, nextRow, rec };
  }, [data.answers, data.busyCells, data.tasksPerWeek, data.easeDay, data.records, data.joinedAt, now]);

  const value: Ctx = { ready, data, set, reset, session, setSession, toast, toastMsg, ...derived };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

const DAY_ORDER = (r: WeekRow) => ['월', '화', '수', '목', '금', '토', '일'].indexOf(r.day);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function formatDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  return `${m}월 ${d}일`;
}

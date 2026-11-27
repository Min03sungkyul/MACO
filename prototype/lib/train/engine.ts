// 훈련 엔진 (기획서 8장). AI 없이 규칙과 통계로만 판단해요.
// - Elo: p = 1 / (1 + e^-(θ - d)), θ ← θ + K(r - p), d ← d - K(r - p)
// - 다음 문제: 맞힐 확률 70% 근처 + 복습 예정 + 약점 유형을 먼저
// - XP·일일 목표·스트릭·바쁜 날 2분 복습 (8-2)

import { ERRORS, ITEMS, LEVELS, itemById, itemsOf, unitOf } from './bank.ts';
import type { ErrorType, Item, Level, SkillId } from './types.ts';

export const K_USER = 0.4;
export const K_ITEM = 0.15;
export const TARGET_P = 0.7;
export const LEVEL_D: Record<Level, number> = { 1: -1, 3: 0, 5: 1 };

export const XP = { correct: 10, wrong: 2, lesson: 10, quizCorrect: 4, quizPerfect: 10, spot: 5, unitTest: 30, mission: 50, streak7: 20 } as const;
export const DAILY_CAP = 300;
export const GOALS = [{ xp: 30, label: '가볍게', min: 5 }, { xp: 60, label: '기본', min: 10 }, { xp: 120, label: '열심히', min: 20 }] as const;
export const LESSON_SIZE = 6;
export const QUIZ_SIZE = 5;

export type Ctx = 'lesson' | 'quiz' | 'review' | 'placement' | 'notes' | 'unit';
export type Attempt = { item: string; ok: boolean; at: string; ms: number; ctx: Ctx; xp: number };
export type Day = { xp: number; sec: number; solved: number; busy?: boolean };
export type Review = { due: string; step: number };

export type TrainState = {
  theta: Partial<Record<SkillId, number>>;
  /** item id → learned difficulty change */
  dAdj: Record<string, number>;
  attempts: Attempt[];
  review: Record<string, Review>;
  /** error type → consecutive misses and total misses */
  errs: Partial<Record<ErrorType, { streak: number; total: number }>>;
  /** lesson node id (skill-level or skill-test) → best accuracy 0–100 */
  nodes: Record<string, number>;
  days: Record<string, Day>;
  goal: number;
  streakBonusAt: string | null;
};

export const EMPTY_TRAIN: TrainState = { theta: {}, dAdj: {}, attempts: [], review: {}, errs: {}, nodes: {}, days: {}, goal: 60, streakBonusAt: null };

/* ───────── dates ───────── */
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function addDays(day: string, n: number) {
  const [y, m, d] = day.split('-').map(Number);
  return iso(new Date(y, m - 1, d + n));
}

/* ───────── Elo ───────── */
export const pCorrect = (theta: number, d: number) => 1 / (1 + Math.exp(-(theta - d)));
export const difficulty = (s: TrainState, item: Item) => LEVEL_D[item.level] + (s.dAdj[item.id] ?? 0);
export const thetaOf = (s: TrainState, skill: SkillId) => s.theta[skill] ?? -1;

/** 스킬 레벨 1–5 (θ 기준, 가정값) */
export function skillLevel(theta: number): number {
  return theta < -0.5 ? 1 : theta < 0 ? 2 : theta < 0.5 ? 3 : theta < 1 ? 4 : 5;
}

export function eloUpdate(s: TrainState, item: Item, ok: boolean): TrainState {
  const th = thetaOf(s, item.skill), d = difficulty(s, item);
  const p = pCorrect(th, d), r = ok ? 1 : 0;
  return {
    ...s,
    theta: { ...s.theta, [item.skill]: th + K_USER * (r - p) },
    dAdj: { ...s.dAdj, [item.id]: (s.dAdj[item.id] ?? 0) - K_ITEM * (r - p) },
  };
}

/* ───────── choosing the next item ───────── */
export function isDue(s: TrainState, id: string, today: string) {
  const r = s.review[id];
  return !!r && r.due <= today;
}

export function weakErrors(s: TrainState) {
  return (Object.entries(s.errs) as [ErrorType, { streak: number; total: number }][])
    .filter(([, v]) => v.total > 0).sort((a, b) => b[1].streak - a[1].streak || b[1].total - a[1].total).map(([e]) => e);
}

/**
 * Score every candidate and take the best: close to 70% correct, due reviews and weak
 * error types first, the lesson's own level slightly preferred, already-used items skipped.
 */
export function pickNext(s: TrainState, skill: SkillId, maxLevel: Level, used: string[], today: string, focus?: Level): Item | null {
  const weak = new Set(weakErrors(s).slice(0, 2));
  const th = thetaOf(s, skill);
  let best: Item | null = null, bestScore = -Infinity;
  for (const it of itemsOf(skill)) {
    if (it.level > maxLevel || used.includes(it.id)) continue;
    const p = pCorrect(th, difficulty(s, it));
    let score = -Math.abs(p - TARGET_P);
    if (isDue(s, it.id, today)) score += 1;
    if (weak.has(it.err)) score += 0.2;
    if (focus && it.level === focus) score += 0.15;
    const seenToday = s.attempts.some((a) => a.item === it.id && a.at === today);
    if (seenToday) score -= 0.5;
    if (score > bestScore) { bestScore = score; best = it; }
  }
  return best;
}

export function lessonItems(s: TrainState, skill: SkillId, level: Level, today: string, size = LESSON_SIZE): Item[] {
  const used: string[] = [];
  for (let i = 0; i < size; i++) {
    const it = pickNext(s, skill, level, used, today, level);
    if (!it) break;
    used.push(it.id);
  }
  return used.map((id) => itemById(id)!);
}

/** 쪽지시험: 복습 예정 → 오늘 배운 스킬 → 약점 순서로 5문제 */
export function quizItems(s: TrainState, today: string): Item[] {
  const picked: string[] = [];
  const add = (id: string) => { if (!picked.includes(id) && picked.length < QUIZ_SIZE) picked.push(id); };
  Object.keys(s.review).filter((id) => isDue(s, id, today)).forEach(add);
  const todays = [...new Set(s.attempts.filter((a) => a.at === today).map((a) => itemById(a.item)?.skill).filter(Boolean))] as SkillId[];
  const skills: SkillId[] = todays.length ? todays : ['photo', 'review'];
  let k = 0;
  while (picked.length < QUIZ_SIZE && k < 20) {
    const skill = skills[k % skills.length];
    const it = pickNext(s, skill, 5, picked, today);
    if (it) add(it.id);
    k++;
  }
  return picked.map((id) => itemById(id)!);
}

/** 배치 테스트: 두 스킬 × 레벨 1·3·5에서 고르게 10문제 */
export function placementItems(): Item[] {
  const ids = ['p01', 'r01', 'p08', 'r08', 'p02', 'r03', 'p15', 'r15', 'p12', 'r17'];
  return ids.map((id) => itemById(id)!);
}

/* ───────── recording an answer ───────── */
export type Recorded = { state: TrainState; xp: number; weakNote: string | null };

/** 같은 날 같은 문제를 반복하면 XP 절반, 하루 상한 300 */
export function record(s: TrainState, item: Item, ok: boolean, ctx: Ctx, today: string, ms: number): Recorded {
  let next = ctx === 'placement' ? eloUpdate(s, item, ok) : eloUpdate(s, item, ok);
  const repeat = s.attempts.some((a) => a.item === item.id && a.at === today && a.ctx !== 'placement');
  let xp = ctx === 'placement' ? 0 : ctx === 'quiz' ? (ok ? XP.quizCorrect : 0) : ok ? XP.correct : XP.wrong;
  if (repeat) xp = Math.floor(xp / 2);
  const day = s.days[today] ?? { xp: 0, sec: 0, solved: 0 };
  xp = Math.max(0, Math.min(xp, DAILY_CAP - day.xp));

  // spaced review: wrong → tomorrow; right on a review → 3 days, then 7 days, then done
  const review = { ...next.review };
  const r = review[item.id];
  if (!ok) review[item.id] = { due: addDays(today, 1), step: 0 };
  else if (r && r.due <= today) {
    if (r.step >= 2) delete review[item.id];
    else review[item.id] = { due: addDays(today, r.step === 0 ? 3 : 7), step: r.step + 1 };
  }

  // error dictionary
  const errs = { ...next.errs };
  const e = errs[item.err] ?? { streak: 0, total: 0 };
  errs[item.err] = ok ? { ...e, streak: 0 } : { streak: e.streak + 1, total: e.total + 1 };
  const weakNote = !ok && errs[item.err]!.streak >= 3 ? `"${ERRORS[item.err].name}"에서 3번 연속 틀렸어요. 다음 레슨에 집중해서 넣을게요.` : null;

  next = {
    ...next,
    review, errs,
    attempts: [...next.attempts.slice(-499), { item: item.id, ok, at: today, ms, ctx, xp }],
    // 배치 테스트는 오늘의 트레이닝 기록에 넣지 않아요
    days: ctx === 'placement' ? next.days : { ...next.days, [today]: { ...day, xp: day.xp + xp, sec: day.sec + Math.round(ms / 1000), solved: day.solved + 1 } },
  };
  return { state: next, xp, weakNote };
}

export function addXp(s: TrainState, today: string, xp: number): TrainState {
  const day = s.days[today] ?? { xp: 0, sec: 0, solved: 0 };
  const add = Math.max(0, Math.min(xp, DAILY_CAP - day.xp));
  return { ...s, days: { ...s.days, [today]: { ...day, xp: day.xp + add } } };
}

/* ───────── nodes (lesson path) ───────── */
export const nodeId = (skill: SkillId, level: Level | 'test') => `${skill}-${level}`;
export function nodeOpen(s: TrainState, skill: SkillId, level: Level | 'test') {
  if (!unitOf(skill).ready) return false;
  const order: (Level | 'test')[] = [...LEVELS, 'test'];
  const i = order.indexOf(level);
  if (i === 0) return true;
  return s.nodes[nodeId(skill, order[i - 1])] !== undefined;
}
export function finishNode(s: TrainState, skill: SkillId, level: Level | 'test', accuracy: number, today: string): TrainState {
  const id = nodeId(skill, level);
  const passedTest = level === 'test' && accuracy >= 80 && (s.nodes[id] ?? 0) < 80;
  const next = { ...s, nodes: { ...s.nodes, [id]: Math.max(s.nodes[id] ?? 0, accuracy) } };
  return addXp(next, today, (level === 'test' ? (passedTest ? XP.unitTest : 0) : XP.lesson));
}

/* ───────── goal, streak ───────── */
export const goalMet = (s: TrainState, day: string) => {
  const d = s.days[day];
  return !!d && (d.xp >= s.goal || !!d.busy);
};
export function streak(s: TrainState, today: string) {
  let n = 0, day = goalMet(s, today) ? today : addDays(today, -1);
  while (goalMet(s, day)) { n++; day = addDays(day, -1); }
  return n;
}
export function bestStreak(s: TrainState) {
  const days = Object.keys(s.days).filter((d) => goalMet(s, d)).sort();
  let best = 0, run = 0, prev: string | null = null;
  for (const d of days) { run = prev && addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}
/** 2일 이상 쉬면 "오늘은 2분만" 제안 (C6) */
export function needsRestart(s: TrainState, today: string) {
  const active = Object.keys(s.days).filter((d) => d < today && s.days[d].solved > 0).sort().pop();
  return !!active && addDays(active, 2) <= today && !s.days[today]?.solved;
}
export const markBusy = (s: TrainState, today: string): TrainState =>
  ({ ...s, days: { ...s.days, [today]: { ...(s.days[today] ?? { xp: 0, sec: 0, solved: 0 }), busy: true } } });

/** 7일 연속이면 한 번 +20 XP */
export function streakBonus(s: TrainState, today: string): TrainState {
  if (streak(s, today) < 7 || s.streakBonusAt === today || (s.streakBonusAt && addDays(s.streakBonusAt, 7) > today)) return s;
  return { ...addXp(s, today, XP.streak7), streakBonusAt: today };
}

export const totalXp = (s: TrainState) => Object.values(s.days).reduce((a, d) => a + d.xp, 0);
export const weekXp = (s: TrainState, dates: string[]) => dates.reduce((a, d) => a + (s.days[d]?.xp ?? 0), 0);
export const notes = (s: TrainState) => Object.keys(s.review).map((id) => itemById(id)!).filter(Boolean);
export const accuracy = (s: TrainState) => {
  const real = s.attempts.filter((a) => a.ctx !== 'placement');
  return real.length ? Math.round((real.filter((a) => a.ok).length / real.length) * 100) : 0;
};

export const ALL_ITEMS = ITEMS;

// 가상 사장님 세계. 정책(policy)은 진단 답변만 볼 수 있고, 아래의 숨은 값은 몰라요.
//
// 이 칸의 할 일을 해낼 확률:
//   p = sigmoid(base + habit − busy[칸] − overload × max(0, 할 일 수 − capacity))
// - base: 의지·여유 (진단의 "SNS 홍보 빈도"와 상관)
// - capacity: 한 주에 무리 없이 할 수 있는 개수 (진단의 "홍보 시간"과 상관)
// - busy: 업종별 바쁜 요일·시간 + 개인 일정 (육아, 알바 등)
// - habit: 해낼수록 오르고 빠뜨릴수록 내려가요
// - 일부 사장님은 중간에 개인 일정이 바뀌어요 (drift)
// - 실행률 34% 미만이 이어지면 앱을 그만둘 확률이 커져요

import { analyze, type Answers } from '../lib/maco.ts';
import { CELLS, cellOf } from '../lib/engine.ts';
import { hash32, hashUniform, mulberry32, normal } from './rng.ts';

export type Persona = {
  id: number;
  seed: number;
  answers: Answers;
  /** Diagnosis group the app can see: "업종|레벨" (answers 1 and 2–5). */
  group: string;
  base: number;
  capacity: number;
  learn: number;
  busy: number[];
  /** Busy map after the life change, or null if this owner has none. */
  busyAfter: number[] | null;
  driftWeek: number;
  /**
   * New diagnosis question "할 일 하기 어려운 시간을 모두 골라 주세요" (7일 × 3시간대).
   * Owners answer from how things are now (they can't foresee the later life change),
   * and imperfectly: see WORLD.reportHit / reportFalse.
   */
  reportedBusy: boolean[];
};

export const WORLD = {
  overload: 0.6,
  habitMin: -1,
  habitMax: 1.2,
  missCost: 0.12,
  quitRate: 0.34,
  quitProb: [0.01, 0.12, 0.35],
  driftShare: 0.5,
  /** A truly busy cell (penalty ≥ reportCut) gets marked with this probability… */
  reportCut: 1.2,
  reportHit: 0.75,
  /** …and a free cell gets marked by mistake with this one. */
  reportFalse: 0.05,
};

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const bucket = (x: number, cuts: number[]) => cuts.filter((c) => x > c).length;

function weighted(rng: () => number, w: number[]) {
  let u = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) if ((u -= w[i]) < 0) return i;
  return w.length - 1;
}

const WEEKEND = [5, 6];

/** Busy penalty by business type (카페, 음식점, 미용, 꽃집, 공방, 온라인). */
function template(biz: number): number[] {
  const t = Array(CELLS).fill(0);
  const add = (days: number[], slots: number[], v: number) => { for (const d of days) for (const s of slots) t[cellOf(d, s)] += v; };
  const week = [0, 1, 2, 3, 4, 5, 6], weekdays = [0, 1, 2, 3, 4];
  switch (biz) {
    case 0: add(WEEKEND, [1], 1.6); add(WEEKEND, [2], 0.8); add(weekdays, [1], 0.5); break;
    case 1: add(week, [1], 1.2); add(week, [2], 1.4); add(WEEKEND, [0, 1, 2], 0.5); break;
    case 2: add(WEEKEND, [0, 1, 2], 1.3); add(weekdays, [1], 0.6); break;
    case 3: add([4, 5], [0, 1, 2], 1.2); add([0, 2], [0], 0.4); break;
    case 4: add(WEEKEND, [1], 1.6); add(weekdays, [2], 0.8); break;
    case 5: add(weekdays, [0], 0.6); add(WEEKEND, [0, 1, 2], 0.3); break;
  }
  if (biz !== 5) add(week, [2], 0.3); // tired after closing
  return t;
}

function personalBusy(rng: () => number, base: number[]) {
  const t = base.map((v) => v + 0.3 * normal(rng));
  for (let k = 0; k < 3; k++) t[Math.floor(rng() * CELLS)] += 2;
  return t;
}

export function makePersona(cohortSeed: number, id: number): Persona {
  const seed = hash32(cohortSeed, id);
  const rng = mulberry32(seed);
  const biz = weighted(rng, [0.3, 0.2, 0.15, 0.1, 0.1, 0.15]);
  const ch = biz === 5 && rng() < 0.8 ? 2 : weighted(rng, [0.55, 0.25, 0.05, 0.15]);
  const z = normal(rng), hl = normal(rng);
  const habitAns = bucket(z + 0.7 * normal(rng), [-0.8, 0.2, 1.1]);
  const made = z + 0.7 * normal(rng) < -0.5 ? 0 : 1 + weighted(rng, [0.5, 0.3, 0.2]);
  const hoursAns = bucket(hl + 0.6 * normal(rng), [-0.7, 0.3, 1.2]);
  const barrier = hl < -0.5 && rng() < 0.6 ? 2 : Math.floor(rng() * 4);
  const answers: Answers = [biz, habitAns, ch, hoursAns, made, barrier];
  const a = analyze(answers);

  const tmpl = template(biz);
  const busy = personalBusy(rng, tmpl);
  const drifts = rng() < WORLD.driftShare;
  let busyAfter: number[] | null = null;
  if (drifts) {
    busyAfter = personalBusy(rng, tmpl);
    const day = Math.floor(rng() * 7); // a whole day becomes busy (new part-time job, childcare…)
    for (let s = 0; s < 3; s++) busyAfter[cellOf(day, s)] += 1.5;
  }

  return {
    id,
    seed,
    answers,
    group: `${biz}|${a.level}`,
    base: 0.4 + 0.6 * z,
    capacity: clamp(2.4 + 0.9 * hl, 1, 5.5),
    learn: 0.08 + 0.06 * Math.abs(normal(rng)),
    busy,
    busyAfter,
    driftWeek: 6 + Math.floor(rng() * 3),
    reportedBusy: reportBusy(seed, busy),
  };
}

/** Separate random stream, so adding the question leaves every other trait of the owner unchanged. */
function reportBusy(seed: number, busy: number[]) {
  const rng = mulberry32(hash32(seed, 77));
  return busy.map((b) => rng() < (b >= WORLD.reportCut ? WORLD.reportHit : WORLD.reportFalse));
}

export const makeCohort = (seed: number, size: number) => Array.from({ length: size }, (_, i) => makePersona(seed, i));

/** True probability of doing the task in `cell` this week, given how many tasks the week has. */
export function trueProb(p: Persona, habit: number, week: number, n: number, cell: number) {
  const busy = p.busyAfter && week >= p.driftWeek ? p.busyAfter : p.busy;
  return sigmoid(p.base + habit - busy[cell] - WORLD.overload * Math.max(0, n - p.capacity));
}

export type Truth = (cell: number, n: number) => number;

export type PolicyRun = {
  plan(week: number, truth: Truth): number[];
  observe(cells: number[], outcomes: boolean[]): void;
};

export type Policy = { id: number; name: string; label: string; start(p: Persona): PolicyRun };

export type WeekResult = { active: boolean; n: number; done: number; expected: number };

/** Run one owner under one policy. Quitting is permanent (weeks after count as 0 done). */
export function simulate(p: Persona, policy: Policy, weeks: number): WeekResult[] {
  const run = policy.start(p);
  let habit = 0, lowStreak = 0, active = true;
  const out: WeekResult[] = [];
  for (let w = 0; w < weeks; w++) {
    if (!active) { out.push({ active: false, n: 0, done: 0, expected: 0 }); continue; }
    const truth: Truth = (cell, n) => trueProb(p, habit, w, n, cell);
    const cells = run.plan(w, truth);
    const n = cells.length;
    const probs = cells.map((c) => truth(c, n));
    const outcomes = cells.map((c, i) => hashUniform(p.seed, w, c) < probs[i]);
    const done = outcomes.filter(Boolean).length;
    run.observe(cells, outcomes);
    out.push({ active: true, n, done, expected: probs.reduce((a, b) => a + b, 0) });

    habit = clamp(habit + p.learn * done - WORLD.missCost * (n - done), WORLD.habitMin, WORLD.habitMax);
    lowStreak = done / n < WORLD.quitRate ? lowStreak + 1 : 0;
    if (hashUniform(p.seed, w, 999) < WORLD.quitProb[Math.min(lowStreak, 2)]) active = false;
  }
  return out;
}

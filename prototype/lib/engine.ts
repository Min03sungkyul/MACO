// 마코 재처방 엔진.
// v1 (이 파일 위쪽): 칸별 독립 Beta + 할인 톰슨 샘플링. 비교용으로 남겨 둬요.
// v2 (아래쪽): 구조화 베이지안 모델. 앱에 넣을 버전이에요.
//
// 한 주를 7일 × 3시간대 = 21칸으로 보고, 칸마다 "이 사장님이 이 칸의 할 일을
// 해낼 확률"을 Beta 분포로 들고 있어요.
// - 시작: 같은 진단 그룹(트랙 × 레벨) 사장님들의 칸별 실행률을 사전분포로 써요 (콜드 스타트).
// - 매주: 지난 기록으로 분포를 업데이트해요. 오래된 기록은 discount만큼 덜 믿어서
//   생활 패턴이 바뀌어도 따라가요.
// - 다음 주: 분포에서 확률을 하나씩 뽑아(톰슨 샘플링) 목표 실행률을 넘는 가장 큰 루틴을 고르고,
//   한 주에 한 칸까지만 바꿔서 사장님이 변화를 받아들이기 쉽게 해요.
// 같은 입력과 같은 난수 시드면 언제나 같은 결과가 나와요.

import { DAY_NAMES } from './maco.ts';

export const SLOTS = ['오전', '오후', '저녁'] as const;
export const CELLS = DAY_NAMES.length * SLOTS.length; // 21
export const cellOf = (day: number, slot: number) => day * SLOTS.length + slot;
export const dayOf = (c: number) => Math.floor(c / SLOTS.length);
export const slotOf = (c: number) => c % SLOTS.length;
export const cellName = (c: number) => `${DAY_NAMES[dayOf(c)]} ${SLOTS[slotOf(c)]}`;

export type Rng = () => number;

/** Beta(a, b) per cell, plus the prior it decays back to. */
export type Belief = { a: number[]; b: number[]; a0: number[]; b0: number[] };

export type EngineConfig = {
  /** Plan the biggest routine whose predicted done-rate stays at or above this. */
  target: number;
  /** 0–1. How much last week's evidence still counts this week (1 = never forget). */
  discount: number;
  nMin: number;
  nMax: number;
  /** Cells that may move to another day/time per week. */
  maxSwaps: number;
  /** Only move a cell if the new one looks at least this much better. */
  swapMargin: number;
};

// Picked on the validation cohort (npm run sim:tune), not the test cohort.
export const DEFAULT_CONFIG: EngineConfig = { target: 0.7, discount: 0.95, nMin: 2, nMax: 4, maxSwaps: 1, swapMargin: 0.05 };

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Prior with the given per-cell means; `strength` = how many weeks of evidence it is worth. */
export function makeBelief(mean: number[], strength: number): Belief {
  const a0 = mean.map((m) => clamp(m, 0.02, 0.98) * strength);
  const b0 = mean.map((m) => (1 - clamp(m, 0.02, 0.98)) * strength);
  return { a: [...a0], b: [...b0], a0, b0 };
}

/** No prior knowledge: Beta(1, 1) everywhere. */
export const flatBelief = () => makeBelief(Array(CELLS).fill(0.5), 2);

export const posteriorMean = (bel: Belief, c: number) => bel.a[c] / (bel.a[c] + bel.b[c]);

/** Decay old evidence toward the prior, then add this week's outcomes. Returns a new belief. */
export function update(bel: Belief, cells: number[], outcomes: boolean[], discount: number): Belief {
  const a = bel.a.map((x, i) => bel.a0[i] + discount * (x - bel.a0[i]));
  const b = bel.b.map((x, i) => bel.b0[i] + discount * (x - bel.b0[i]));
  cells.forEach((c, i) => { if (outcomes[i]) a[c] += 1; else b[c] += 1; });
  return { a, b, a0: bel.a0, b0: bel.b0 };
}

function sampleNormal(rng: Rng) {
  const u = Math.max(rng(), 1e-12), v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Marsaglia–Tsang gamma sampler (shape k > 0, scale 1). */
function sampleGamma(k: number, rng: Rng): number {
  if (k < 1) return sampleGamma(k + 1, rng) * Math.pow(Math.max(rng(), 1e-12), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do { x = sampleNormal(rng); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(a: number, b: number, rng: Rng) {
  const x = sampleGamma(a, rng), y = sampleGamma(b, rng);
  return x / (x + y);
}

export type Choice = { cells: number[]; theta: number[]; predicted: number };

/**
 * Next week's routine. One task per day at most. `prev` = this week's cells
 * (null on the first week, which takes the best plan outright).
 */
export function choosePlan(bel: Belief, prev: number[] | null, rng: Rng, cfg: EngineConfig = DEFAULT_CONFIG): Choice {
  const theta = bel.a.map((a, i) => sampleBeta(a, bel.b[i], rng));

  const best = DAY_NAMES.map((_, d) => {
    let c = cellOf(d, 0);
    for (let s = 1; s < SLOTS.length; s++) if (theta[cellOf(d, s)] > theta[c]) c = cellOf(d, s);
    return c;
  });
  const ranked = [...best].sort((x, y) => theta[y] - theta[x]);
  const rateFor = (n: number) => ranked.slice(0, n).reduce((s, c) => s + theta[c], 0) / n;

  const lo = prev ? Math.max(cfg.nMin, prev.length - 1) : cfg.nMin;
  const hi = prev ? Math.min(cfg.nMax, prev.length + 1) : cfg.nMax;
  let n = lo;
  for (let k = hi; k >= lo; k--) if (rateFor(k) >= cfg.target) { n = k; break; }
  const desired = ranked.slice(0, n);

  let cur = prev ? [...prev] : [...desired];
  if (prev) {
    const used = (cells: number[]) => new Set(cells.map(dayOf));
    while (cur.length < n) {
      const days = used(cur);
      const add = [...desired, ...ranked].find((c) => !days.has(dayOf(c)))!;
      cur.push(add);
    }
    while (cur.length > n) {
      const worst = cur.reduce((w, c) => (theta[c] < theta[w] ? c : w));
      cur = cur.filter((c) => c !== worst);
    }
    for (let k = 0; k < cfg.maxSwaps; k++) {
      let bestGain = cfg.swapMargin, swap: [number, number] | null = null;
      for (const out of cur) {
        if (desired.includes(out)) continue;
        const days = used(cur.filter((c) => c !== out));
        for (const inn of desired) {
          if (cur.includes(inn) || days.has(dayOf(inn))) continue;
          const gain = theta[inn] - theta[out];
          if (gain > bestGain) { bestGain = gain; swap = [out, inn]; }
        }
      }
      if (!swap) break;
      cur = cur.map((c) => (c === swap![0] ? swap![1] : c));
    }
  }

  cur.sort((x, y) => x - y);
  const predicted = cur.reduce((s, c) => s + posteriorMean(bel, c), 0) / cur.length;
  return { cells: cur, theta, predicted };
}

/** Plain-language reasons for what changed, from posterior means (shown as "왜 바뀌었어요?"). */
export function explainChange(bel: Belief, prev: number[], next: number[]): string[] {
  const pct = (c: number) => `${Math.round(posteriorMean(bel, c) * 100)}%`;
  const removed = prev.filter((c) => !next.includes(c));
  const added = next.filter((c) => !prev.includes(c));
  const out: string[] = [];
  const pairs = Math.min(removed.length, added.length);
  for (let i = 0; i < pairs; i++) {
    out.push(`${cellName(removed[i])}은 해낼 확률이 ${pct(removed[i])}라서 ${cellName(added[i])}(${pct(added[i])})으로 옮겼어요.`);
  }
  for (const c of added.slice(pairs)) out.push(`잘 해내고 계셔서 ${cellName(c)}(${pct(c)})에 하나 더 넣었어요.`);
  for (const c of removed.slice(pairs)) out.push(`${cellName(c)}(${pct(c)})은 이번 주엔 쉬어 가요.`);
  if (!out.length) out.push('지난주 루틴이 잘 맞아서 그대로 가요.');
  return out;
}

export type PriorRecord = { group: string; cell: number; done: boolean };

/**
 * Population prior: per diagnosis group, each cell's done-rate, shrunk toward the
 * all-groups rate for that cell (`smoothing` pseudo-observations). Groups with no
 * data fall back to the key "*".
 */
export function fitPriorTable(records: PriorRecord[], smoothing = 5): Record<string, number[]> {
  const tally = (filter: (r: PriorRecord) => boolean) => {
    const s = Array(CELLS).fill(0), n = Array(CELLS).fill(0);
    for (const r of records) if (filter(r)) { n[r.cell]++; if (r.done) s[r.cell]++; }
    return { s, n };
  };
  const all = tally(() => true);
  const allTotal = all.n.reduce((x, y) => x + y, 0) || 1;
  const allRate = all.s.reduce((x, y) => x + y, 0) / allTotal;
  const global = all.s.map((s, c) => (s + smoothing * allRate) / (all.n[c] + smoothing));
  const table: Record<string, number[]> = { '*': global };
  for (const g of new Set(records.map((r) => r.group))) {
    const t = tally((r) => r.group === g);
    table[g] = t.s.map((s, c) => (s + smoothing * global[c]) / (t.n[c] + smoothing));
  }
  return table;
}

// ─────────────────────────────────────────────────────────────────────────────
// v2: 구조화 베이지안 모델 (사장님 + 요일 + 시간대 + 칸 + 부담)
//
// v1은 21칸을 따로따로 배워서, 주에 2~3개뿐인 기록으로는 너무 느렸어요.
// v2는 칸 하나의 기록이 "이 사장님 전체", "이 요일", "이 시간대"에도 함께 반영돼요.
//   P(해냄) = Φ( w·x / β ),  x = [1, 요일 원-핫, 시간대 원-핫, 칸 원-핫, (할 일 수 − 3)]
// 가중치 w는 칸마다 독립인 정규분포로 들고, 기록이 올 때마다 닫힌 식으로 업데이트해요
// (Graepel et al. 2010, adPredictor 방식의 온라인 베이지안 프로빗 회귀).
// 매주 분산을 사전분포 쪽으로 조금 되돌려서(망각) 생활 패턴 변화를 따라가요.
// "어디에"는 가중치를 한 번 뽑아 정하고(톰슨 샘플링, 탐색),
// "몇 개"는 평균 예측으로 보수적으로 정해요 (뽑은 값의 최댓값은 늘 낙관적이라서).
// ─────────────────────────────────────────────────────────────────────────────

const F_BIAS = 0, F_DAY = 1, F_SLOT = 8, F_CELL = 11, F_LOAD = 32, F_BUSY = 33;
export const FEATURES = 34;

/** `busy` = 1 if the owner said in the diagnosis this time is hard for them (0 if not asked). */
const featuresOf = (cell: number, n: number, busy: number): [number, number][] => [
  [F_BIAS, 1], [F_DAY + dayOf(cell), 1], [F_SLOT + slotOf(cell), 1], [F_CELL + cell, 1], [F_LOAD, n - 3], [F_BUSY, busy],
];
const features = (m: Model, cell: number, n: number) => featuresOf(cell, n, m.busy[cell]);

/** Mean and variance per weight, the prior they relax back to, and the owner's "바쁜 시간" answer per cell. */
export type Model = { mu: number[]; v: number[]; mu0: number[]; v0: number[]; busy: number[] };

export type ModelConfig = {
  beta: number;
  /** 0–1. Share of the way variance relaxes back to the prior each week (0 = never forget). */
  forget: number;
  target: number;
  nMin: number;
  nMax: number;
  maxSwaps: number;
  swapMargin: number;
};

// Picked on the validation cohort (npm run sim:tune), not the test cohort.
export const MODEL_CONFIG: ModelConfig = { beta: 1, forget: 0.1, target: 0.6, nMin: 2, nMax: 4, maxSwaps: 1, swapMargin: 0.05 };

/** How much one owner may differ from their diagnosis group, per kind of weight. */
export const OWNER_VARIANCE = { bias: 0.5, day: 0.15, slot: 0.15, cell: 0.3, load: 0.05, busy: 0.1 };

function kindVar(i: number, s: typeof OWNER_VARIANCE) {
  return i === F_BIAS ? s.bias : i < F_SLOT ? s.day : i < F_CELL ? s.slot : i < F_LOAD ? s.cell : i === F_LOAD ? s.load : s.busy;
}

export function makeModel(mean: number[] = Array(FEATURES).fill(0), spread = OWNER_VARIANCE, busyCells: boolean[] = []): Model {
  const v0 = Array.from({ length: FEATURES }, (_, i) => kindVar(i, spread));
  const busy = Array.from({ length: CELLS }, (_, c) => (busyCells[c] ? 1 : 0));
  return { mu: [...mean], v: [...v0], mu0: [...mean], v0, busy };
}

const SQRT2 = Math.SQRT2;
function erf(x: number) {
  // Abramowitz–Stegun 7.1.26
  const s = Math.sign(x), t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
export const Phi = (x: number) => 0.5 * (1 + erf(x / SQRT2));
const pdf = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

/** Predictive probability with weight uncertainty integrated out. */
export function predict(m: Model, cell: number, n: number, beta = MODEL_CONFIG.beta) {
  let mean = 0, varSum = beta * beta;
  for (const [i, x] of features(m, cell, n)) { mean += m.mu[i] * x; varSum += m.v[i] * x * x; }
  return Phi(mean / Math.sqrt(varSum));
}

/** One observation, closed-form update (in place). */
function observeOne(m: Model, fx: [number, number][], done: boolean, beta: number) {
  const y = done ? 1 : -1;
  let mean = 0, s2 = beta * beta;
  for (const [i, x] of fx) { mean += m.mu[i] * x; s2 += m.v[i] * x * x; }
  const s = Math.sqrt(s2), t = (y * mean) / s;
  const vt = pdf(t) / Math.max(Phi(t), 1e-12), wt = vt * (vt + t);
  for (const [i, x] of fx) {
    if (x === 0) continue;
    m.mu[i] += (y * x * m.v[i] / s) * vt;
    m.v[i] *= Math.max(1e-6, 1 - (x * x * m.v[i] / s2) * wt);
  }
}

/** A week of outcomes. Forgetting first, so older weeks count a little less. Returns a new model. */
export function learn(m: Model, cells: number[], outcomes: boolean[], cfg: ModelConfig = MODEL_CONFIG): Model {
  const next: Model = { mu: [...m.mu], v: [...m.v], mu0: m.mu0, v0: m.v0, busy: m.busy };
  if (cfg.forget > 0) {
    for (let i = 0; i < FEATURES; i++) {
      const v = (next.v[i] * next.v0[i]) / ((1 - cfg.forget) * next.v0[i] + cfg.forget * next.v[i]);
      next.mu[i] = v * ((1 - cfg.forget) * next.mu[i] / next.v[i] + cfg.forget * next.mu0[i] / next.v0[i]);
      next.v[i] = v;
    }
  }
  cells.forEach((c, k) => observeOne(next, features(next, c, cells.length), outcomes[k], cfg.beta));
  return next;
}

export type ModelRecord = { group: string; cell: number; n: number; done: boolean; busy?: boolean };

/**
 * Population prior from pilot data: one model over everyone ("*"), then each
 * diagnosis group starts from it and learns its own data. Returns weight means.
 */
export function fitGroupModels(records: ModelRecord[], cfg: ModelConfig = MODEL_CONFIG): Record<string, number[]> {
  const wide = { bias: 1, day: 0.5, slot: 0.5, cell: 0.5, load: 0.5, busy: 0.5 };
  const fit = (start: number[], rs: ModelRecord[]) => {
    const m = makeModel(start, wide);
    for (const r of rs) observeOne(m, featuresOf(r.cell, r.n, r.busy ? 1 : 0), r.done, cfg.beta);
    return m.mu;
  };
  const global = fit(Array(FEATURES).fill(0), records);
  const out: Record<string, number[]> = { '*': global };
  for (const g of new Set(records.map((r) => r.group))) out[g] = fit(global, records.filter((r) => r.group === g));
  return out;
}

export type ModelChoice = { cells: number[]; predicted: number };

export function chooseWithModel(m: Model, prev: number[] | null, rng: Rng, cfg: ModelConfig = MODEL_CONFIG): ModelChoice {
  // Thompson: one draw of all weights decides *where*.
  const w = m.mu.map((mu, i) => mu + Math.sqrt(m.v[i]) * sampleNormal(rng));
  const score = (c: number) => features(m, c, 3).reduce((s, [i, x]) => s + w[i] * x, 0);
  const theta = Array.from({ length: CELLS }, (_, c) => score(c));

  const best = DAY_NAMES.map((_, d) => {
    let c = cellOf(d, 0);
    for (let s = 1; s < SLOTS.length; s++) if (theta[cellOf(d, s)] > theta[c]) c = cellOf(d, s);
    return c;
  });
  const ranked = [...best].sort((x, y) => theta[y] - theta[x]);
  // Posterior-mean prediction decides *how many*.
  const rateFor = (n: number) => ranked.slice(0, n).reduce((s, c) => s + predict(m, c, n, cfg.beta), 0) / n;

  const lo = prev ? Math.max(cfg.nMin, prev.length - 1) : cfg.nMin;
  const hi = prev ? Math.min(cfg.nMax, prev.length + 1) : cfg.nMax;
  let n = lo;
  for (let k = hi; k >= lo; k--) if (rateFor(k) >= cfg.target) { n = k; break; }
  const desired = ranked.slice(0, n);

  let cur = prev ? [...prev] : [...desired];
  if (prev) {
    const used = (cells: number[]) => new Set(cells.map(dayOf));
    while (cur.length < n) {
      const days = used(cur);
      cur.push([...desired, ...ranked].find((c) => !days.has(dayOf(c)))!);
    }
    while (cur.length > n) {
      const worst = cur.reduce((a, c) => (theta[c] < theta[a] ? c : a));
      cur = cur.filter((c) => c !== worst);
    }
    for (let k = 0; k < cfg.maxSwaps; k++) {
      let bestGain = cfg.swapMargin, swap: [number, number] | null = null;
      for (const out of cur) {
        if (desired.includes(out)) continue;
        const days = used(cur.filter((c) => c !== out));
        for (const inn of desired) {
          if (cur.includes(inn) || days.has(dayOf(inn))) continue;
          const gain = Phi(theta[inn]) - Phi(theta[out]);
          if (gain > bestGain) { bestGain = gain; swap = [out, inn]; }
        }
      }
      if (!swap) break;
      cur = cur.map((c) => (c === swap![0] ? swap![1] : c));
    }
  }
  cur.sort((x, y) => x - y);
  return { cells: cur, predicted: cur.reduce((s, c) => s + predict(m, c, cur.length, cfg.beta), 0) / cur.length };
}

/** "왜 바뀌었어요?" for the v2 model. */
export function explainModelChange(m: Model, prev: number[], next: number[]): string[] {
  const pct = (c: number, n: number) => `${Math.round(predict(m, c, n) * 100)}%`;
  const removed = prev.filter((c) => !next.includes(c));
  const added = next.filter((c) => !prev.includes(c));
  const out: string[] = [];
  const pairs = Math.min(removed.length, added.length);
  for (let i = 0; i < pairs; i++) {
    out.push(`${cellName(removed[i])}은 해낼 확률이 ${pct(removed[i], next.length)}라서 ${cellName(added[i])}(${pct(added[i], next.length)})으로 옮겼어요.`);
  }
  for (const c of added.slice(pairs)) out.push(`잘 해내고 계셔서 ${cellName(c)}(${pct(c, next.length)})에 하나 더 넣었어요.`);
  for (const c of removed.slice(pairs)) out.push(`${cellName(c)}(${pct(c, next.length)})은 이번 주엔 쉬어 가요.`);
  if (!out.length) out.push('지난주 루틴이 잘 맞아서 그대로 가요.');
  return out;
}

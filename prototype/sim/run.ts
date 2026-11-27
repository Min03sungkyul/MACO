// 실험 실행: npm run sim  (옵션: -- --owners 1000 --weeks 12 --pilot 300 --seed 7)
//
// 1) 파일럿: 가상 사장님 무리 A가 4주 동안 무작위 루틴을 써서 칸별 데이터를 모아요.
//    → 진단 그룹별 사전분포를 만들어요 (실제 앱에선 첫 파일럿 사용자 데이터).
// 2) 평가: 다른 무리 B(겹치지 않는 시드)에 정책마다 같은 사람·같은 운을 주고 12주를 돌려요.
// 3) 결과: 표를 출력하고 sim/results/ 에 summary.json, weekly.csv 를 써요.

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fitGroupModels, fitPriorTable, type ModelRecord } from '../lib/engine.ts';
import { enginePolicy, fixedAsk, fixedRule, modelPolicy, oracle, randomPilot } from './policies.ts';
import { makeCohort, simulate, type Persona, type Policy, type WeekResult } from './world.ts';

export type Options = { owners: number; weeks: number; pilot: number; pilotWeeks: number; seed: number };
export const DEFAULTS: Options = { owners: 1000, weeks: 12, pilot: 300, pilotWeeks: 4, seed: 7 };

export function pilotRecords(cohort: Persona[], weeks: number): ModelRecord[] {
  const records: ModelRecord[] = [];
  for (const p of cohort) {
    const run = randomPilot.start(p);
    const wrapped: Policy = {
      ...randomPilot,
      start: () => ({
        plan: (w, t) => run.plan(w, t),
        observe(cells, outcomes) { cells.forEach((cell, i) => records.push({ group: p.group, cell, n: cells.length, done: outcomes[i], busy: p.reportedBusy[cell] })); },
      }),
    };
    simulate(p, wrapped, weeks);
  }
  return records;
}

/** `groups` is fitted as if the question was never asked; `groupsAsk` uses the answers. */
export type Priors = { table: Record<string, number[]>; groups: Record<string, number[]>; groupsAsk: Record<string, number[]> };

export function fitPriors(records: ModelRecord[]): Priors {
  return {
    table: fitPriorTable(records),
    groups: fitGroupModels(records.map((r) => ({ ...r, busy: false }))),
    groupsAsk: fitGroupModels(records),
  };
}

export function policiesFor(pr: Priors): Policy[] {
  return [
    fixedRule,
    enginePolicy({ id: 4, name: 'v1-cells', label: 'v1 칸별 독립 모델', prior: pr.table }),
    modelPolicy({ id: 6, name: 'v2-noprior', label: 'v2 (진단 사전분포 없음)' }),
    modelPolicy({ id: 7, name: 'v2-noforget', label: 'v2 (망각 없음)', groups: pr.groups, config: { forget: 0 } }),
    modelPolicy({ id: 8, name: 'maco', label: '마코 엔진 v2', groups: pr.groups }),
    fixedAsk,
    modelPolicy({ id: 11, name: 'maco-ask', label: '마코 엔진 v2 + 바쁜 시간 질문', groups: pr.groupsAsk, ask: true }),
    oracle,
  ];
}

type Row = { policy: Policy; perOwner: WeekResult[][] };

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const sd = (xs: number[]) => { const m = mean(xs); return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))); };
const ci95 = (xs: number[]) => 1.96 * sd(xs) / Math.sqrt(xs.length || 1);
const total = (r: WeekResult[]) => r.reduce((s, w) => s + w.done, 0);

export function summarize(rows: Row[], cohort: Persona[], weeks: number) {
  const base = rows[0];
  const best = rows.find((r) => r.policy.name === 'oracle');
  const drifters = cohort.map((p, i) => (p.busyAfter ? i : -1)).filter((i) => i >= 0);
  return rows.map((r) => {
    const totals = r.perOwner.map(total);
    const activeWeeks = r.perOwner.flat().filter((w) => w.active);
    const rates = activeWeeks.map((w) => w.done / w.n);
    const diff = r.perOwner.map((o, i) => total(o) - total(base.perOwner[i]));
    const afterDrift = drifters.map((i) => {
      const from = cohort[i].driftWeek;
      return r.perOwner[i].slice(from).reduce((s, w) => s + w.done, 0);
    });
    return {
      policy: r.policy.name,
      label: r.policy.label,
      totalDone: +mean(totals).toFixed(2),
      totalDoneCI: +ci95(totals).toFixed(2),
      doneRate: +mean(rates).toFixed(3),
      tasksPerWeek: +mean(activeWeeks.map((w) => w.n)).toFixed(2),
      halfWeeks: +mean(rates.map((x) => (x >= 0.5 ? 1 : 0))).toFixed(3),
      retention: +mean(r.perOwner.map((o) => (o[weeks - 1].active ? 1 : 0))).toFixed(3),
      vsFixed: +mean(diff).toFixed(2),
      vsFixedCI: +ci95(diff).toFixed(2),
      afterDriftDone: +mean(afterDrift).toFixed(2),
      regret: best ? +mean(r.perOwner.map((o, i) => total(best.perOwner[i]) - total(o))).toFixed(2) : null,
    };
  });
}

export function runExperiment(opt: Options = DEFAULTS) {
  const pilot = makeCohort(opt.seed * 1000 + 1, opt.pilot);
  const records = pilotRecords(pilot, opt.pilotWeeks);
  const priors = fitPriors(records);
  const cohort = makeCohort(opt.seed * 1000 + 2, opt.owners);
  const rows: Row[] = policiesFor(priors).map((policy) => ({
    policy,
    perOwner: cohort.map((p) => simulate(p, policy, opt.weeks)),
  }));
  const weekly = rows.map((r) => ({
    policy: r.policy.name,
    done: Array.from({ length: opt.weeks }, (_, w) => +mean(r.perOwner.map((o) => o[w].done)).toFixed(3)),
    active: Array.from({ length: opt.weeks }, (_, w) => +mean(r.perOwner.map((o) => (o[w].active ? 1 : 0))).toFixed(3)),
  }));
  return { options: opt, summary: summarize(rows, cohort, opt.weeks), weekly };
}

function parseArgs(argv: string[]): Options {
  const o = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i].replace(/^--/, '') as keyof Options;
    if (k in o) o[k] = Number(argv[i + 1]);
  }
  return o;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = runExperiment(parseArgs(process.argv.slice(2)));
  const { owners, weeks, pilot } = result.options;
  console.log(`가상 사장님 ${owners}명 × ${weeks}주 (사전분포 학습용 파일럿 ${pilot}명)\n`);
  console.table(result.summary.map((s) => ({
    정책: s.label,
    '12주 총 실행': `${s.totalDone} ±${s.totalDoneCI}`,
    '고정 규칙 대비': s.policy === 'fixed' ? '-' : `${s.vsFixed >= 0 ? '+' : ''}${s.vsFixed} ±${s.vsFixedCI}`,
    실행률: `${Math.round(s.doneRate * 100)}%`,
    '주당 할 일': s.tasksPerWeek,
    '절반 이상 해낸 주': `${Math.round(s.halfWeeks * 100)}%`,
    '12주 유지': `${Math.round(s.retention * 100)}%`,
    '패턴 변화 후 실행': s.afterDriftDone,
    '정답과 격차': s.regret,
  })));
  const dir = new URL('./results/', import.meta.url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('summary.json', dir), JSON.stringify(result, null, 2));
  const header = ['week', ...result.weekly.flatMap((w) => [`${w.policy}_done`, `${w.policy}_active`])].join(',');
  const lines = Array.from({ length: weeks }, (_, i) =>
    [i + 1, ...result.weekly.flatMap((w) => [w.done[i], w.active[i]])].join(','));
  writeFileSync(new URL('weekly.csv', dir), [header, ...lines].join('\n') + '\n');
  console.log('\n저장: sim/results/summary.json, sim/results/weekly.csv');
}

// 하이퍼파라미터 고르기: npm run sim:tune
// 평가용 무리(test)와 겹치지 않는 검증용 무리(validation)에서만 고르고,
// 고른 값을 lib/engine.ts 기본값에 적어 둬요. 평가 결과를 보고 고치지 않기 위해서예요.

import { enginePolicy, fixedRule, modelPolicy } from './policies.ts';
import { DEFAULTS, fitPriors, pilotRecords } from './run.ts';
import { makeCohort, simulate, type Policy } from './world.ts';

const opt = DEFAULTS;
const records = pilotRecords(makeCohort(opt.seed * 1000 + 1, opt.pilot), opt.pilotWeeks);
const { groups, groupsAsk, table } = fitPriors(records);
const val = makeCohort(opt.seed * 1000 + 3, opt.owners); // test cohort is seed*1000+2

const score = (pol: Policy) => {
  const runs = val.map((p) => simulate(p, pol, opt.weeks));
  const total = runs.reduce((s, r) => s + r.reduce((a, w) => a + w.done, 0), 0) / runs.length;
  const kept = runs.filter((r) => r[opt.weeks - 1].active).length / runs.length;
  return { '12주 총 실행': +total.toFixed(2), '12주 유지': `${Math.round(kept * 100)}%` };
};

const rows: Record<string, unknown>[] = [{ 정책: '현재 고정 규칙', ...score(fixedRule) }];
for (const target of [0.5, 0.6, 0.7]) {
  for (const discount of [0.85, 0.95]) {
    rows.push({ 정책: 'v1', target, '망각': discount, ...score(enginePolicy({ id: 4, name: 'v1', label: 'v1', prior: table, config: { target, discount } })) });
  }
}
for (const target of [0.5, 0.55, 0.6, 0.65, 0.7]) {
  for (const forget of [0.05, 0.1, 0.2]) {
    rows.push({ 정책: 'v2', target, '망각': forget, ...score(modelPolicy({ id: 8, name: 'v2', label: 'v2', groups, config: { target, forget } })) });
  }
}
for (const target of [0.5, 0.55, 0.6, 0.65, 0.7]) {
  rows.push({ 정책: 'v2 + 질문', target, '망각': 0.1, ...score(modelPolicy({ id: 11, name: 'v2a', label: 'v2a', groups: groupsAsk, ask: true, config: { target } })) });
}
console.log(`검증용 무리 ${opt.owners}명 × ${opt.weeks}주`);
console.table(rows);

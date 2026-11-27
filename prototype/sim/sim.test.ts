import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CELLS, MODEL_CONFIG, cellOf, chooseWithModel, dayOf, explainModelChange, fitGroupModels, learn, makeModel,
  predict, sampleBeta,
} from '../lib/engine.ts';
import { mulberry32 } from './rng.ts';
import { fixedAsk, fixedRule, modelPolicy } from './policies.ts';
import { runExperiment } from './run.ts';
import { makeCohort, makePersona, simulate } from './world.ts';

test('same seed → same owner and same 12 weeks', () => {
  const p = makePersona(42, 3);
  assert.deepEqual(makePersona(42, 3), p);
  const pol = modelPolicy({ id: 8, name: 'm', label: 'm' });
  assert.deepEqual(simulate(p, pol, 12), simulate(p, pol, 12));
});

test('beta sampler has the right mean', () => {
  const rng = mulberry32(1);
  let s = 0;
  for (let i = 0; i < 20000; i++) s += sampleBeta(3, 7, rng);
  assert.ok(Math.abs(s / 20000 - 0.3) < 0.01);
});

test('successes raise a cell, failures lower it, and other days of the same slot move a little', () => {
  const tue = cellOf(1, 0), thu = cellOf(3, 0), thuEve = cellOf(3, 2);
  let up = makeModel(), down = makeModel();
  for (let w = 0; w < 6; w++) {
    up = learn(up, [tue], [true]);
    down = learn(down, [tue], [false]);
  }
  assert.ok(predict(up, tue, 3) > 0.75);
  assert.ok(predict(down, tue, 3) < 0.25);
  // Shared weights: Thursday morning learns from Tuesday morning more than Thursday evening does.
  assert.ok(predict(up, thu, 3) > predict(up, thuEve, 3));
});

test('forgetting relaxes variance back toward the prior', () => {
  let m = makeModel();
  for (let w = 0; w < 10; w++) m = learn(m, [0, 3, 6], [true, false, true], { ...MODEL_CONFIG, forget: 0 });
  const tight = m.v[0];
  const relaxed = learn(m, [], [], { ...MODEL_CONFIG, forget: 0.5 }).v[0];
  assert.ok(relaxed > tight && relaxed <= m.v0[0]);
});

test('plans: one task per day, 2–4 tasks, at most one move per week', () => {
  const rng = mulberry32(5);
  let m = makeModel(), prev: number[] | null = null;
  for (let w = 0; w < 30; w++) {
    const { cells } = chooseWithModel(m, prev, rng);
    assert.ok(cells.length >= 2 && cells.length <= 4);
    assert.equal(new Set(cells.map(dayOf)).size, cells.length);
    if (prev) {
      const kept = cells.filter((c) => prev!.includes(c)).length;
      assert.ok(Math.min(prev.length, cells.length) - kept <= 1);
    }
    m = learn(m, cells, cells.map((c) => c % 2 === 0));
    prev = cells;
  }
});

test('explanations name the moved cells in Korean', () => {
  const lines = explainModelChange(makeModel(), [cellOf(1, 2)], [cellOf(3, 0)]);
  assert.match(lines[0], /^화 저녁은 해낼 확률이 \d+%라서 목 오전\(\d+%\)으로 옮겼어요\.$/);
});

test('group prior: one entry per diagnosis group plus "*"', () => {
  const groups = fitGroupModels([
    { group: 'a', cell: 0, n: 2, done: true },
    { group: 'b', cell: CELLS - 1, n: 3, done: false },
  ]);
  assert.deepEqual(Object.keys(groups).sort(), ['*', 'a', 'b']);
});

test('small experiment runs and the oracle beats every policy', () => {
  const r = runExperiment({ owners: 120, weeks: 8, pilot: 60, pilotWeeks: 4, seed: 3 });
  const oracle = r.summary.find((s) => s.policy === 'oracle')!;
  for (const s of r.summary) assert.ok(s.totalDone <= oracle.totalDone);
  assert.equal(r.weekly[0].done.length, 8);
});

test('fixed rule reproduces the app: cafe owner with 1~3 hours starts on 화·목·토', () => {
  const cafe = makeCohort(11, 200).find((p) => p.answers[0] === 0 && p.answers[3] === 1)!;
  const cells = fixedRule.start(cafe).plan(0, () => 0);
  assert.deepEqual(cells.map(dayOf), [1, 3, 5]);
});

test('busy-time answers: a separate random stream, so owners are otherwise unchanged', () => {
  const p = makePersona(42, 3);
  assert.equal(p.reportedBusy.length, CELLS);
  const { reportedBusy: _, ...rest } = p;
  const { reportedBusy: __, ...again } = makePersona(42, 3);
  assert.deepEqual(rest, again);
});

test('owners mark mostly truly busy cells', () => {
  let hit = 0, marked = 0;
  for (const p of makeCohort(5, 300)) p.reportedBusy.forEach((b, c) => { if (b) { marked++; if (p.busy[c] >= 1.2) hit++; } });
  assert.ok(hit / marked > 0.6);
});

test('pilot learns that a marked cell is less likely to get done', () => {
  const records = [];
  for (let i = 0; i < 400; i++) records.push({ group: 'g', cell: i % CELLS, n: 3, done: i % 3 !== 0, busy: false });
  for (let i = 0; i < 400; i++) records.push({ group: 'g', cell: i % CELLS, n: 3, done: i % 4 === 0, busy: true });
  const mean = fitGroupModels(records).g;
  const marked = makeModel(mean, undefined, Array(CELLS).fill(true));
  const unmarked = makeModel(mean);
  assert.ok(predict(marked, 0, 3) < predict(unmarked, 0, 3) - 0.2);
});

test('fixed rule + question plans no more marked times than the plain fixed rule', () => {
  for (const p of makeCohort(11, 200)) {
    const marked = (cells: number[]) => cells.filter((c) => p.reportedBusy[c]).length;
    assert.ok(marked(fixedAsk.start(p).plan(0, () => 0)) <= marked(fixedRule.start(p).plan(0, () => 0)));
  }
});

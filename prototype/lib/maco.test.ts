import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, avoidBusy, busyCellOf, buildPlan, recommend, weekDates, weekRows, type DayRecord } from './maco.ts';

test('cafe owner with 1~3 hours gets the 매장형 track and 3 tasks', () => {
  const a = analyze([0, 1, 0, 1, 1, 0]);
  assert.equal(a.track, '매장형');
  assert.equal(a.levelName, '기초');
  assert.equal(a.tasksPerWeek, 3);
  assert.equal(a.channel, '인스타그램');
});

test('shopping-mall channel or online store business means 온라인 셀러', () => {
  assert.equal(analyze([0, 0, 2, 0, 0, 0]).track, '온라인 셀러');
  assert.equal(analyze([5, 0, 0, 0, 0, 0]).track, '온라인 셀러');
  assert.equal(analyze([4, 0, 0, 0, 0, 0]).track, '1인 브랜드');
});

test('level: habit score plus 1 for any making experience', () => {
  assert.equal(analyze([0, 0, 0, 0, 0, 0]).levelName, '입문');
  assert.equal(analyze([0, 3, 0, 0, 1, 0]).levelName, '성장');
});

test('plan uses fixed days and the ease day becomes a 5-minute task', () => {
  const a = analyze([0, 1, 0, 1, 1, 0]);
  const plan = buildPlan(a, 3, '목');
  assert.deepEqual(plan.map((t) => t.day), ['화', '목', '토']);
  assert.equal(plan[1].minutes, 5);
  assert.match(plan[1].title, /^5분 버전/);
});

test('weekDates starts on Monday', () => {
  const d = weekDates(new Date(2026, 10, 19)); // Thu 19 Nov 2026
  assert.equal(d[0], '2026-11-16');
  assert.equal(d[6], '2026-11-22');
});

test('recommend: 2 of 3 done keeps the level, 3 of 3 goes up, 1 of 3 goes down', () => {
  const plan = buildPlan(analyze([0, 1, 0, 1, 1, 0]), 3);
  const now = new Date(2026, 10, 22);
  const mk = (s: ('done' | 'rest')[]) => {
    const r: Record<string, DayRecord> = {};
    weekRows(plan, {}, now).forEach((row, i) => { if (s[i]) r[row.date] = { status: s[i] }; });
    return weekRows(plan, r, now);
  };
  assert.deepEqual([recommend(mk(['done', 'rest', 'done']), 3).k, recommend(mk(['done', 'rest', 'done']), 3).n], [1, 3]);
  assert.equal(recommend(mk(['done', 'done', 'done']), 3).n, 4);
  assert.equal(recommend(mk(['done', 'rest', 'rest']), 3).n, 2);
});

test('busy times: a task moves to a free time the same day, else the nearest free day (later day first)', () => {
  const a = analyze([0, 1, 0, 1, 1, 0]); // 화·목·토, 오전 / 오전 / 오후
  const plan = buildPlan(a, 3);
  const tueMorning = busyCellOf(1, 0);
  const sat = [0, 1, 2].map((s) => busyCellOf(5, s));
  const moved = buildPlan(a, 3, null, [tueMorning, ...sat]);
  assert.deepEqual(moved.map((t) => t.day), ['화', '목', '일']);
  assert.equal(moved[0].slot, '오후');
  assert.equal(moved[2].title, plan[2].title);
  assert.deepEqual(avoidBusy(plan, []), plan);
});

test('busy times: five-minute day follows the moved task', () => {
  const a = analyze([0, 1, 0, 1, 1, 0]);
  const sat = [0, 1, 2].map((s) => busyCellOf(5, s));
  const t = buildPlan(a, 3, '일', sat).find((x) => x.day === '일')!;
  assert.equal(t.minutes, 5);
});

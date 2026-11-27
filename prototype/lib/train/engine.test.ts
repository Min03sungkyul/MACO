import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, UNITS, itemById } from './bank.ts';
import {
  EMPTY_TRAIN, XP, addDays, finishNode, goalMet, lessonItems, markBusy, nodeOpen, pCorrect, pickNext, quizItems,
  record, skillLevel, streak, thetaOf, type TrainState,
} from './engine.ts';
import { adsUnlocked, gateScores } from './gates.ts';
import { DEMO_READINGS, gradeText, judgePhoto } from '../ai/adapter.ts';
import { leagueTable, regionRank } from './league.ts';
import { skipFourWeeks } from './demo.ts';
import { EMPTY_PROGRESS } from './progress.ts';

const D = '2026-11-27';

test('bank: 40 items, valid answers, MVP units are 사진 and 리뷰', () => {
  assert.equal(ITEMS.length, 40);
  for (const it of ITEMS) {
    if (it.t === 'pick2') assert.ok(it.ans === 0 || it.ans === 1);
    if (it.t === 'judge') assert.ok(it.ans >= 0 && it.ans < it.o.length, it.id);
    if (it.t === 'spot') assert.ok(it.parts.some((p) => p.bad) && it.parts.some((p) => !p.bad), it.id);
  }
  assert.deepEqual(UNITS.filter((u) => u.ready).map((u) => u.skill), ['photo', 'review']);
});

test('Elo: a right answer raises skill and lowers the item, a wrong one does the opposite', () => {
  const it = itemById('p01')!;
  const up = record(EMPTY_TRAIN, it, true, 'lesson', D, 3000).state;
  const down = record(EMPTY_TRAIN, it, false, 'lesson', D, 3000).state;
  assert.ok(thetaOf(up, 'photo') > thetaOf(EMPTY_TRAIN, 'photo'));
  assert.ok(thetaOf(down, 'photo') < thetaOf(EMPTY_TRAIN, 'photo'));
  assert.ok((up.dAdj.p01 ?? 0) < 0 && (down.dAdj.p01 ?? 0) > 0);
  assert.ok(Math.abs(pCorrect(0, 0) - 0.5) < 1e-9);
});

test('next item is the one closest to 70% correct, and due reviews come first', () => {
  const it = pickNext(EMPTY_TRAIN, 'photo', 5, [], D)!;
  const p = pCorrect(-1, it.level === 1 ? -1 : it.level === 3 ? 0 : 1);
  assert.ok(Math.abs(p - 0.7) < 0.25);
  const withReview: TrainState = { ...EMPTY_TRAIN, review: { p19: { due: D, step: 0 } } };
  assert.equal(pickNext(withReview, 'photo', 5, [], D)!.id, 'p19');
  assert.equal(new Set(lessonItems(EMPTY_TRAIN, 'photo', 1, D).map((i) => i.id)).size, 6);
});

test('XP: right 10, wrong 2, same item again the same day gives half', () => {
  const it = itemById('r01')!;
  const a = record(EMPTY_TRAIN, it, true, 'lesson', D, 1000);
  assert.equal(a.xp, XP.correct);
  assert.equal(record(EMPTY_TRAIN, it, false, 'lesson', D, 1000).xp, XP.wrong);
  assert.equal(record(a.state, it, true, 'lesson', D, 1000).xp, XP.correct / 2);
  assert.equal(record(EMPTY_TRAIN, it, true, 'placement', D, 1000).xp, 0);
});

test('spaced review: wrong → tomorrow; right on review → 3 days → 7 days → done; weak note after 3 misses', () => {
  const it = itemById('r16')!;
  let s = record(EMPTY_TRAIN, it, false, 'lesson', D, 1000).state;
  assert.deepEqual(s.review.r16, { due: addDays(D, 1), step: 0 });
  s = record(s, it, true, 'notes', addDays(D, 1), 1000).state;
  assert.equal(s.review.r16.due, addDays(D, 4));
  s = record(s, it, true, 'notes', addDays(D, 4), 1000).state;
  s = record(s, it, true, 'notes', addDays(D, 11), 1000).state;
  assert.equal(s.review.r16, undefined);
  let w = EMPTY_TRAIN, note = null;
  for (const id of ['r16', 'r20', 'r16']) note = record(w = record(w, itemById(id)!, false, 'lesson', D, 1).state, itemById(id)!, false, 'lesson', D, 1).weakNote ?? note;
  assert.ok(note && note.includes('3번 연속'));
});

test('daily goal and streak; a busy day keeps the streak', () => {
  let s: TrainState = { ...EMPTY_TRAIN, goal: 30, days: { [addDays(D, -2)]: { xp: 40, sec: 0, solved: 4 }, [addDays(D, -1)]: { xp: 35, sec: 0, solved: 4 } } };
  assert.equal(streak(s, D), 2);
  s = markBusy(s, D);
  assert.ok(goalMet(s, D));
  assert.equal(streak(s, D), 3);
});

test('lesson path: levels open in order, unit test pass gives +30 once', () => {
  assert.ok(nodeOpen(EMPTY_TRAIN, 'photo', 1));
  assert.ok(!nodeOpen(EMPTY_TRAIN, 'photo', 3));
  assert.ok(!nodeOpen(EMPTY_TRAIN, 'info', 1));
  const s = finishNode(EMPTY_TRAIN, 'photo', 1, 80, D);
  assert.ok(nodeOpen(s, 'photo', 3));
  const t1 = finishNode(s, 'photo', 'test', 90, D);
  assert.equal(t1.days[D].xp - s.days[D].xp, XP.unitTest);
  assert.equal(finishNode(t1, 'photo', 'test', 100, D).days[D].xp, t1.days[D].xp);
  assert.deepEqual([skillLevel(-1), skillLevel(0.2), skillLevel(2)], [1, 3, 5]);
});

test('quiz has 5 items', () => {
  assert.equal(quizItems(EMPTY_TRAIN, D).length, 5);
});

test('gates: demo cafe fails 믿게, ads stay locked; after 4 weeks they open', () => {
  const g = gateScores(DEMO_READINGS);
  assert.ok(g['믿게'] < 70 && !adsUnlocked(g));
  const after = skipFourWeeks(EMPTY_TRAIN, { ...EMPTY_PROGRESS, gateChecks: [{ date: D, readings: DEMO_READINGS, scores: g }] }, D);
  assert.ok(adsUnlocked(after.prog.gateChecks.at(-1)!.scores));
  assert.equal(streak(after.train, addDays(D, 28)), 28);
});

test('rubric grading: good point first, one fix', () => {
  const bad = gradeText('complaint', '그런데 저희는 원래 이렇게 만들어요.');
  assert.ok(!bad.pass && bad.fix);
  const good = gradeText('complaint', '미지근해서 불편하셨겠어요. 정말 죄송합니다. 온도를 한 번 더 확인하겠습니다. 다음에 오시면 따뜻하게 드릴게요.');
  assert.ok(good.pass, JSON.stringify(good.checks));
});

test('photo check: dark flat image fails, bright detailed image passes', () => {
  const w = 20, h = 20, dark = new Uint8ClampedArray(w * h * 4).fill(30), bright = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) { const v = (i % 2) ? 230 : 90; bright.set([v, v, v, 255], i * 4); }
  assert.equal(judgePhoto(dark, w, h).pass, false);
  assert.equal(judgePhoto(bright, w, h).pass, true);
});

test('league and region are stable for the same week', () => {
  const a = leagueTable('2026-11-23', 3, 120, '나'), b = leagueTable('2026-11-23', 3, 120, '나');
  assert.deepEqual(a, b);
  assert.equal(a.length, 30);
  const r = regionRank('부평구', '2026-11-23', 3, 120, '나');
  assert.ok(r.rank >= 1 && r.rank <= r.total);
});

// 시연 도구 (기획서 E4, 12장): 예시 계정 2개와 "4주 넘기기".
// 발표 중 인터넷이 느려도 멈추지 않게, 모든 값은 미리 정해 둬요.

import { DEMO_READINGS } from '../ai/adapter.ts';
import { addDays, EMPTY_TRAIN, type TrainState } from './engine.ts';
import { gateScores } from './gates.ts';
import { EMPTY_PROGRESS, type Progress } from './progress.ts';

function history(today: string, days: number, xp: number, solved = 8): TrainState['days'] {
  const out: TrainState['days'] = {};
  for (let i = days; i >= 1; i--) out[addDays(today, -i)] = { xp, sec: 600, solved };
  return out;
}

/** 입문자: 학습 모드, 연습 카페, 3일째 */
export function learnerAccount(today: string): { train: TrainState; prog: Progress; ownerName: string } {
  return {
    ownerName: '예비 창업자',
    train: { ...EMPTY_TRAIN, theta: { photo: -0.6, review: -0.9 }, goal: 60, days: history(today, 3, 62), nodes: { 'photo-1': 83 } },
    prog: { ...EMPTY_PROGRESS, mode: 'learn', practice: 'cafe', habit: '퇴근길 지하철', region: '마포구', placementDone: true, onboarded: true },
  };
}

/** 사장님: 내 가게 모드, 리뷰 3개 부평구 카페, 캡처 진단 1회 */
export function ownerAccount(today: string): { train: TrainState; prog: Progress; ownerName: string } {
  const scores = gateScores(DEMO_READINGS);
  return {
    ownerName: '부평 무화과 카페',
    train: {
      ...EMPTY_TRAIN, theta: { photo: -0.2, review: -0.7 }, goal: 60, days: history(today, 5, 64),
      nodes: { 'photo-1': 100, 'review-1': 67 }, errs: { 'reply-empathy': { streak: 1, total: 2 } },
    },
    prog: {
      ...EMPTY_PROGRESS, mode: 'shop', shop: { name: '부평 무화과 카페', category: '카페,디저트', address: '인천 부평구 부평대로 88' },
      habit: '마감 정리 후', region: '부평구', placementDone: true, onboarded: true,
      gateChecks: [{ date: addDays(today, -5), readings: DEMO_READINGS, scores }],
    },
  };
}

/** 4주 넘기기: 28일 동안 매일 목표를 채우고, 다시 캡처하니 믿게 관문을 통과한 모습 */
export function skipFourWeeks(train: TrainState, prog: Progress, today: string): { train: TrainState; prog: Progress } {
  const after = addDays(today, 28);
  const days = { ...train.days };
  for (let i = 0; i < 28; i++) days[addDays(today, i + 1)] = { xp: 70 + (i % 5) * 6, sec: 660, solved: 9 };
  const readings = { ...(prog.gateChecks.at(-1)?.readings ?? DEMO_READINGS), menuPrice: true, photos: 9, reviews: 21, replied: 19, recentReviewDays: 2, news: true };
  return {
    train: { ...train, days, theta: { ...train.theta, photo: 0.9, review: 0.7 }, nodes: { ...train.nodes, 'photo-1': 100, 'photo-3': 100, 'photo-5': 83, 'review-1': 100, 'review-3': 83 } },
    prog: {
      ...prog, dayOffset: prog.dayOffset + 28,
      gateChecks: [...prog.gateChecks, { date: after, readings, scores: gateScores(readings) }],
      missions: { ...prog.missions, 'm-photo': { date: addDays(today, 9), score: 100 }, 'm-reply': { date: addDays(today, 16), score: 100 } },
      qr: { ...prog.qr, requests: prog.qr.requests + 18 },
    },
  };
}

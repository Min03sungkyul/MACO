// 엔진 밖의 사용자 기록: 모드·가게·목표, 관문 진단, 미션, 시험, 설정, 시연 도구.
// 서버가 생기면 이 모양 그대로 API로 옮겨요 (docs/api-contract.md).

import type { Readings } from '../ai/adapter.ts';
import type { GateScores } from './gates.ts';

export type Mode = 'learn' | 'shop';
export type Shop = { name: string; category: string; address: string };

export type Progress = {
  mode: Mode | null;
  shop: Shop | null;
  /** 학습 모드의 연습 가게 */
  practice: string | null;
  habit: string | null;
  region: string;
  placementDone: boolean;
  onboarded: boolean;
  gateChecks: { date: string; readings: Readings; scores: GateScores }[];
  spotFound: string[];
  missions: Record<string, { date: string; score: number }>;
  qr: { url: string; requests: number };
  adPlan: { channel: string; budget: number; stopRule: string; start: string } | null;
  quizzes: { date: string; score: number }[];
  roleplays: { date: string; score: number }[];
  privacy: 'all' | 'friends' | 'none';
  leagueOn: boolean;
  /** 시연 도구: 날짜 넘기기 */
  dayOffset: number;
};

export const EMPTY_PROGRESS: Progress = {
  mode: null, shop: null, practice: null, habit: null, region: '부평구', placementDone: false, onboarded: false,
  gateChecks: [], spotFound: [], missions: {}, qr: { url: '', requests: 0 }, adPlan: null,
  quizzes: [], roleplays: [], privacy: 'all', leagueOn: true, dayOffset: 0,
};

export const PRACTICE_STORES = [
  { id: 'cafe', name: '연습 카페 마코', category: '카페', ready: true },
  { id: 'restaurant', name: '연습 식당', category: '음식점', ready: false },
  { id: 'beauty', name: '연습 미용실', category: '뷰티', ready: false },
  { id: 'craft', name: '연습 공방', category: '공방', ready: false },
];

export const latestGate = (p: Progress) => p.gateChecks[p.gateChecks.length - 1] ?? null;
export const shopName = (p: Progress) => p.shop?.name ?? PRACTICE_STORES.find((s) => s.id === p.practice)?.name ?? '우리 가게';

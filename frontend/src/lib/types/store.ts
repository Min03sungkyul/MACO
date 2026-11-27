/** 🏪 내 가게 / 연습 가게 (담당: 강민국). 서버: com.maco.store.dto.* */
import type { AiSource, GradeOutput, XpResult } from './common';

/** 캡처에서 읽은 항목 (사장님이 확인·수정) */
export type Readings = {
  hours: boolean;
  menuPrice: boolean;
  photos: number;
  contact: boolean;
  reviews: number;
  rating: number;
  replied: number;
  recentReviewDays: number;
  news: boolean;
  coupon: boolean;
  insta: boolean;
};

export type GateScores = {
  findScore: number;
  trustScore: number;
  notifyScore: number;
  findPassed: boolean;
  trustPassed: boolean;
  notifyPassed: boolean;
  adUnlocked: boolean;
};

export type DiagnosisCard = { gate: 'FIND' | 'TRUST' | 'NOTIFY'; key: string; label: string; value: number; card: string; skill: string };

export type GateCheck = { checkDate: string; readings: Readings; scores: GateScores; cards: DiagnosisCard[] };

export type PlaceSearchResult = {
  name: string;
  category: string | null;
  address: string | null;
  roadAddress: string | null;
  mapx: string | null;
  mapy: string | null;
  link: string | null;
  demo: boolean;
};

export type StoreInfo = { id: number | null; name: string; category: string | null; address: string | null; practice: boolean };

export type Mission = {
  id: number;
  code: string;
  skillCode: string;
  gate: string;
  title: string;
  description: string | null;
  unlockLevel: number;
  submitType: 'PHOTO' | 'TEXT';
  unlocked: boolean;
  passed: boolean;
};

export type StoreHome = { store: StoreInfo; latest: GateCheck | null; missions: Mission[]; quest: { title: string; done: number; total: number } | null };

export type CaptureReadResponse = { captureId: number | null; platform: 'PLACE' | 'INSTA'; readings: Readings; source: AiSource };

export type SpotGame = { gameId: number | null; rows: { key: string; label: string; sub: string }[]; toFind: number; foundKeys: string[] };
export type SpotTapResult = { found: boolean; card: string; tip: string | null; foundCount: number; toFind: number; xp: XpResult };

export type MissionFeedback = { feedback: GradeOutput; source: AiSource; xp: XpResult };

export type ReviewCard = { id: number | null; storeName: string; message: string; qrTargetUrl: string; requestsToday: number; requestsTotal: number };

export type AdGate = { locked: boolean; reason: string | null; scores: GateScores; experiment: { channel: string; budget: number; stopRule: string } | null };

export type PracticeStore = { id: number; code: string; storeType: string; name: string };

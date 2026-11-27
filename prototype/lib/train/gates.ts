// 3관문 진단 (기획서 3장 원칙 ①, 8-1). 캡처에서 읽은 항목을 규칙으로 점수 매겨요.
// 통과 기준 70점은 가설이에요. 델파이·파일럿으로 보정해요.

import type { Readings } from '../ai/adapter.ts';
import type { Gate, SkillId } from './types.ts';

export const PASS = 70;

type Rule = { gate: Gate; key: string; label: string; score: (r: Readings) => number; card: string; skill: SkillId; spot: string };

export const RULES: Rule[] = [
  { gate: '찾게', key: 'hours', label: '영업시간', score: (r) => (r.hours ? 1 : 0), card: '영업시간이 비어 있어요', skill: 'info', spot: '영업시간 정보 없음' },
  { gate: '찾게', key: 'menuPrice', label: '메뉴·가격', score: (r) => (r.menuPrice ? 1 : 0), card: '메뉴에 가격이 없어요', skill: 'info', spot: '메뉴 가격이 비어 있음' },
  { gate: '찾게', key: 'photos', label: '사진 5장 이상', score: (r) => Math.min(1, r.photos / 5), card: '사진이 5장보다 적어요', skill: 'photo', spot: '사진이 몇 장 없음' },
  { gate: '찾게', key: 'contact', label: '전화·주소', score: (r) => (r.contact ? 1 : 0), card: '전화번호나 주소가 없어요', skill: 'info', spot: '연락처 없음' },
  { gate: '믿게', key: 'reviews', label: '리뷰 20개', score: (r) => Math.min(1, r.reviews / 20), card: `리뷰가 20개보다 적어요`, skill: 'review', spot: '리뷰가 몇 개 없음' },
  { gate: '믿게', key: 'replied', label: '사장님 답글', score: (r) => (r.reviews ? r.replied / r.reviews : 0), card: '답글이 없는 리뷰가 있어요', skill: 'review', spot: '답글 없는 리뷰' },
  { gate: '믿게', key: 'recent', label: '최근 30일 리뷰', score: (r) => (r.recentReviewDays <= 30 ? 1 : 0), card: '최근 한 달 리뷰가 없어요', skill: 'review', spot: '오래된 리뷰만 있음' },
  { gate: '믿게', key: 'rating', label: '별점 4.0 이상', score: (r) => (r.rating >= 4 ? 1 : r.rating / 4), card: '별점이 4.0보다 낮아요', skill: 'review', spot: '낮은 별점' },
  { gate: '알리게', key: 'news', label: '소식', score: (r) => (r.news ? 1 : 0), card: '소식이 한 번도 없어요', skill: 'promo', spot: '소식 탭이 비어 있음' },
  { gate: '알리게', key: 'coupon', label: '쿠폰', score: (r) => (r.coupon ? 1 : 0), card: '쿠폰이 없어요', skill: 'promo', spot: '쿠폰 없음' },
  { gate: '알리게', key: 'insta', label: '인스타 연결', score: (r) => (r.insta ? 1 : 0), card: '인스타그램이 연결돼 있지 않아요', skill: 'promo', spot: '인스타 링크 없음' },
];
export const GATES: Gate[] = ['찾게', '믿게', '알리게'];

export type GateScores = Record<Gate, number>;
export function gateScores(r: Readings): GateScores {
  const out = {} as GateScores;
  for (const g of GATES) {
    const rs = RULES.filter((x) => x.gate === g);
    out[g] = Math.round((rs.reduce((a, x) => a + x.score(r), 0) / rs.length) * 100);
  }
  return out;
}
export const passed = (s: GateScores, g: Gate) => s[g] >= PASS;
/** 앞 관문을 통과해야 광고가 열려요 */
export const adsUnlocked = (s: GateScores | null) => !!s && passed(s, '찾게') && passed(s, '믿게');

/** 진단 카드: 점수가 낮은 항목부터, 연결된 연습까지 */
export function diagnosisCards(r: Readings) {
  return RULES.map((x) => ({ ...x, value: x.score(r) })).filter((x) => x.value < 1).sort((a, b) => a.value - b.value);
}

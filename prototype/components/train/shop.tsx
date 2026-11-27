'use client';

import type { Readings } from '@/lib/ai/adapter';
import { GATES, PASS, type GateScores } from '@/lib/train/gates';
import { skillLevel, thetaOf, type TrainState } from '@/lib/train/engine';

/** 3관문 점수 막대 (찾게 → 믿게 → 알리게), 70점 통과선 */
export function GateBars({ scores }: { scores: GateScores }) {
  return (
    <div className="g-bars">
      {GATES.map((g) => (
        <div key={g} className={`g-bar ${scores[g] >= PASS ? 'pass' : ''}`}>
          <span className="k">{g}</span>
          <div className="track"><i style={{ width: `${scores[g]}%` }} /><em style={{ left: `${PASS}%` }} /></div>
          <b>{scores[g]}</b>
        </div>
      ))}
    </div>
  );
}

export const MISSIONS = [
  { id: 'm-photo', title: '대표 메뉴 사진 다시 찍기', skill: 'photo' as const, need: 2, desc: '배운 대로 밝고 선명하게, 주인공 하나만 크게 찍어 올려요. 마코가 밝기와 선명도를 채점해요.' },
  { id: 'm-reply', title: '최근 리뷰에 답글 달기', skill: 'review' as const, need: 2, desc: '공감 → 사과 → 개선 → 다시 오기 순서로 직접 답글을 써요. 마코는 대신 써 주지 않고 첨삭만 해요.' },
];
export const missionOpen = (t: TrainState, m: (typeof MISSIONS)[number]) => skillLevel(thetaOf(t, m.skill)) >= m.need;

/** 손님이 보는 플레이스 화면을 진단 결과로 그려요 (틀린 곳 찾기의 배경) */
export function placeRows(r: Readings, name: string) {
  return [
    { id: 'title', label: name, sub: `카페 · 리뷰 ${r.reviews} · ★${r.rating.toFixed(1)}`, rule: null as string | null },
    { id: 'hours', label: '영업시간', sub: r.hours ? '매일 10:00 – 21:00' : '정보 없음', rule: r.hours ? null : 'hours' },
    { id: 'contact', label: '전화 · 주소', sub: r.contact ? '032-000-0000 · 부평대로 88' : '정보 없음', rule: r.contact ? null : 'contact' },
    { id: 'menuPrice', label: '메뉴', sub: r.menuPrice ? '무화과 라떼 6,000원 · 무화과 케이크 7,500원' : '무화과 라떼 · 무화과 케이크 (가격 없음)', rule: r.menuPrice ? null : 'menuPrice' },
    { id: 'photos', label: `사진 ${r.photos}장`, sub: r.photos >= 5 ? '메뉴 · 매장 · 외관' : '메뉴 사진만 몇 장', rule: r.photos >= 5 ? null : 'photos' },
    { id: 'replied', label: '리뷰', sub: r.replied < r.reviews ? `답글 없는 리뷰 ${r.reviews - r.replied}개` : '모든 리뷰에 답글', rule: r.replied < r.reviews ? 'replied' : null },
    { id: 'news', label: '소식', sub: r.news ? '이번 주 신메뉴 소식' : '아직 소식이 없어요', rule: r.news ? null : 'news' },
  ];
}

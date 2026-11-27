/**
 * 목업 모드용 계산 (서버 GateService·StoreService.placeRows·RankingService와 같은 규칙).
 * 목업 전용이다. 실제 계산은 서버에서 한다.
 */
import type { RankRow } from '../../types/ranking';
import type { DiagnosisCard, GateCheck, Readings } from '../../types/store';

type Rule = { gate: DiagnosisCard['gate']; key: string; label: string; score: (r: Readings) => number; card: string; skill: string };

const RULES: Rule[] = [
  { gate: 'FIND', key: 'hours', label: '영업시간', score: (r) => (r.hours ? 1 : 0), card: '영업시간이 비어 있어요', skill: 'INFO' },
  { gate: 'FIND', key: 'menuPrice', label: '메뉴·가격', score: (r) => (r.menuPrice ? 1 : 0), card: '메뉴에 가격이 없어요', skill: 'INFO' },
  { gate: 'FIND', key: 'photos', label: '사진 5장 이상', score: (r) => Math.min(1, r.photos / 5), card: '사진이 5장보다 적어요', skill: 'PHOTO' },
  { gate: 'FIND', key: 'contact', label: '전화·주소', score: (r) => (r.contact ? 1 : 0), card: '전화번호나 주소가 없어요', skill: 'INFO' },
  { gate: 'TRUST', key: 'reviews', label: '리뷰 20개', score: (r) => Math.min(1, r.reviews / 20), card: '리뷰가 20개보다 적어요', skill: 'REVIEW' },
  { gate: 'TRUST', key: 'replied', label: '사장님 답글', score: (r) => (r.reviews ? r.replied / r.reviews : 0), card: '답글이 없는 리뷰가 있어요', skill: 'REVIEW' },
  { gate: 'TRUST', key: 'recent', label: '최근 30일 리뷰', score: (r) => (r.recentReviewDays <= 30 ? 1 : 0), card: '최근 한 달 리뷰가 없어요', skill: 'REVIEW' },
  { gate: 'TRUST', key: 'rating', label: '별점 4.0 이상', score: (r) => (r.rating >= 4 ? 1 : r.rating / 4), card: '별점이 4.0보다 낮아요', skill: 'REVIEW' },
  { gate: 'NOTIFY', key: 'news', label: '소식', score: (r) => (r.news ? 1 : 0), card: '소식이 한 번도 없어요', skill: 'PROMO' },
  { gate: 'NOTIFY', key: 'coupon', label: '쿠폰', score: (r) => (r.coupon ? 1 : 0), card: '쿠폰이 없어요', skill: 'PROMO' },
  { gate: 'NOTIFY', key: 'insta', label: '인스타 연결', score: (r) => (r.insta ? 1 : 0), card: '인스타그램이 연결돼 있지 않아요', skill: 'PROMO' },
];

const PASS = 70;

export function gateCheck(r: Readings, checkDate: string): GateCheck {
  const score = (g: Rule['gate']) => {
    const rs = RULES.filter((x) => x.gate === g);
    return Math.round((rs.reduce((a, x) => a + x.score(r), 0) / rs.length) * 100);
  };
  const [find, trust, notify] = [score('FIND'), score('TRUST'), score('NOTIFY')];
  return {
    checkDate,
    readings: r,
    scores: {
      findScore: find, trustScore: trust, notifyScore: notify,
      findPassed: find >= PASS, trustPassed: trust >= PASS, notifyPassed: notify >= PASS,
      adUnlocked: find >= PASS && trust >= PASS,
    },
    cards: RULES.map((x) => ({ gate: x.gate, key: x.key, label: x.label, value: x.score(r), card: x.card, skill: x.skill }))
      .filter((c) => c.value < 1).sort((a, b) => a.value - b.value),
  };
}

export function placeRows(r: Readings, name: string) {
  const tip = '플레이스 정보를 채우면 손님이 묻지 않고 찾아와요.';
  return [
    { key: 'title', label: name, sub: `카페 · 리뷰 ${r.reviews} · ★${r.rating.toFixed(1)}`, rule: false, card: '', tip },
    { key: 'hours', label: '영업시간', sub: r.hours ? '매일 10:00 – 21:00' : '정보 없음', rule: !r.hours, card: '영업시간이 비어 있어요', tip },
    { key: 'contact', label: '전화 · 주소', sub: r.contact ? '032-000-0000 · 부평대로 88' : '정보 없음', rule: !r.contact, card: '전화번호나 주소가 없어요', tip },
    { key: 'menuPrice', label: '메뉴', sub: r.menuPrice ? '무화과 라떼 6,000원 · 무화과 케이크 7,500원' : '무화과 라떼 · 무화과 케이크 (가격 없음)', rule: !r.menuPrice, card: '메뉴에 가격이 없어요', tip },
    { key: 'photos', label: `사진 ${r.photos}장`, sub: r.photos >= 5 ? '메뉴 · 매장 · 외관' : '메뉴 사진만 몇 장', rule: r.photos < 5, card: '사진이 5장보다 적어요', tip: '팔고 싶은 메뉴가 화면의 절반 이상을 차지하게 찍어요.' },
    { key: 'replied', label: '리뷰', sub: r.replied < r.reviews ? `답글 없는 리뷰 ${r.reviews - r.replied}개` : '모든 리뷰에 답글', rule: r.replied < r.reviews, card: '답글이 없는 리뷰가 있어요', tip: '가능하면 하루 안에 답해요.' },
    { key: 'news', label: '소식', sub: r.news ? '이번 주 신메뉴 소식' : '아직 소식이 없어요', rule: !r.news, card: '소식이 한 번도 없어요', tip },
  ];
}

const NAMES = ['부평 빵공방', '삼산 꽃집', '갈산 네일', '부개 국밥', '청천 라떼', '산곡 떡집', '십정 공방', '일신 반찬', '구산 문구', '부평 와인바',
  '삼산 커피', '갈산 분식', '부개 미용실', '청천 베이글', '산곡 정육', '십정 카페', '일신 꽃차', '구산 피자', '부평 도넛', '삼산 수제버거',
  '갈산 쌀국수', '부개 케이크', '청천 브런치', '산곡 김밥', '십정 마카롱', '일신 젤라또', '구산 샐러드', '부평 찻집', '삼산 포케'];

export function leagueRows(myXp: number, myName: string, dayOffset: number) {
  const others = NAMES.map((name, i) => ({ name, xp: 40 + ((i * 97 + dayOffset * 13) % 420) }));
  const all = [...others, { name: myName, xp: myXp }].sort((a, b) => b.xp - a.xp);
  const rows: RankRow[] = all.map((r, i) => ({ rank: i + 1, name: r.name, xp: r.xp, me: r.name === myName }));
  const myRank = rows.find((r) => r.me)!.rank;
  return {
    tier: 1, tierName: '동네 새싹', weekStart: '', hoursLeft: 72, promoteLine: 7, demoteLine: 25, myRank,
    xpToPromote: Math.max(0, rows[6].xp - myXp + 1), rows,
  };
}

export function rankRegion(region: string, myXp: number, myName: string) {
  const total = 412;
  const others = Array.from({ length: total - 1 }, (_, i) => Math.round(Math.pow(1 - i / total, 2.2) * 700));
  const rank = 1 + others.filter((x) => x > myXp).length;
  const name = (i: number) => NAMES[i % NAMES.length].replace(/^\S+/, region.replace(/구$/, ''));
  const rows: RankRow[] = others.map((xp, i) => ({ rank: 0, name: name(i), xp, me: false }));
  rows.splice(rank - 1, 0, { rank, name: myName, xp: myXp, me: true });
  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  return {
    region, rank, total, topPercent: Math.max(1, Math.round((100 * rank) / total)),
    top: ranked.slice(0, 10), around: ranked.slice(Math.max(0, rank - 2), rank + 1),
  };
}

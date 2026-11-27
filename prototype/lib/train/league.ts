// 주간 리그와 지역 랭킹 (기획서 8-2). 서버가 없어서 다른 사용자는 시연용 가상 데이터예요.
// 숫자는 같은 주·같은 지역이면 언제나 같게 나오도록 시드로 만들어요.

export const TIERS = ['동네 새싹', '골목 스타', '상권 고수', '지역 명소', '마케팅 마스터'];
export const GROUP = 30;
export const PROMOTE = 7;
export const DEMOTE = 5;

const NAMES = ['부평 빵공방', '삼산 꽃집', '갈산 네일', '부개 국밥', '청천 라떼', '산곡 떡집', '십정 공방', '일신 반찬', '구산 문구', '부평 와인바',
  '삼산 커피', '갈산 분식', '부개 미용실', '청천 베이글', '산곡 정육', '십정 카페', '일신 꽃차', '구산 피자', '부평 도넛', '삼산 수제버거',
  '갈산 쌀국수', '부개 케이크', '청천 브런치', '산곡 김밥', '십정 마카롱', '일신 젤라또', '구산 샐러드', '부평 찻집', '삼산 포케', '갈산 와플'];

function rand(seed: number) {
  let t = seed >>> 0;
  return () => { t = (t + 0x6d2b79f5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261);

/** 이번 주 다른 29명의 주간 XP. dayIndex(0=월)가 지날수록 쌓여요. */
export function leagueTable(weekStart: string, dayIndex: number, myXp: number, myName: string) {
  const rnd = rand(hash(weekStart));
  const others = NAMES.slice(0, GROUP - 1).map((name) => {
    const weekly = Math.round(40 + rnd() * 520);
    return { name, xp: Math.round((weekly * (dayIndex + 1)) / 7), me: false };
  });
  return [...others, { name: myName, xp: myXp, me: true }].sort((a, b) => b.xp - a.xp);
}

/** 구 단위 주간 순위: 예) 부평구 23위 / 412명 (상위 6%) */
export function regionRank(region: string, weekStart: string, dayIndex: number, myXp: number, myName: string) {
  const rnd = rand(hash(region + weekStart));
  const total = 300 + Math.floor(rand(hash(region))() * 250);
  const scale = (dayIndex + 1) / 7;
  const xs: number[] = [];
  for (let i = 0; i < total - 1; i++) { const u = rnd(); xs.push(Math.round(Math.pow(u, 2.2) * 700 * scale)); }
  xs.sort((a, b) => b - a);
  const rank = 1 + xs.filter((x) => x > myXp).length;
  const names = NAMES.map((n) => n.replace(/^\S+/, region.replace(/구$/, '')));
  const rows = xs.map((xp, i) => ({ name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''), xp, me: false }));
  rows.splice(rank - 1, 0, { name: myName, xp: myXp, me: true });
  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  return { rank, total, top: Math.max(1, Math.round((rank / total) * 100)), top10: ranked.slice(0, 10), around: ranked.slice(Math.max(0, rank - 2), rank + 1) };
}

export const REGIONS = ['부평구', '남동구', '연수구', '마포구', '성동구', '강남구', '해운대구', '수성구'];

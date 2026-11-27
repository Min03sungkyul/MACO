// AI 어댑터 (기획서 10장). 지금은 시연용 모드: 규칙 채점 + 미리 써 둔 응답으로 동작해요.
// 실제 AI를 붙일 때는 이 파일의 함수 안만 바꾸면 되고, 화면은 그대로예요.
// 원칙: AI는 결과물을 대신 만들지 않고 채점·설명만 해요. 판단(정답·난이도)은 규칙과 Elo가 해요.

import { ERRORS } from '../train/bank.ts';
import type { ErrorType, Item, RubricId } from '../train/types.ts';

export const AI_MODE: 'demo' | 'live' = 'demo';

/* ───────── 고쳐 쓰기·미션 첨삭: 루브릭 채점 ───────── */
type Check = { key: string; label: string; err: ErrorType; any: RegExp; good: string; fix: string };

const CHECKS: Record<RubricId, Check[]> = {
  praise: [
    { key: 'thanks', label: '감사', err: 'reply-template', any: /감사|고마|고맙/, good: '감사 인사로 시작했어요.', fix: '"감사해요" 한마디로 시작해 보세요.' },
    { key: 'specific', label: '손님 말 다시 부르기', err: 'reply-template', any: /크루아상|라떼|케이크|빵|커피|메뉴|바삭|고소|분위기|자리/, good: '손님이 말한 메뉴를 다시 불렀어요.', fix: '손님이 칭찬한 메뉴 이름을 넣어 보세요.' },
    { key: 'revisit', label: '다시 오기', err: 'reply-revisit', any: /또 |다시|들러|방문|오세요|와 주세요|오시면/, good: '다시 오실 이유를 드렸어요.', fix: '"또 들러 주세요"처럼 다시 오라는 말을 붙여 보세요.' },
    { key: 'clean', label: '과한 홍보 없음', err: 'reply-promo', any: /^(?![\s\S]*(팔로우|이벤트 참여|!!!))/, good: '홍보 없이 깔끔해요.', fix: '팔로우·이벤트 홍보는 빼 보세요.' },
  ],
  complaint: [
    { key: 'empathy', label: '공감', err: 'reply-empathy', any: /불편|속상|실망|답답|기다리|아쉬/, good: '손님 마음을 먼저 받아 줬어요.', fix: '"불편하셨겠어요"처럼 공감을 먼저 써 보세요.' },
    { key: 'apology', label: '사과', err: 'reply-apology', any: /죄송|사과/, good: '분명하게 사과했어요.', fix: '"죄송합니다"를 분명하게 넣어 보세요.' },
    { key: 'fix', label: '개선 약속', err: 'reply-fix', any: /확인하|바꾸|개선|안내|준비하|하겠|할게|드리겠|챙기/, good: '무엇을 바꿀지 말했어요.', fix: '앞으로 무엇을 바꿀지 한 문장으로 적어 보세요.' },
    { key: 'revisit', label: '다시 오기', err: 'reply-revisit', any: /다음|또 |다시|오시면|방문/, good: '다시 오실 이유를 드렸어요.', fix: '"다음에 오시면 …"으로 다시 오실 이유를 드려 보세요.' },
    { key: 'calm', label: '변명·반박 없음', err: 'reply-defensive', any: /^(?![\s\S]*(그런데|원래|다른 손님|어쩔 수|저희 탓))/, good: '변명 없이 담백해요.', fix: '"원래", "다른 손님은" 같은 변명은 빼 보세요.' },
  ],
};

export type Graded = { score: number; pass: boolean; checks: { label: string; ok: boolean }[]; good: string; fix: string | null; errs: ErrorType[] };

/** 잘한 점 먼저, 고칠 점은 하나만 (기획서 8-3 튜터 성격) */
export function gradeText(rubric: RubricId, text: string): Graded {
  const t = text.trim();
  const cs = CHECKS[rubric];
  const res = cs.map((c) => ({ c, ok: t.length >= 8 && c.any.test(t) }));
  const score = Math.round((res.filter((r) => r.ok).length / cs.length) * 100);
  const firstGood = res.find((r) => r.ok);
  const firstBad = res.find((r) => !r.ok);
  return {
    score,
    pass: score >= 75,
    checks: res.map((r) => ({ label: r.c.label, ok: r.ok })),
    good: firstGood ? firstGood.c.good : '끝까지 써 보셨어요. 그게 시작이에요.',
    fix: firstBad ? firstBad.c.fix : null,
    errs: res.filter((r) => !r.ok).map((r) => r.c.err),
  };
}

/* ───────── "왜 틀렸어요?" ───────── */
export function explainWrong(item: Item): string {
  const e = ERRORS[item.err];
  return `이 문제는 "${e.name}"을(를) 보는 문제예요. ${item.why} 기억할 한 가지: ${e.tip}`;
}

/* ───────── 상황극: AI 손님 3턴 (시연용 대본) ───────── */
export type Turn = { from: 'guest' | 'owner'; text: string };
export const ROLEPLAY = {
  id: 'lukewarm-latte',
  title: '미지근한 라떼 불만 리뷰',
  guest: '★2 손님',
  opening: '어제 라떼가 미지근했어요. 직원분도 바빠 보여서 말을 못 했네요. ★2',
  /** 사장님 답에 따라 다음 손님 말이 달라져요 */
  replies: [
    { if: /죄송|사과/, text: '사과해 주시니 마음이 좀 풀리네요. 그런데 다음에 가도 또 그럴까 봐 걱정돼요.' },
    { if: /.*/, text: '음… 제 말을 제대로 들으신 건지 모르겠어요. 다음에 또 미지근하면 어떡하죠?' },
  ],
  replies2: [
    { if: /확인|바꾸|개선|하겠|할게|드리겠/, text: '그렇게 해 주신다면 한 번 더 가 볼게요. 혹시 다음에 가면 말씀드리면 되나요?' },
    { if: /.*/, text: '구체적으로 뭐가 달라지는지 잘 모르겠어요. 다른 가게를 가야 할지 고민돼요.' },
  ],
};
export function guestReply(turnIndex: number, ownerText: string): string | null {
  const pool = turnIndex === 0 ? ROLEPLAY.replies : turnIndex === 1 ? ROLEPLAY.replies2 : null;
  return pool ? pool.find((r) => r.if.test(ownerText))!.text : null;
}
export function gradeRoleplay(ownerTexts: string[]) {
  const g = gradeText('complaint', ownerTexts.join(' '));
  // 대화 전체에서 빠진 항목만, 가장 짧게 답한 턴에 붙여서 보여 줘요 (최대 3개)
  const shortest = ownerTexts.reduce((a, t, i) => (t.length < ownerTexts[a].length ? i : a), 0);
  const fixes = CHECKS.complaint.filter((c) => !c.any.test(ownerTexts.join(' '))).map((c) => c.fix).slice(0, 3);
  const lines = fixes.map((fix) => ({ turn: shortest + 1, text: ownerTexts[shortest], fix }));
  return { ...g, xp: Math.round(g.score / 5), lines };
}

/* ───────── 캡처 읽기 (시연용 저장 결과) ───────── */
export type Readings = {
  hours: boolean; menuPrice: boolean; photos: number; contact: boolean;
  reviews: number; rating: number; replied: number; recentReviewDays: number;
  news: boolean; coupon: boolean; insta: boolean;
};
/** 리뷰 3개뿐인 오픈 3개월 카페 (기획서 시연 페르소나) */
export const DEMO_READINGS: Readings = {
  hours: true, menuPrice: false, photos: 4, contact: true,
  reviews: 3, rating: 4.3, replied: 1, recentReviewDays: 12,
  news: false, coupon: false, insta: false,
};
export async function readCapture(_file: File | null): Promise<Readings> {
  await new Promise((r) => setTimeout(r, 900));
  return { ...DEMO_READINGS };
}

/* ───────── 사진 미션 첨삭: 이미지에서 밝기·선명도를 계산 (AI 없이) ───────── */
export type PhotoCheck = { brightness: number; sharpness: number; pass: boolean; good: string; fix: string | null };
export function judgePhoto(pixels: Uint8ClampedArray, w: number, h: number): PhotoCheck {
  let sum = 0;
  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < pixels.length; i += 4, p++) {
    const y = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    lum[p] = y; sum += y;
  }
  const brightness = sum / (w * h);
  let edge = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    edge += Math.abs(4 * lum[i] - lum[i - 1] - lum[i + 1] - lum[i - w] - lum[i + w]);
  }
  const sharpness = edge / ((w - 2) * (h - 2));
  const darkOk = brightness >= 85, overOk = brightness <= 215, sharpOk = sharpness >= 6;
  const pass = darkOk && overOk && sharpOk;
  return {
    brightness: Math.round(brightness), sharpness: Math.round(sharpness * 10) / 10, pass,
    good: pass ? '밝기와 선명도가 모두 좋아요.' : darkOk && overOk ? '밝기는 좋아요.' : sharpOk ? '초점은 잘 맞았어요.' : '다시 찍어 볼 준비가 됐어요.',
    fix: !darkOk ? '조금 어두워요. 창가 자연광에서 다시 찍어 보세요.' : !overOk ? '너무 밝아요. 햇빛이 직접 닿지 않는 자리로 옮겨 보세요.' : !sharpOk ? '살짝 흔들렸어요. 팔꿈치를 테이블에 대고 찍어 보세요.' : null,
  };
}

/**
 * 목업 모드 (NEXT_PUBLIC_API_MOCK=true): 서버 없이 프로토타입 데이터로 응답한다.
 * 서버 API와 같은 모양을 돌려주므로 화면 코드는 바꿀 필요가 없다. 상태는 새로고침하면 처음으로 돌아간다.
 * content.json 은 content/*.csv 에서 만든 시연 데이터(정답 포함, 목업 전용)다.
 *
 * 각 탭 담당은 자기 주소의 목업 응답을 여기에서 고친다 (섹션 주석 참고).
 * 서버가 준비되면 NEXT_PUBLIC_API_MOCK=false 로 실제 서버를 쓴다.
 */
import type { AttemptRequest, AttemptResult, Item, XpResult } from '../../types/common';
import type { Readings } from '../../types/store';
import content from './content.json';
import { gateCheck, placeRows, rankRegion, leagueRows } from './rules';

type MockHotspot = Item['hotspots'][number] & { bad: boolean; reason: string };
type MockItem = Omit<Item, 'hotspots'> & {
  answer: string | null;
  explanation: string;
  sampleAnswer: string | null;
  errors: Record<string, string>;
  hotspots: MockHotspot[];
};

const ITEMS = content.items as unknown as MockItem[];
const XP = { correct: 10, wrong: 2, lesson: 10, quizCorrect: 4, quizPerfect: 10, spot: 5, mission: 50 }; // 가정값 (서버 XpPolicy와 같게)

const state = {
  mode: 'STORE' as 'LEARNING' | 'STORE' | null,
  dayOffset: 0,
  todayXp: 0,
  goalXp: 60,
  streak: 3,
  found: new Set<string>(),
  roleplay: [] as { role: 'customer' | 'owner'; text: string }[],
  requests: 0,
};

const DEMO_READINGS: Readings = {
  hours: true, menuPrice: false, photos: 4, contact: true, reviews: 3, rating: 4.3,
  replied: 1, recentReviewDays: 12, news: false, coupon: false, insta: false,
};
const WEEK4_READINGS: Readings = { ...DEMO_READINGS, menuPrice: true, photos: 9, reviews: 21, replied: 19, recentReviewDays: 2, news: true };

function today(): string {
  const d = new Date();
  d.setDate(d.getDate() + state.dayOffset);
  return d.toISOString().slice(0, 10);
}

function xp(gained: number): XpResult {
  const before = state.todayXp;
  state.todayXp = Math.min(300, state.todayXp + gained);
  return {
    gained,
    todayXp: state.todayXp,
    goalXp: state.goalXp,
    goalAchievedNow: before < state.goalXp && state.todayXp >= state.goalXp,
    streakDays: state.streak,
    levelUps: [],
  };
}

const publicItem = (i: MockItem): Item => ({
  id: i.id, code: i.code, skillCode: i.skillCode, type: i.type, prompt: i.prompt, context: i.context, media: i.media,
  choices: i.choices, rubricCode: i.rubricCode, conceptCardId: i.conceptCardId, initDifficulty: i.initDifficulty,
  hotspots: i.hotspots.map((h) => ({ partKey: h.partKey, label: h.label, stars: h.stars, x: h.x, y: h.y, w: h.w, h: h.h })),
});

function grade(item: MockItem, req: AttemptRequest): AttemptResult {
  let correct = false;
  if (item.type === 'SPOT') {
    const want = (item.answer ?? '').split('|').sort().join();
    correct = (req.answer ?? '').split('|').filter(Boolean).sort().join() === want;
  } else if (item.type === 'REWRITE') {
    correct = (req.score ?? 0) >= 70;
  } else {
    correct = (req.answer ?? '').toUpperCase() === item.answer;
  }
  const gained = req.context === 'PLACEMENT' ? 0 : req.context === 'QUIZ' ? (correct ? XP.quizCorrect : 0) : correct ? XP.correct : XP.wrong;
  return {
    correct,
    answer: item.answer,
    errorType: correct ? null : item.errors[(req.answer ?? '').toUpperCase()] ?? Object.values(item.errors)[0] ?? null,
    explanation: item.explanation,
    principleCardId: item.conceptCardId,
    weakNote: null,
    xp: xp(gained),
  };
}

/** 루브릭 규칙 채점 (서버 FallbackRules와 같은 패턴) */
const PATTERNS: Record<string, RegExp> = {
  'REPLY_PRAISE:THANKS': /감사|고마|고맙/, 'REPLY_PRAISE:SPECIFIC': /크루아상|라떼|케이크|빵|커피|메뉴|바삭|고소|분위기|자리/,
  'REPLY_PRAISE:REVISIT': /또 |다시|들러|방문|오세요|와 주세요|오시면/, 'REPLY_PRAISE:CLEAN': /^(?![\s\S]*(팔로우|이벤트 참여|!!!))/,
  'REPLY_COMPLAINT:EMPATHY': /불편|속상|실망|답답|기다리|아쉬/, 'REPLY_COMPLAINT:APOLOGY': /죄송|사과/,
  'REPLY_COMPLAINT:FIX': /확인하|바꾸|개선|안내|준비하|하겠|할게|드리겠|챙기/, 'REPLY_COMPLAINT:REVISIT': /다음|또 |다시|오시면|방문/,
  'REPLY_COMPLAINT:CALM': /^(?![\s\S]*(그런데|원래|다른 손님|어쩔 수|저희 탓))/,
};
function rubricGrade(code: string, text: string) {
  const criteria = (content.rubrics as Record<string, { key: string; label: string; good: string; fix: string }[]>)[code] ?? [];
  const t = text.trim();
  const checks = criteria.map((c) => ({ key: c.key, label: c.label, ok: t.length >= 8 && !!PATTERNS[`${code}:${c.key}`]?.test(t) }));
  const score = checks.length ? Math.round((100 * checks.filter((c) => c.ok).length) / checks.length) : 0;
  const good = criteria.find((_, i) => checks[i].ok)?.good ?? '끝까지 써 보셨어요. 그게 시작이에요.';
  const fix = criteria.find((_, i) => !checks[i].ok)?.fix ?? null;
  return { score, pass: score >= 70, checks, good, fix, errorTypes: [] as string[] };
}

const pick = (skills: string[], max: number, n: number) =>
  ITEMS.filter((i) => skills.includes(i.skillCode) && i.initDifficulty <= max).slice(0, n).map(publicItem);

const readings = () => (state.dayOffset >= 21 ? WEEK4_READINGS : DEMO_READINGS);

type Handler = (m: RegExpMatchArray, body: unknown) => unknown;
const routes: [string, RegExp, Handler][] = [
  // ───────── 공통·시작 (박민하) ─────────
  ['POST', /^\/auth\/(login|signup)$/, () => ({ accessToken: 'mock-token', userId: 2 })],
  ['GET', /^\/me$/, () => ({
    id: 2, email: 'owner@maco.app', nickname: state.mode === 'LEARNING' ? '예비 창업자' : '부평 무화과 카페', mode: state.mode,
    storeType: 'CAFE', dailyGoalXp: state.goalXp, habitCue: '마감 정리 후',
    region: { id: 6, sido: '인천광역시', sigungu: '부평구', code: '28237' }, rankingVisibility: 'PUBLIC',
    leagueEnabled: true, placementDone: true, demo: true, today: today(),
  })],
  ['PATCH', /^\/me\/settings$/, (_m, b) => {
    const req = b as { mode?: 'LEARNING' | 'STORE'; dailyGoalXp?: number };
    if (req.mode) state.mode = req.mode;
    if (req.dailyGoalXp) state.goalXp = req.dailyGoalXp;
    return route('GET', '/me');
  }],
  ['GET', /^\/me\/status$/, () => ({
    today: today(), todayXp: state.todayXp, goalXp: state.goalXp, goalAchieved: state.todayXp >= state.goalXp,
    streakDays: state.streak, trainingSeconds: 0, solvedCount: 0, needsRestart: false,
  })],
  ['POST', /^\/streak\/busy-review$/, () => route('GET', '/me/status')],
  ['GET', /^\/regions/, () => [
    { id: 6, sido: '인천광역시', sigungu: '부평구', code: '28237' },
    { id: 5, sido: '인천광역시', sigungu: '남동구', code: '28200' },
    { id: 11, sido: '서울특별시', sigungu: '마포구', code: '11440' },
  ]],
  ['POST', /^\/attempts$/, (_m, b) => {
    const req = b as AttemptRequest;
    const item = ITEMS.find((i) => i.id === req.itemId);
    if (!item) throw new Error('ITEM_NOT_FOUND');
    return grade(item, req);
  }],
  ['POST', /^\/items\/(\d+)\/explain$/, (m, b) => {
    const item = ITEMS.find((i) => i.id === Number(m[1]))!;
    const err = item.errors[((b as { answer?: string }).answer ?? '').toUpperCase()] ?? Object.values(item.errors)[0];
    const e = (content.errorTypes as Record<string, { name: string; fixTip: string }>)[err];
    return { text: `이 문제는 "${e?.name ?? '핵심'}"을(를) 보는 문제예요. ${item.explanation}${e ? ` 기억할 한 가지: ${e.fixTip}` : ''}`, source: 'FALLBACK' };
  }],

  // ───────── 📚 트레이닝 (주승준) ─────────
  ['GET', /^\/placement$/, () => ({ items: pick(['PHOTO', 'REVIEW'], 5, 10) })],
  ['POST', /^\/placement\/submit$/, () => ({ levels: { PHOTO: 2, REVIEW: 1 }, correctCount: 6, totalCount: 10 })],
  ['GET', /^\/training\/path$/, () => ({
    units: content.skills.map((s) => ({
      skillCode: s.code, name: s.name, gate: s.gate, ready: s.ready, skillLevel: 1,
      nodes: content.lessons.filter((l) => l.skillCode === s.code).map((l, i) => ({
        lessonId: l.id, level: l.level, title: l.title, status: i === 0 ? 'OPEN' : 'LOCKED', bestAccuracy: null,
      })),
    })),
  })],
  ['GET', /^\/training\/today$/, () => ({ lessonId: 1, title: content.lessons[0].title, reason: '처음 시작하는 레슨이에요', reviewDueCount: 0, weakErrorTypes: [] })],
  ['POST', /^\/lessons\/(\d+)\/sessions$/, (m) => {
    const lesson = content.lessons.find((l) => l.id === Number(m[1]))!;
    return {
      sessionId: 1, lesson,
      conceptCard: content.conceptCards.find((c) => c.id === lesson.conceptCardId) ?? null,
      items: pick([lesson.skillCode], lesson.level, lesson.itemCount),
    };
  }],
  ['POST', /^\/lessons\/sessions\/(\d+)\/finish$/, (_m, b) => {
    const r = b as { correctCount: number; totalCount: number };
    return { accuracy: r.totalCount ? Math.round((100 * r.correctCount) / r.totalCount) : 0, xp: xp(XP.lesson), weakReport: null };
  }],
  ['POST', /^\/rewrite\/grade$/, (_m, b) => {
    const r = b as { itemId: number; text: string };
    const item = ITEMS.find((i) => i.id === r.itemId)!;
    return { feedback: rubricGrade(item.rubricCode ?? '', r.text), source: 'FALLBACK', sampleAnswer: item.sampleAnswer };
  }],

  // ───────── 📝 시험 (이동성) ─────────
  ['GET', /^\/exam\/home$/, () => ({ quizDoneToday: false, quizScore: null, wrongNoteCount: 2, todayScenario: content.scenario })],
  ['POST', /^\/quizzes\/daily$/, () => ({ quizId: 1, quizDate: today(), items: pick(['PHOTO', 'REVIEW'], 5, 40).filter((i) => i.type !== 'REWRITE').slice(0, 5) })],
  ['POST', /^\/quizzes\/(\d+)\/submit$/, (_m, b) => {
    const answers = (b as { answers: { itemId: number; answer?: string }[] }).answers;
    const results = answers.map((a) => grade(ITEMS.find((i) => i.id === a.itemId)!, { ...a, context: 'QUIZ' }));
    const correct = results.filter((r) => r.correct).length;
    const score = answers.length ? Math.round((100 * correct) / answers.length) : 0;
    const total = results.reduce((s, r) => s + r.xp.gained, 0) + (score === 100 ? XP.quizPerfect : 0);
    if (score === 100) xp(XP.quizPerfect);
    return { score, results, xp: { ...xp(0), gained: total } };
  }],
  ['GET', /^\/wrong-notes$/, () => ITEMS.slice(0, 2).map((i) => ({ item: publicItem(i), wrongCount: 1, nextReviewDate: today() }))],
  ['GET', /^\/roleplay\/scenarios$/, () => [content.scenario]],
  ['POST', /^\/roleplay\/sessions$/, () => {
    state.roleplay = [{ role: 'customer', text: content.scenario.openingLine }];
    return { sessionId: 1, scenario: content.scenario, turns: state.roleplay, finished: false, notice: '연습용 가상 상황이에요. 실제 손님이 아니에요.' };
  }],
  ['POST', /^\/roleplay\/sessions\/\d+\/turns$/, (_m, b) => {
    const text = (b as { text: string }).text;
    const n = state.roleplay.filter((t) => t.role === 'owner').length;
    state.roleplay.push({ role: 'owner', text });
    const script = [
      [/죄송|사과/, '사과해 주시니 마음이 좀 풀리네요. 그런데 다음에 가도 또 그럴까 봐 걱정돼요.', '음… 제 말을 제대로 들으신 건지 모르겠어요. 다음에 또 미지근하면 어떡하죠?'],
      [/확인|바꾸|개선|하겠|할게|드리겠/, '그렇게 해 주신다면 한 번 더 가 볼게요. 혹시 다음에 가면 말씀드리면 되나요?', '구체적으로 뭐가 달라지는지 잘 모르겠어요. 다른 가게를 가야 할지 고민돼요.'],
    ] as const;
    if (n >= 2) return { customerText: null, last: true, source: 'FALLBACK' };
    const [re, yes, no] = script[n];
    const reply = re.test(text) ? yes : no;
    state.roleplay.push({ role: 'customer', text: reply });
    return { customerText: reply, last: false, source: 'FALLBACK' };
  }],
  ['POST', /^\/roleplay\/sessions\/\d+\/finish$/, () => {
    const owner = state.roleplay.filter((t) => t.role === 'owner').map((t) => t.text);
    const g = rubricGrade('REPLY_COMPLAINT', owner.join(' '));
    const shortest = owner.reduce((a, t, i) => (t.length < owner[a].length ? i : a), 0);
    const crit = (content.rubrics as Record<string, { key: string; fix: string }[]>).REPLY_COMPLAINT;
    const lines = g.checks.filter((c) => !c.ok).slice(0, 3)
      .map((c) => ({ turn: shortest + 1, text: owner[shortest] ?? '', fix: crit.find((x) => x.key === c.key)?.fix ?? '' }));
    return { report: { score: g.score, checks: g.checks, good: g.good, lines }, source: 'FALLBACK', xp: xp(Math.round(g.score / 5)) };
  }],

  // ───────── 🏪 내 가게 (강민국) ─────────
  ['GET', /^\/stores\/search/, () => [
    { name: '부평 무화과 카페', category: '카페,디저트', address: '인천 부평구 부평동', roadAddress: '인천 부평구 부평대로 88', mapx: null, mapy: null, link: null, demo: true },
  ]],
  ['POST', /^\/stores$/, (_m, b) => ({ id: 1, name: (b as { name: string }).name, category: '카페,디저트', address: '인천 부평구 부평대로 88', practice: false })],
  ['GET', /^\/practice-stores$/, () => [{ id: 1, code: 'CAFE', storeType: 'CAFE', name: '연습 카페 마코' }]],
  ['GET', /^\/store\/home$/, () => ({
    store: state.mode === 'LEARNING'
      ? { id: null, name: '연습 카페 마코', category: '카페', address: null, practice: true }
      : { id: 1, name: '부평 무화과 카페', category: '카페,디저트', address: '인천 부평구 부평대로 88', practice: false },
    latest: gateCheck(readings(), today()), missions: route('GET', '/missions'), quest: { title: '이번 주 리뷰 요청 5번', done: 2, total: 5 },
  })],
  ['POST', /^\/captures$/, () => ({ captureId: 1, platform: 'PLACE', readings: readings(), source: 'RECORDED' })],
  ['PUT', /^\/captures\/\d+\/confirm$/, (_m, b) => gateCheck(b as Readings, today())],
  ['GET', /^\/gate-checks\/latest$/, () => gateCheck(readings(), today())],
  ['POST', /^\/spot-games$/, () => {
    const rows = placeRows(readings(), '부평 무화과 카페');
    return { gameId: 1, rows: rows.map(({ key, label, sub }) => ({ key, label, sub })), toFind: rows.filter((r) => r.rule).length, foundKeys: [...state.found] };
  }],
  ['POST', /^\/spot-games\/\d+\/taps$/, (_m, b) => {
    const key = (b as { key: string }).key;
    const rows = placeRows(readings(), '');
    const row = rows.find((r) => r.key === key);
    const toFind = rows.filter((r) => r.rule).length;
    if (!row?.rule) return { found: false, card: '여긴 괜찮아요', tip: null, foundCount: state.found.size, toFind, xp: xp(0) };
    const first = !state.found.has(key);
    state.found.add(key);
    return { found: true, card: row.card, tip: row.tip, foundCount: state.found.size, toFind, xp: xp(first ? XP.spot : 0) };
  }],
  ['GET', /^\/missions$/, () => [
    { id: 1, code: 'M-PHOTO', skillCode: 'PHOTO', gate: 'FIND', title: '대표 메뉴 사진 다시 찍기', description: '배운 대로 밝고 선명하게, 주인공 하나만 크게 찍어 올려요. 마코가 밝기와 선명도를 채점해요.', unlockLevel: 2, submitType: 'PHOTO', unlocked: true, passed: false },
    { id: 2, code: 'M-REPLY', skillCode: 'REVIEW', gate: 'TRUST', title: '최근 리뷰에 답글 달기', description: '공감 → 사과 → 개선 → 다시 오기 순서로 직접 답글을 써요. 마코는 대신 써 주지 않고 첨삭만 해요.', unlockLevel: 2, submitType: 'TEXT', unlocked: true, passed: false },
  ]],
  ['POST', /^\/missions\/(\d+)\/submissions$/, (m, b) => {
    const text = b instanceof FormData ? String(b.get('text') ?? '') : '';
    const feedback = m[1] === '2'
      ? rubricGrade('REPLY_COMPLAINT', text)
      : { score: 100, pass: true, checks: [{ key: 'BRIGHT', label: '밝기', ok: true }, { key: 'SHARP', label: '선명도', ok: true }], good: '밝기와 선명도가 모두 좋아요.', fix: null, errorTypes: [] };
    return { feedback, source: 'FALLBACK', xp: xp(feedback.pass ? XP.mission : 0) };
  }],
  ['POST', /^\/review-cards$/, () => ({ id: 1, storeName: '부평 무화과 카페', message: '오늘 방문 어떠셨어요? 솔직한 리뷰 한 줄이 저희에게 큰 힘이 돼요.', qrTargetUrl: 'https://map.naver.com', requestsToday: state.requests, requestsTotal: state.requests })],
  ['GET', /^\/review-cards\/\d+$/, () => route('POST', '/review-cards')],
  ['POST', /^\/review-requests$/, () => { state.requests += 1; return route('POST', '/review-cards'); }],
  ['GET', /^\/ad-gate$/, () => {
    const g = gateCheck(readings(), today());
    return { locked: !g.scores.adUnlocked, reason: g.scores.adUnlocked ? null : '믿게 관문을 통과하면 열려요', scores: g.scores, experiment: null };
  }],

  // ───────── 🏆 랭킹·👤 내 정보·🎬 시연 (박민하) ─────────
  ['GET', /^\/league\/current$/, () => leagueRows(state.todayXp, '부평 무화과 카페', state.dayOffset)],
  ['GET', /^\/rankings\/region$/, () => rankRegion('부평구', state.dayOffset >= 21 ? 1650 : state.todayXp, '부평 무화과 카페')],
  ['GET', /^\/me\/stats$/, () => ({ todayXp: state.todayXp, weekXp: 320, totalXp: 980, trainingMinutesWeek: 52, solvedWeek: 64, accuracy: 72, streakDays: state.streak, bestStreak: 5 })],
  ['GET', /^\/me\/report/, () => ({
    weeks: [0, 1, 2, 3].map((i) => ({
      weekStart: `W${i + 1}`, avgTheta: -0.6 + i * (state.dayOffset >= 21 ? 0.45 : 0.1),
      findScore: 70 + (state.dayOffset >= 21 ? i * 10 : 0), trustScore: 62 + (state.dayOffset >= 21 ? i * 12 : 0), notifyScore: i * 8, xp: 300 + i * 40,
    })),
  })],
  ['GET', /^\/me\/skills$/, () => content.skills.map((s) => ({ skillCode: s.code, name: s.name, level: s.ready ? 2 : 1, theta: s.ready ? -0.4 : -1, ready: s.ready }))],
  ['GET', /^\/me\/badges$/, () => [{ code: 'STREAK_7', name: '7일 연속', earned: false }, { code: 'FIRST_MISSION', name: '첫 실전 미션', earned: false }]],
  ['POST', /^\/demo\/skip-days$/, (_m, b) => {
    const days = (b as { days: number }).days;
    state.dayOffset += days;
    state.streak += days;
    return { dayOffset: state.dayOffset, today: today() };
  }],
  ['POST', /^\/demo\/reset$/, () => {
    state.dayOffset = 0; state.streak = 3; state.todayXp = 0; state.found.clear(); state.requests = 0;
    return { dayOffset: 0, today: today() };
  }],
];

function route(method: string, path: string, body?: unknown): unknown {
  const clean = path.split('?')[0];
  for (const [m, re, handler] of routes) {
    const match = clean.match(re);
    if (m === method && match) return handler(match, body);
  }
  throw new Error(`목업에 없는 주소: ${method} ${path}`);
}

export async function mockApi<T>(method: string, path: string, body?: unknown): Promise<T> {
  await new Promise((r) => setTimeout(r, 150)); // 로딩 상태가 보이게
  return route(method, path, body) as T;
}

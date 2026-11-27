// 마코 core logic: diagnosis questions, analysis (diagnosis → prescription),
// weekly results and re-prescription. Pure functions only, so the same
// answers always give the same result (easy to verify for the paper).

export type Answers = (number | null)[];

export type Question = {
  q: string; // title, "\n" = line break
  hint: string;
  grid?: boolean;
  options: { label: string; sub?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    q: '어떤 가게를\n하고 계세요?',
    hint: '정답은 없어요. 편하게 골라 주세요.',
    grid: true,
    options: [
      { label: '카페·디저트' }, { label: '음식점' }, { label: '미용·뷰티' },
      { label: '꽃집·소품' }, { label: '공방·클래스' }, { label: '온라인 쇼핑몰' },
    ],
  },
  {
    q: '요즘 SNS 홍보는\n얼마나 하세요?',
    hint: '안 해도 괜찮아요. 시작점을 알려는 거예요.',
    options: [
      { label: '거의 안 해요', sub: '계정만 있거나 아직 없어요' },
      { label: '생각날 때 가끔', sub: '한 달에 몇 번' },
      { label: '일주일에 1~2번' },
      { label: '거의 매일' },
    ],
  },
  {
    q: '손님을 주로\n어디서 만나세요?',
    hint: '가장 많이 쓰는 곳 하나만 골라 주세요.',
    options: [
      { label: '인스타그램' }, { label: '네이버 플레이스·블로그' },
      { label: '스마트스토어 같은 쇼핑몰' }, { label: '당근 같은 동네 커뮤니티' },
    ],
  },
  {
    q: '홍보에 일주일 동안\n얼마나 쓸 수 있으세요?',
    hint: '바쁜 주를 기준으로 생각해 주세요.',
    options: [{ label: '1시간이 안 돼요' }, { label: '1~3시간' }, { label: '3~5시간' }, { label: '5시간 이상' }],
  },
  {
    q: '직접 만들어 본 적\n있는 건 뭐예요?',
    hint: '해 본 것 중 가장 자신 있는 하나요.',
    options: [{ label: '아직 없어요' }, { label: '사진 게시물' }, { label: '짧은 영상', sub: '릴스, 쇼츠' }, { label: '블로그 글' }],
  },
  {
    q: '홍보할 때 제일\n막히는 건 뭐예요?',
    hint: '마코가 이 부분부터 도와드릴게요.',
    options: [
      { label: '뭘 올려야 할지 모르겠어요' }, { label: '사진·영상 찍기가 부담돼요' },
      { label: '시간이 안 나요' }, { label: '효과가 있는지 모르겠어요' },
    ],
  },
];

export const DEFAULT_ANSWERS = [0, 1, 0, 1, 1, 0];
export const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'] as const;
export type DayName = (typeof DAY_NAMES)[number];

export type Track = '매장형' | '온라인 셀러' | '1인 브랜드';
export type Task = { day: DayName; title: string; purpose: string; slot: string; minutes: number };

export type Analysis = {
  track: Track;
  level: 0 | 1 | 2;
  levelName: '입문' | '기초' | '성장';
  tasksPerWeek: number;
  channel: string;
  noun: string;
  kind: string;
  barrier: { label: string; fix: string };
  hours: string;
  allTasks: Omit<Task, 'day'>[];
};

const pick = (a: Answers, i: number) => a[i] ?? DEFAULT_ANSWERS[i];

const DAYS_BY_COUNT: Record<number, DayName[]> = {
  2: ['화', '금'],
  3: ['화', '목', '토'],
  4: ['월', '수', '금', '일'],
};

export function analyze(answers: Answers): Analysis {
  const biz = pick(answers, 0), habit = pick(answers, 1), ch = pick(answers, 2);
  const hrs = pick(answers, 3), made = pick(answers, 4), bar = pick(answers, 5);

  const track: Track = ch === 2 || biz === 5 ? '온라인 셀러' : biz === 4 ? '1인 브랜드' : '매장형';
  const score = habit + (made > 0 ? 1 : 0);
  const level = (score <= 1 ? 0 : score <= 3 ? 1 : 2) as 0 | 1 | 2;
  const noun = ['메뉴', '메뉴', '시술', '상품', '작품', '상품'][biz];
  const kind = bar === 1 || made === 0 ? '사진 게시물' : made === 2 ? '짧은 영상' : made === 3 ? '블로그 글' : '사진 게시물';

  const barriers = [
    { label: '뭘 올려야 할지 모르겠어요', fix: '올릴 주제는 마코가 요일마다 정해 드려요. 사장님은 찍기만 하면 돼요.' },
    { label: '사진·영상 찍기가 부담돼요', fix: '영상은 잠시 미루고, 휴대폰 사진 1장 게시물부터 시작해요.' },
    { label: '시간이 안 나요', fix: '한 번에 15분 안에 끝나는 과제만 드려요. 바쁜 날은 3분짜리로 바꿀 수 있어요.' },
    { label: '효과가 있는지 모르겠어요', fix: '매주 리포트에서 먼저 "얼마나 꾸준했는지"를 보여 드려요. 손님 반응은 추세로 함께 봐요.' },
  ];

  const sets: Record<Track, Omit<Task, 'day'>[]> = {
    '매장형': [
      { title: `오늘의 대표 ${noun} 사진 1장 올리기`, purpose: `지나가는 손님에게 오늘의 ${noun} 알리기`, slot: '오전', minutes: 10 },
      { title: '오픈 준비하는 모습 사진 올리기', purpose: '가게가 문 열었다는 걸 알리기', slot: '오전', minutes: 10 },
      { title: `손님이 많이 찾는 ${noun} 소개 글 쓰기`, purpose: '처음 오는 손님이 고르기 쉽게 하기', slot: '오후', minutes: 15 },
      { title: '다음 주 소식 한 줄 공지', purpose: '단골에게 다음 주 일정 알리기', slot: '마감 후', minutes: 5 },
    ],
    '온라인 셀러': [
      { title: '대표 상품 사진 게시물 올리기', purpose: '가장 잘 팔리는 상품을 한 번 더 보여 주기', slot: '오전', minutes: 15 },
      { title: '새 상품 사진 게시물 올리기', purpose: '새로 들어온 상품 알리기', slot: '오전', minutes: 15 },
      { title: '상품 쓰는 모습 사진 올리기', purpose: '실제로 쓰면 어떤지 보여 주기', slot: '오전', minutes: 15 },
      { title: '구매 후기 하나 소개하기', purpose: '살지 고민하는 손님 안심시키기', slot: '저녁', minutes: 10 },
    ],
    '1인 브랜드': [
      { title: '작업하는 과정 사진 올리기', purpose: '만드는 사람의 정성 보여 주기', slot: '오전', minutes: 10 },
      { title: `완성한 ${noun} 소개 글 쓰기`, purpose: `${noun}을 갖고 싶게 하기`, slot: '오후', minutes: 15 },
      { title: '수업·작업 후기 공유하기', purpose: '신청을 고민하는 사람 안심시키기', slot: '저녁', minutes: 10 },
      { title: '다음 주 일정 한 줄 공지', purpose: '다음 일정 미리 알리기', slot: '저녁', minutes: 5 },
    ],
  };

  return {
    track,
    level,
    levelName: (['입문', '기초', '성장'] as const)[level],
    tasksPerWeek: [2, 3, 3, 4][hrs],
    channel: ['인스타그램', '네이버 플레이스', '스마트스토어', '당근'][ch],
    noun,
    kind,
    barrier: barriers[bar],
    hours: ['주 1시간 미만', '주 1~3시간', '주 3~5시간', '주 5시간 이상'][hrs],
    allTasks: sets[track],
  };
}

/** Diagnosis question 7: times that are hard for the owner. Cell = day × 3 + slot. */
export const SLOT_NAMES = ['오전', '오후', '저녁'] as const;
export const BUSY_QUESTION = {
  q: '할 일 하기 어려운\n시간을 모두 골라 주세요',
  hint: '가게가 붐비거나 개인 일정이 있는 시간이요. 없으면 넘어가도 돼요.',
};
const SLOT_OF: Record<string, number> = { '오전': 0, '오후': 1, '저녁': 2, '마감 후': 2 };
export const slotIndex = (slot: string) => SLOT_OF[slot] ?? 0;
export const busyCellOf = (day: number, slot: number) => day * SLOT_NAMES.length + slot;

/**
 * Move tasks off the times the owner marked busy: first another time the same day,
 * else the nearest free day. A task with nowhere free stays where it was.
 */
export function avoidBusy(plan: Task[], busy: number[]): Task[] {
  if (!busy.length) return plan;
  const isBusy = (d: number, s: number) => busy.includes(busyCellOf(d, s));
  const freeSlot = (d: number, prefer: number) => [prefer, 0, 1, 2].find((s) => !isBusy(d, s));
  const out: Task[] = [];
  plan.forEach((t, i) => {
    const d = DAY_NAMES.indexOf(t.day), s = slotIndex(t.slot);
    const taken = new Set([...out.map((x) => x.day), ...plan.slice(i + 1).map((x) => x.day)]);
    const relabel = (day: number, slot: number): Task => ({
      ...t, day: DAY_NAMES[day], slot: slot === s ? t.slot : SLOT_NAMES[slot],
    });
    if (!isBusy(d, s)) { out.push(t); return; }
    const same = freeSlot(d, s);
    if (same !== undefined) { out.push(relabel(d, same)); return; }
    for (const k of [1, -1, 2, -2, 3, -3]) {
      const nd = d + k;
      if (nd < 0 || nd > 6 || taken.has(DAY_NAMES[nd])) continue;
      const ns = freeSlot(nd, s);
      if (ns !== undefined) { out.push(relabel(nd, ns)); return; }
    }
    out.push(t);
  });
  return out.sort((x, y) => DAY_NAMES.indexOf(x.day) - DAY_NAMES.indexOf(y.day));
}

/**
 * Weekly plan: n tasks on fixed days, moved off the owner's busy times.
 * `easeDay` turns that day's task into a 5-minute version.
 */
export function buildPlan(a: Analysis, n: number, easeDay?: DayName | null, busy: number[] = []): Task[] {
  const days = DAYS_BY_COUNT[Math.min(4, Math.max(2, n))];
  const base = days.map((day, i) => ({ day, ...a.allTasks[i] }));
  return avoidBusy(base, busy).map((t) =>
    t.day === easeDay ? { ...t, title: `5분 버전 · ${t.title}`, minutes: 5 } : t);
}

export type DayRecord = { status: 'done' | 'rest'; minutes?: number; likes?: number; inquiries?: number; reason?: string };

export type WeekRow = Task & { date: string; record?: DayRecord; past: boolean; isToday: boolean };

/** Monday-based week dates (local time) as YYYY-MM-DD. */
export function weekDates(now: Date): string[] {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  });
}

export const dayIndex = (now: Date) => (now.getDay() + 6) % 7;

export function weekRows(plan: Task[], records: Record<string, DayRecord>, now: Date): WeekRow[] {
  const dates = weekDates(now), ti = dayIndex(now);
  return plan.map((t) => {
    const i = DAY_NAMES.indexOf(t.day);
    return { ...t, date: dates[i], record: records[dates[i]], past: i < ti, isToday: i === ti };
  });
}

export type Recommendation = { rate: number; done: number; due: number; k: 0 | 1 | 2; options: [number, number, number]; n: number };

/**
 * Re-prescription (paper stage 6). Uses only behaviour (tasks done), never
 * customer reactions. Thresholds are provisional: ≥80% up, 50–79% keep, <50% down.
 */
export function recommend(rows: WeekRow[], current: number): Recommendation {
  const done = rows.filter((r) => r.record?.status === 'done').length;
  const due = rows.length;
  const rate = due ? Math.round((done / due) * 100) : 0;
  const k = (rate >= 80 ? 0 : rate >= 50 ? 1 : 2) as 0 | 1 | 2;
  const options: [number, number, number] = [Math.min(4, current + 1), current, Math.max(2, current - 1)];
  return { rate, done, due, k, options, n: options[k] };
}

export function captions(noun: string): string[] {
  return [
    `오늘의 대표 ${noun} 준비됐어요. 천천히 들러 주세요.`,
    `오늘의 대표 ${noun}, 지금 만나 보세요.`,
    `제일 자신 있는 ${noun}예요! 오늘도 정성껏 준비했어요 :)`,
  ];
}

export function hashtags(answers: Answers, noun: string): string {
  const biz = QUESTIONS[0].options[pick(answers, 0)].label.split('·')[0].replace(/\s/g, '');
  return `#${biz} #오늘의${noun} #동네가게`;
}

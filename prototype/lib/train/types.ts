// 마코 트레이닝 엔진의 공통 타입. 기획서 10장 데이터 테이블(item, user_skill, attempt …)과 이름을 맞췄어요.

export type SkillId = 'info' | 'photo' | 'review' | 'copy' | 'promo' | 'ads';
export type Gate = '찾게' | '믿게' | '알리게';
export type Level = 1 | 3 | 5;

/** 오류 유형 사전: 어디서 틀리든 같은 이름으로 약점이 모여요 (기획서 8-3). */
export type ErrorType =
  | 'photo-light' | 'photo-blur' | 'photo-filter' | 'photo-hero' | 'photo-clutter' | 'photo-crop' | 'photo-order'
  | 'reply-priority' | 'reply-late' | 'reply-incentive' | 'reply-template' | 'reply-promo' | 'reply-private'
  | 'reply-empathy' | 'reply-apology' | 'reply-fix' | 'reply-revisit' | 'reply-defensive';

/** 화면에 그리는 가짜 사진. 실제 사진 대신 같은 그림에 밝기·흔들림·구도만 바꿔요. */
export type Photo = {
  s: 'latte' | 'cake' | 'bread' | 'shop' | 'menu' | 'receipt';
  light?: 'ok' | 'dark' | 'over';
  blur?: boolean;
  size?: 'big' | 'small';
  clutter?: boolean;
  crop?: boolean;
  filter?: boolean;
  tilt?: number;
  label?: string;
};

type Base = {
  id: string;
  skill: SkillId;
  level: Level;
  /** 틀렸을 때 기록할 오류 유형 */
  err: ErrorType;
  /** 정답 이유 한 줄 */
  why: string;
};

/** 둘 중 고르기 (선호형·규칙형) */
export type Pick2 = Base & { t: 'pick2'; q: string; a: [Choice, Choice]; ans: 0 | 1 };
export type Choice = { text?: string; photo?: Photo };

/** 상황 판단 (규칙형) */
export type Judge = Base & { t: 'judge'; q: string; o: string[]; ans: number };

/** 틀린 곳 찾기: 화면 조각 중 문제 있는 곳을 모두 탭 */
export type Spot = Base & {
  t: 'spot'; q: string;
  view: 'grid' | 'reviews' | 'reply';
  parts: { id: string; text?: string; photo?: Photo; stars?: number; bad: boolean; note: string }[];
};

/** 고쳐 쓰기: 직접 쓰면 항목별로 채점 (시연은 규칙 채점, 나중에 AI 어댑터) */
export type Rewrite = Base & { t: 'rewrite'; q: string; context: string; rubric: RubricId; sample: string };
export type RubricId = 'praise' | 'complaint';

export type Item = Pick2 | Judge | Spot | Rewrite;

export type Unit = {
  skill: SkillId;
  no: number;
  title: string;
  gate: Gate;
  /** 레벨별 "할 수 있다" 문장 (기획서 5장) */
  can: Record<Level, string>;
  /** MVP에서 문제가 있는 유닛 */
  ready: boolean;
};

export type Concept = { skill: SkillId; level: Level; title: string; body: string; source: string };

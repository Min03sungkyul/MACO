/**
 * 여러 탭이 같이 쓰는 서버 응답 타입 (담당: 박민하). 이름은 서버 DTO·docs/03과 같다.
 * 서버: com.maco.xp.dto.XpResult, com.maco.content.dto.*, com.maco.skill.dto.*, com.maco.ai.dto.*
 */

export type XpResult = {
  gained: number;
  todayXp: number;
  goalXp: number;
  goalAchievedNow: boolean;
  streakDays: number;
  levelUps: { skill: string; from: number; to: number }[];
};

export type AiSource = 'LIVE' | 'CACHE' | 'RECORDED' | 'FALLBACK';

export type ItemType = 'CHOICE2' | 'JUDGE' | 'SPOT' | 'REWRITE';

/** image가 "photo:s=latte;light=dark"면 PhotoMock이 그림으로 그린다 */
export type Choice = { key: string; text: string | null; image: string | null };

export type Hotspot = {
  partKey: string;
  label: string | null;
  stars: number | null;
  x: number | null;
  y: number | null;
  w: number | null;
  h: number | null;
};

/** 화면에 보내는 문제 (정답 없음) */
export type Item = {
  id: number;
  code: string;
  skillCode: string;
  type: ItemType;
  prompt: string;
  context: string | null;
  media: string | null;
  choices: Choice[];
  hotspots: Hotspot[];
  rubricCode: string | null;
  conceptCardId: number | null;
  initDifficulty: number;
};

export type ConceptCard = {
  id: number;
  skillCode: string;
  level: number;
  title: string;
  body: string;
  evidence: string | null;
  image: string | null;
};

export type AttemptContext = 'PLACEMENT' | 'LESSON' | 'QUIZ' | 'WRONG_NOTE' | 'UNIT_TEST';

export type AttemptRequest = {
  itemId: number;
  answer?: string;
  answerText?: string;
  context: AttemptContext;
  sessionId?: number | null;
  elapsedMs?: number;
  score?: number;
};

export type AttemptResult = {
  correct: boolean;
  answer: string | null;
  errorType: string | null;
  explanation: string;
  principleCardId: number | null;
  weakNote: string | null;
  xp: XpResult;
};

export type GradeOutput = {
  score: number;
  pass: boolean;
  checks: { key: string; label: string; ok: boolean }[];
  good: string;
  fix: string | null;
  errorTypes: string[];
};

export type ExplainResponse = { text: string; source: AiSource };

/** GET /me/status — 상단 바 */
export type Status = {
  today: string;
  todayXp: number;
  goalXp: number;
  goalAchieved: boolean;
  streakDays: number;
  trainingSeconds: number;
  solvedCount: number;
  needsRestart: boolean;
};

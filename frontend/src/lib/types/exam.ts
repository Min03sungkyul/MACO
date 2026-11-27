/** 📝 시험 (담당: 이동성). 서버: com.maco.exam.dto.ExamDtos */
import type { AiSource, AttemptResult, Item, XpResult } from './common';

export type Scenario = {
  id: number;
  code: string;
  skillCode: string;
  title: string;
  persona: string;
  openingLine: string;
  maxTurns: number;
  rubricCode: string;
};

export type ExamHome = { quizDoneToday: boolean; quizScore: number | null; wrongNoteCount: number; todayScenario: Scenario | null };

export type QuizResponse = { quizId: number | null; quizDate: string; items: Item[] };
export type QuizAnswer = { itemId: number; answer?: string };
export type QuizResult = { score: number; results: AttemptResult[]; xp: XpResult };

export type WrongNote = { item: Item; wrongCount: number; nextReviewDate: string };

export type RoleplayTurn = { role: 'customer' | 'owner'; text: string };
export type RoleplaySession = { sessionId: number; scenario: Scenario; turns: RoleplayTurn[]; finished: boolean; notice: string };
export type RoleplayTurnResponse = { customerText: string | null; last: boolean; source: AiSource };

export type RoleplayReport = {
  score: number;
  checks: { key: string; label: string; ok: boolean }[];
  good: string;
  lines: { turn: number; text: string; fix: string }[];
};
export type RoleplayFinishResponse = { report: RoleplayReport; source: AiSource; xp: XpResult };

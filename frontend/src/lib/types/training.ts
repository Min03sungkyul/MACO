/** 📚 트레이닝 (담당: 주승준). 서버: com.maco.training.dto.TrainingDtos */
import type { AiSource, ConceptCard, GradeOutput, Item, XpResult } from './common';

export type NodeStatus = 'LOCKED' | 'OPEN' | 'DONE';

export type PathNode = { lessonId: number; level: number; title: string; status: NodeStatus; bestAccuracy: number | null };
export type PathUnit = { skillCode: string; name: string; gate: string; ready: boolean; skillLevel: number; nodes: PathNode[] };
export type PathResponse = { units: PathUnit[] };

export type TodayResponse = { lessonId: number; title: string; reason: string; reviewDueCount: number; weakErrorTypes: string[] };

export type Lesson = { id: number; skillCode: string; level: number; seq: number; title: string; conceptCardId: number | null; itemCount: number };

export type SessionResponse = { sessionId: number | null; lesson: Lesson; conceptCard: ConceptCard | null; items: Item[] };

export type FinishRequest = { lessonId: number; correctCount: number; totalCount: number };
export type FinishResponse = { accuracy: number; xp: XpResult; weakReport: string | null };

export type RewriteGradeResponse = { feedback: GradeOutput; source: AiSource; sampleAnswer: string | null };

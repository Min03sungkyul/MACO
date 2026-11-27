/** 📝 시험 호출 (담당: 이동성) */
import { useQuery } from '@tanstack/react-query';
import type {
  ExamHome, QuizAnswer, QuizResponse, QuizResult, RoleplayFinishResponse, RoleplaySession, RoleplayTurnResponse, Scenario, WrongNote,
} from '../types/exam';
import { api } from './client';

export const getExamHome = () => api<ExamHome>('/exam/home');
export const createDailyQuiz = () => api<QuizResponse>('/quizzes/daily', { method: 'POST' });
export const submitQuiz = (quizId: number | null, answers: QuizAnswer[]) =>
  api<QuizResult>(`/quizzes/${quizId ?? 0}/submit`, { body: { answers } });
export const getWrongNotes = () => api<WrongNote[]>('/wrong-notes');
export const getScenarios = () => api<Scenario[]>('/roleplay/scenarios');
export const startRoleplay = (scenarioId: number) => api<RoleplaySession>('/roleplay/sessions', { body: { scenarioId } });
export const sendRoleplayTurn = (sessionId: number, text: string) =>
  api<RoleplayTurnResponse>(`/roleplay/sessions/${sessionId}/turns`, { body: { text } });
export const finishRoleplay = (sessionId: number) =>
  api<RoleplayFinishResponse>(`/roleplay/sessions/${sessionId}/finish`, { method: 'POST' });

export const useExamHome = () => useQuery({ queryKey: ['exam', 'home'], queryFn: getExamHome });
export const useWrongNotes = () => useQuery({ queryKey: ['exam', 'wrong-notes'], queryFn: getWrongNotes });

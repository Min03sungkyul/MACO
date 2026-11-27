/** 📚 트레이닝 + 배치 테스트 호출 (담당: 주승준) */
import { useQuery } from '@tanstack/react-query';
import type { PlacementResponse, PlacementResult } from '../types/start';
import type { FinishRequest, FinishResponse, PathResponse, RewriteGradeResponse, SessionResponse, TodayResponse } from '../types/training';
import { api } from './client';

export const getPath = () => api<PathResponse>('/training/path');
export const getToday = () => api<TodayResponse>('/training/today');
export const startLesson = (lessonId: number) => api<SessionResponse>(`/lessons/${lessonId}/sessions`, { method: 'POST' });
export const finishLesson = (sessionId: number | null, req: FinishRequest) =>
  api<FinishResponse>(`/lessons/sessions/${sessionId ?? 0}/finish`, { body: req });
export const gradeRewrite = (itemId: number, text: string) => api<RewriteGradeResponse>('/rewrite/grade', { body: { itemId, text } });
export const getPlacement = () => api<PlacementResponse>('/placement');
export const submitPlacement = (answers: { itemId: number; answer?: string }[]) =>
  api<PlacementResult>('/placement/submit', { body: { answers } });

export const usePath = () => useQuery({ queryKey: ['training', 'path'], queryFn: getPath });
export const useToday = () => useQuery({ queryKey: ['training', 'today'], queryFn: getToday });
export const usePlacement = () => useQuery({ queryKey: ['training', 'placement'], queryFn: getPlacement });

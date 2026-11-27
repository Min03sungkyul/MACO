/** 공통·시작 호출 (담당: 박민하). docs/03 "공통·시작" */
import { useQuery } from '@tanstack/react-query';
import type { AttemptRequest, AttemptResult, ExplainResponse, Status } from '../types/common';
import type { Me, Region, SettingsRequest, TokenResponse } from '../types/start';
import { api } from './client';

export const login = (email: string, password: string) =>
  api<TokenResponse>('/auth/login', { body: { email, password } });

export const signup = (email: string, password: string, nickname: string) =>
  api<TokenResponse>('/auth/signup', { body: { email, password, nickname } });

export const getMe = () => api<Me>('/me');
export const updateSettings = (req: SettingsRequest) => api<Me>('/me/settings', { method: 'PATCH', body: req });
export const getStatus = () => api<Status>('/me/status');
export const getRegions = (sido?: string) => api<Region[]>(`/regions${sido ? `?sido=${encodeURIComponent(sido)}` : ''}`);
export const recordAttempt = (req: AttemptRequest) => api<AttemptResult>('/attempts', { body: req });
export const explainWrong = (itemId: number, answer: string) =>
  api<ExplainResponse>(`/items/${itemId}/explain`, { body: { answer } });
export const keepStreakWithBusyReview = () => api<Status>('/streak/busy-review', { method: 'POST' });

export const queryKeys = {
  me: ['me'] as const,
  status: ['me', 'status'] as const,
};

export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: getMe });
export const useStatus = () => useQuery({ queryKey: queryKeys.status, queryFn: getStatus });
export const useRegions = () => useQuery({ queryKey: ['start', 'regions'], queryFn: () => getRegions() });

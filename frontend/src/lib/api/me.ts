/** 👤 내 정보·시연 도구 호출 (담당: 박민하) */
import { useQuery } from '@tanstack/react-query';
import type { Badge, DayResult, Report, SkillLevel, Stats } from '../types/me';
import { api } from './client';

export const getStats = () => api<Stats>('/me/stats');
export const getReport = (weeks = 4) => api<Report>(`/me/report?weeks=${weeks}`);
export const getSkills = () => api<SkillLevel[]>('/me/skills');
export const getBadges = () => api<Badge[]>('/me/badges');
export const skipDays = (days: number) => api<DayResult>('/demo/skip-days', { body: { days } });
export const resetDemo = () => api<DayResult>('/demo/reset', { method: 'POST' });

export const useStats = () => useQuery({ queryKey: ['me', 'stats'], queryFn: getStats });
export const useReport = () => useQuery({ queryKey: ['me', 'report'], queryFn: () => getReport(4) });
export const useSkills = () => useQuery({ queryKey: ['me', 'skills'], queryFn: getSkills });

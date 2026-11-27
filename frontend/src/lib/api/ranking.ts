/** 🏆 랭킹 호출 (담당: 박민하) */
import { useQuery } from '@tanstack/react-query';
import type { League, RegionRank } from '../types/ranking';
import { api } from './client';

export const getLeague = () => api<League>('/league/current');
export const getRegionRank = () => api<RegionRank>('/rankings/region');

export const useLeague = () => useQuery({ queryKey: ['ranking', 'league'], queryFn: getLeague });
export const useRegionRank = () => useQuery({ queryKey: ['ranking', 'region'], queryFn: getRegionRank });

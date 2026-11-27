/** 🏪 내 가게 / 연습 가게 호출 (담당: 강민국) */
import { useQuery } from '@tanstack/react-query';
import type {
  AdGate, CaptureReadResponse, GateCheck, Mission, MissionFeedback, PlaceSearchResult, PracticeStore, Readings, ReviewCard,
  SpotGame, SpotTapResult, StoreHome, StoreInfo,
} from '../types/store';
import { api } from './client';

export const searchPlaces = (query: string) => api<PlaceSearchResult[]>(`/stores/search?query=${encodeURIComponent(query)}`);
export const registerStore = (p: PlaceSearchResult) => api<StoreInfo>('/stores', { body: p });
export const getPracticeStores = () => api<PracticeStore[]>('/practice-stores');
export const getStoreHome = () => api<StoreHome>('/store/home');

export const uploadCapture = (file: File, platform: 'PLACE' | 'INSTA' = 'PLACE') => {
  const form = new FormData();
  form.append('file', file);
  return api<CaptureReadResponse>(`/captures?platform=${platform}`, { form });
};
export const confirmCapture = (captureId: number | null, readings: Readings) =>
  api<GateCheck>(`/captures/${captureId ?? 0}/confirm`, { method: 'PUT', body: readings });
export const getLatestGateCheck = () => api<GateCheck>('/gate-checks/latest');

export const startSpotGame = () => api<SpotGame>('/spot-games', { method: 'POST' });
export const tapSpot = (gameId: number | null, key: string) => api<SpotTapResult>(`/spot-games/${gameId ?? 0}/taps`, { body: { key } });

export const getMissions = () => api<Mission[]>('/missions');
export const submitMission = (missionId: number, input: { text?: string; file?: File }) => {
  const form = new FormData();
  if (input.text) form.append('text', input.text);
  if (input.file) form.append('file', input.file);
  return api<MissionFeedback>(`/missions/${missionId}/submissions`, { form });
};

export const createReviewCard = (message?: string) => api<ReviewCard>('/review-cards', { body: { message } });
export const addReviewRequest = () => api<ReviewCard>('/review-requests', { method: 'POST' });
export const getAdGate = () => api<AdGate>('/ad-gate');

export const useStoreHome = () => useQuery({ queryKey: ['store', 'home'], queryFn: getStoreHome });
export const useLatestGateCheck = () => useQuery({ queryKey: ['store', 'gate-check'], queryFn: getLatestGateCheck });
export const useMissions = () => useQuery({ queryKey: ['store', 'missions'], queryFn: getMissions });
export const useAdGate = () => useQuery({ queryKey: ['store', 'ad-gate'], queryFn: getAdGate });

/** 시작·로그인·내 설정 (담당: 박민하, 배치 테스트는 주승준). 서버: auth·user 패키지 */
import type { Item } from './common';

export type TokenResponse = { accessToken: string; userId: number };

export type UserMode = 'LEARNING' | 'STORE';
export type RankingVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export type Region = { id: number; sido: string; sigungu: string; code: string };

/** GET /me — today는 서버의 가상 날짜. 화면은 날짜를 직접 계산하지 않는다 */
export type Me = {
  id: number;
  email: string | null;
  nickname: string;
  mode: UserMode | null;
  storeType: string | null;
  dailyGoalXp: number;
  habitCue: string | null;
  region: Region | null;
  rankingVisibility: RankingVisibility;
  leagueEnabled: boolean;
  placementDone: boolean;
  demo: boolean;
  today: string;
};

export type SettingsRequest = Partial<{
  mode: UserMode;
  storeType: string;
  dailyGoalXp: number;
  habitCue: string;
  regionId: number;
  rankingVisibility: RankingVisibility;
  leagueEnabled: boolean;
}>;

export type PlacementResponse = { items: Item[] };
export type PlacementResult = { levels: Record<string, number>; correctCount: number; totalCount: number };

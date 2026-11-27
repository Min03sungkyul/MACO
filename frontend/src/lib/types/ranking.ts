/** 🏆 랭킹 (담당: 박민하). 서버: com.maco.ranking.dto.RankingDtos */
export type RankRow = { rank: number; name: string; xp: number; me: boolean };

export type League = {
  tier: number;
  tierName: string;
  weekStart: string;
  hoursLeft: number;
  promoteLine: number;
  demoteLine: number;
  myRank: number;
  xpToPromote: number;
  rows: RankRow[];
};

export type RegionRank = { region: string; rank: number; total: number; topPercent: number; top: RankRow[]; around: RankRow[] };

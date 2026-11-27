package com.maco.ranking.dto;

import java.time.LocalDate;
import java.util.List;

/** 🏆 랭킹 응답 (담당: 박민하). 프론트 타입: frontend/src/lib/types/ranking.ts */
public final class RankingDtos {

    private RankingDtos() {
    }

    public record RankRow(int rank, String name, int xp, boolean me) {
    }

    /** GET /league/current — S22 */
    public record League(int tier, String tierName, LocalDate weekStart, int hoursLeft, int promoteLine, int demoteLine,
                         int myRank, int xpToPromote, List<RankRow> rows) {
    }

    /** GET /rankings/region — S23 ("부평구 23위 / 412명") */
    public record RegionRank(String region, int rank, int total, int topPercent, List<RankRow> top, List<RankRow> around) {
    }
}

package com.maco.ranking.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.ranking.dto.RankingDtos.League;
import com.maco.ranking.dto.RankingDtos.RegionRank;
import com.maco.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 🏆 랭킹 (담당: 박민하) — docs/03. 친구(S24)는 P1. TODO(박민하): /friends (P1) */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/league/current")
    public ApiResponse<League> league(@CurrentUser Long userId) {
        return ApiResponse.ok(rankingService.league(userId));
    }

    @GetMapping("/rankings/region")
    public ApiResponse<RegionRank> region(@CurrentUser Long userId) {
        return ApiResponse.ok(rankingService.region(userId));
    }
}

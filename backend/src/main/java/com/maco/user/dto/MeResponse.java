package com.maco.user.dto;

import com.maco.user.domain.RankingVisibility;
import com.maco.user.domain.UserMode;
import java.time.LocalDate;

/** GET /me — 화면은 날짜를 직접 계산하지 않고 이 today(가상 날짜)를 쓴다. */
public record MeResponse(
        Long id,
        String email,
        String nickname,
        UserMode mode,
        String storeType,
        int dailyGoalXp,
        String habitCue,
        RegionDto region,
        RankingVisibility rankingVisibility,
        boolean leagueEnabled,
        boolean placementDone,
        boolean demo,
        LocalDate today) {
}

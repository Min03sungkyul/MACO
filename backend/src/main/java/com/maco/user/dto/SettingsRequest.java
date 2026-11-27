package com.maco.user.dto;

import com.maco.user.domain.RankingVisibility;
import com.maco.user.domain.UserMode;
import jakarta.validation.constraints.Size;

/** PATCH /me/settings — 보낸 값만 바꾼다. */
public record SettingsRequest(
        UserMode mode,
        @Size(max = 20) String storeType,
        Integer dailyGoalXp,
        @Size(max = 50) String habitCue,
        Long regionId,
        RankingVisibility rankingVisibility,
        Boolean leagueEnabled) {
}

package com.maco.xp.dto;

import java.time.LocalDate;

/** GET /me/status — 상단 바: 오늘 XP, 목표, 스트릭 */
public record StatusResponse(
        LocalDate today,
        int todayXp,
        int goalXp,
        boolean goalAchieved,
        int streakDays,
        int trainingSeconds,
        int solvedCount,
        boolean needsRestart) {
}

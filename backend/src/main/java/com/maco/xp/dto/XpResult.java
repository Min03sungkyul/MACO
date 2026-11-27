package com.maco.xp.dto;

import java.util.List;

/**
 * XP가 생기는 모든 응답에 "xp" 필드로 함께 돌려준다 (docs/01 4장).
 * 프론트는 이것만 보고 XpToast·목표 링을 갱신한다.
 */
public record XpResult(
        int gained,
        int todayXp,
        int goalXp,
        boolean goalAchievedNow,
        int streakDays,
        List<LevelUp> levelUps) {

    public record LevelUp(String skill, int from, int to) {
    }

    public static XpResult none(int todayXp, int goalXp, int streakDays) {
        return new XpResult(0, todayXp, goalXp, false, streakDays, List.of());
    }
}

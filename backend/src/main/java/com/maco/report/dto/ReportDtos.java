package com.maco.report.dto;

import java.time.LocalDate;
import java.util.List;

/** 👤 내 정보 응답 (담당: 박민하). 프론트 타입: frontend/src/lib/types/me.ts */
public final class ReportDtos {

    private ReportDtos() {
    }

    /** GET /me/stats — S25 학습 기록 */
    public record Stats(int todayXp, int weekXp, int totalXp, int trainingMinutesWeek, int solvedWeek, int accuracy,
                        int streakDays, int bestStreak) {
    }

    /** 주차별 실력 점수 + 관문 점수 */
    public record WeekPoint(LocalDate weekStart, double avgTheta, Integer findScore, Integer trustScore,
                            Integer notifyScore, int xp) {
    }

    /** GET /me/report?weeks=4 — S25 성장 리포트 */
    public record Report(List<WeekPoint> weeks) {
    }

    /** GET /me/skills — 스킬 맵 */
    public record SkillLevel(String skillCode, String name, int level, double theta, boolean ready) {
    }

    /** GET /me/badges (P1) */
    public record Badge(String code, String name, boolean earned) {
    }
}

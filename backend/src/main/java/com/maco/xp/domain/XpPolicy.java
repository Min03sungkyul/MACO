package com.maco.xp.domain;

import java.util.Map;

/**
 * XP 규칙 한곳 모음. 모든 숫자는 가정값이다 (기획서 8-2, 사용자 평가 뒤 조정).
 * 출처: docs/01 5-2, prototype/lib/train/engine.ts (XP, DAILY_CAP, GOALS)
 */
public final class XpPolicy {

    private XpPolicy() {
    }

    // 가정값: 활동별 XP
    public static final Map<XpReason, Integer> AMOUNT = Map.of(
            XpReason.PRACTICE_CORRECT, 10,
            XpReason.PRACTICE_WRONG, 2,
            XpReason.LESSON_COMPLETE, 10,
            XpReason.QUIZ_CORRECT, 4,
            XpReason.QUIZ_PERFECT, 10,
            XpReason.ROLEPLAY, 20,          // 최대값. 실제는 루브릭 점수 0~100 → 0~20
            XpReason.SPOT_FOUND, 5,
            XpReason.UNIT_TEST_PASS, 30,
            XpReason.MISSION_PASS, 50,
            XpReason.STREAK_7, 20);

    public static final int DAILY_CAP = 300;        // 가정값: 하루 상한
    public static final int DEFAULT_GOAL_XP = 60;   // 가정값: 하루 10분 ≈ 60 XP
    public static final int[] GOAL_CHOICES = {30, 60, 120}; // 가정값: 가볍게·기본·열심히
    public static final int STREAK_BONUS_DAYS = 7;  // 가정값: 7일 연속이면 +20

    public static int amount(XpReason reason) {
        return AMOUNT.getOrDefault(reason, 0);
    }

    /** 상황극 루브릭 점수 0~100 → XP 0~20 */
    public static int roleplayXp(int score0to100) {
        int s = Math.max(0, Math.min(100, score0to100));
        return Math.round(s / 5f);
    }

    /**
     * 같은 날 같은 문제를 다시 풀면 절반, 세 번째부터 0, 그리고 하루 상한까지만.
     *
     * @param base          원래 XP
     * @param repeatToday   오늘 같은 문제를 이미 푼 횟수 (처음이면 0)
     * @param earnedToday   오늘 이미 받은 XP
     */
    public static int apply(int base, int repeatToday, int earnedToday) {
        int xp = repeatToday == 0 ? base : repeatToday == 1 ? base / 2 : 0;
        return Math.max(0, Math.min(xp, DAILY_CAP - earnedToday));
    }
}

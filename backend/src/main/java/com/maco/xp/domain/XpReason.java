package com.maco.xp.domain;

/** XP가 생기는 이유 (docs/01 5-2, 기획서 8-2). 배점은 XpPolicy. */
public enum XpReason {
    PRACTICE_CORRECT,
    PRACTICE_WRONG,
    LESSON_COMPLETE,
    QUIZ_CORRECT,
    QUIZ_PERFECT,
    ROLEPLAY,
    SPOT_FOUND,
    UNIT_TEST_PASS,
    MISSION_PASS,
    STREAK_7
}

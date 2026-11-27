package com.maco.skill.domain;

import java.time.LocalDate;

/**
 * Elo·출제·복습 규칙 한곳 모음 (docs/01 5-3). 모든 숫자는 가정값이다.
 * 프로토타입(prototype/lib/train/engine.ts)과 docs/01 값이 달랐던 것은 2026-11-27에 확정했다 (docs/07 4장, 이유 포함).
 * 사용자 평가(5~8명) 뒤 다시 조정할 수 있다.
 */
public final class SkillPolicy {

    private SkillPolicy() {
    }

    /**
     * 가정값(확정): 새 사용자 실력 −1.2. 가장 쉬운 문제(시작 난이도 1 → d −2)를 맞힐 확률이 약 0.7이 되는 값이고,
     * 처음 레벨이 Lv1로 보인다 (0이면 처음부터 Lv3로 보여 어색했다). 배치 테스트로 조정한다.
     */
    public static final double THETA_START = -1.2;
    public static final double K_USER_BASE = 0.4;   // 가정값
    public static final double K_USER_DECAY = 0.05; // 가정값(확정): 많이 풀수록 덜 흔들림 (프로토타입 고정 0.4보다 시연 4주 뒤 레벨이 덜 출렁인다)
    public static final double K_ITEM = 0.1;        // 가정값(확정): 평가 인원이 적어 문제 난이도가 소수 응답에 흔들리지 않게 (프로토타입 0.15)
    public static final double TARGET_P = 0.7;      // 가정값: 맞힐 확률 70% 근처 문제 우선
    public static final int LESSON_SIZE = 7;        // 가정값(확정): 문제당 약 45초 × 7 + 개념 카드 ≈ 6분 (기획서 "레슨 1개 약 6분")
    public static final int LESSON_REVIEW_COUNT = 2; // 가정값: 레슨 7문제 중 복습 2개
    public static final int QUIZ_SIZE = 5;
    public static final int WEAK_STREAK = 3;        // 가정값: 같은 오류 유형 3번 연속이면 약점 메모
    public static final int REWRITE_PASS_SCORE = 70; // 가정값(확정): 칭찬 루브릭 4항목 중 3개(75), 불만 5항목 중 4개(80)면 통과. 70과 75는 지금 루브릭에서 결과가 같아 docs/01 값
    public static final int[] REVIEW_INTERVAL_DAYS = {1, 3, 7}; // 가정값: 틀린 다음 날 → 3일 → 7일

    /** 맞힐 확률 p = 1 / (1 + e^-(θ - d)) */
    public static double pCorrect(double theta, double difficulty) {
        return 1.0 / (1.0 + Math.exp(-(theta - difficulty)));
    }

    /** 사용자 갱신 폭: 0.4 / (1 + 0.05·푼 문제 수) */
    public static double kUser(int attemptCount) {
        return K_USER_BASE / (1.0 + K_USER_DECAY * attemptCount);
    }

    /** θ ← θ + K_u (r − p) */
    public static double nextTheta(double theta, double difficulty, boolean correct, int attemptCount) {
        double p = pCorrect(theta, difficulty);
        return theta + kUser(attemptCount) * ((correct ? 1 : 0) - p);
    }

    /** d ← d − K_i (r − p) */
    public static double nextDifficulty(double theta, double difficulty, boolean correct) {
        double p = pCorrect(theta, difficulty);
        return difficulty - K_ITEM * ((correct ? 1 : 0) - p);
    }

    /** 문제 시작 난이도 1~5 → d −2~+2 */
    public static double initialDifficulty(int initDifficulty1to5) {
        return initDifficulty1to5 - 3.0;
    }

    /** 스킬 레벨 1~5 (가정값: θ < −1 Lv1, < −0.3 Lv2, < 0.3 Lv3, < 1 Lv4, 그 이상 Lv5) */
    public static int level(double theta) {
        if (theta < -1) return 1;
        if (theta < -0.3) return 2;
        if (theta < 0.3) return 3;
        if (theta < 1) return 4;
        return 5;
    }

    /** 출제 점수: p가 0.7에 가까울수록 높다 (프로토타입 pickNext의 기본 점수) */
    public static double pickScore(double theta, double difficulty) {
        return -Math.abs(pCorrect(theta, difficulty) - TARGET_P);
    }

    /** 복습 단계(0부터)의 다음 복습 날짜. 단계를 다 지나면 null (resolved) */
    public static LocalDate nextReviewDate(LocalDate today, int step) {
        if (step < 0 || step >= REVIEW_INTERVAL_DAYS.length) {
            return null;
        }
        return today.plusDays(REVIEW_INTERVAL_DAYS[step]);
    }
}

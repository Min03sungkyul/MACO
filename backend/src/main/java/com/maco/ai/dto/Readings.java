package com.maco.ai.dto;

/**
 * 캡처에서 읽은 항목값 (prototype/lib/ai/adapter.ts Readings). 사장님이 확인·수정한 뒤 관문 점수를 매긴다.
 */
public record Readings(
        boolean hours,
        boolean menuPrice,
        int photos,
        boolean contact,
        int reviews,
        double rating,
        int replied,
        int recentReviewDays,
        boolean news,
        boolean coupon,
        boolean insta) {

    /** 리뷰 3개뿐인 오픈 3개월 카페 (기획서 시연 페르소나) */
    public static Readings demoCafe() {
        return new Readings(true, false, 4, true, 3, 4.3, 1, 12, false, false, false);
    }
}

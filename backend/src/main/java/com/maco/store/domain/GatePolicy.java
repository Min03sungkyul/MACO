package com.maco.store.domain;

import com.maco.ai.dto.Readings;
import java.util.List;
import java.util.function.ToDoubleFunction;

/**
 * 관문 규칙표 (prototype/lib/train/gates.ts RULES). 캡처에서 읽은 항목으로 점수를 매긴다.
 * 기준값은 가설이다 (가정값, 델파이·파일럿으로 보정).
 */
public final class GatePolicy {

    private GatePolicy() {
    }

    public static final int PASS = 70;              // 가정값: 관문 통과 점수
    public static final int PHOTOS_ENOUGH = 5;      // 가정값: 사진 5장 이상
    public static final int REVIEWS_ENOUGH = 20;    // 가정값: 리뷰 20개
    public static final int RECENT_DAYS = 30;       // 가정값: 최근 30일 리뷰
    public static final double RATING_GOOD = 4.0;   // 가정값: 별점 4.0 이상

    /**
     * @param key   항목 키 (진단 카드·틀린 곳 찾기 연결)
     * @param skill 연결된 트레이닝 스킬
     * @param spot  틀린 곳 찾기에서 보여 줄 문구
     */
    public record Rule(Gate gate, String key, String label, ToDoubleFunction<Readings> score, String card, String skill,
                       String spot) {
    }

    public static final List<Rule> RULES = List.of(
            new Rule(Gate.FIND, "hours", "영업시간", r -> r.hours() ? 1 : 0, "영업시간이 비어 있어요", "INFO", "영업시간 정보 없음"),
            new Rule(Gate.FIND, "menuPrice", "메뉴·가격", r -> r.menuPrice() ? 1 : 0, "메뉴에 가격이 없어요", "INFO", "메뉴 가격이 비어 있음"),
            new Rule(Gate.FIND, "photos", "사진 5장 이상", r -> Math.min(1, r.photos() / (double) PHOTOS_ENOUGH), "사진이 5장보다 적어요", "PHOTO", "사진이 몇 장 없음"),
            new Rule(Gate.FIND, "contact", "전화·주소", r -> r.contact() ? 1 : 0, "전화번호나 주소가 없어요", "INFO", "연락처 없음"),
            new Rule(Gate.TRUST, "reviews", "리뷰 20개", r -> Math.min(1, r.reviews() / (double) REVIEWS_ENOUGH), "리뷰가 20개보다 적어요", "REVIEW", "리뷰가 몇 개 없음"),
            new Rule(Gate.TRUST, "replied", "사장님 답글", r -> r.reviews() > 0 ? r.replied() / (double) r.reviews() : 0, "답글이 없는 리뷰가 있어요", "REVIEW", "답글 없는 리뷰"),
            new Rule(Gate.TRUST, "recent", "최근 30일 리뷰", r -> r.recentReviewDays() <= RECENT_DAYS ? 1 : 0, "최근 한 달 리뷰가 없어요", "REVIEW", "오래된 리뷰만 있음"),
            new Rule(Gate.TRUST, "rating", "별점 4.0 이상", r -> r.rating() >= RATING_GOOD ? 1 : r.rating() / RATING_GOOD, "별점이 4.0보다 낮아요", "REVIEW", "낮은 별점"),
            new Rule(Gate.NOTIFY, "news", "소식", r -> r.news() ? 1 : 0, "소식이 한 번도 없어요", "PROMO", "소식 탭이 비어 있음"),
            new Rule(Gate.NOTIFY, "coupon", "쿠폰", r -> r.coupon() ? 1 : 0, "쿠폰이 없어요", "PROMO", "쿠폰 없음"),
            new Rule(Gate.NOTIFY, "insta", "인스타 연결", r -> r.insta() ? 1 : 0, "인스타그램이 연결돼 있지 않아요", "PROMO", "인스타 링크 없음"));
}

package com.maco.store.dto;

/** 리뷰 요청 QR 카드 — S20. 문구는 대가 없는 요청만 (공정위 추천·보증 심사지침) */
public record ReviewCardDto(Long id, String storeName, String message, String qrTargetUrl, int requestsToday,
                            int requestsTotal) {
}

package com.maco.store.dto;

/** @param practice 학습 모드의 연습 가게면 true */
public record StoreDto(Long id, String name, String category, String address, boolean practice) {
}

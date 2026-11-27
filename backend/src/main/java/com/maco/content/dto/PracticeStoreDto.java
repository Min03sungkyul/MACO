package com.maco.content.dto;

public record PracticeStoreDto(Long id, String code, String storeType, String name, String placeImage,
                               String instaImage, String menuJson, String reviewsJson, String gatePresetJson) {
}

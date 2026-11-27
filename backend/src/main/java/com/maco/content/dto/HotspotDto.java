package com.maco.content.dto;

/** 틀린 곳 찾기 조각 (정답 여부는 보내지 않는다) */
public record HotspotDto(String partKey, String label, Integer stars, Double x, Double y, Double w, Double h) {
}

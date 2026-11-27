package com.maco.user.dto;

import com.maco.user.domain.Region;

public record RegionDto(Long id, String sido, String sigungu, String code) {

    public static RegionDto from(Region r) {
        return new RegionDto(r.getId(), r.getSido(), r.getSigungu(), r.getCode());
    }
}

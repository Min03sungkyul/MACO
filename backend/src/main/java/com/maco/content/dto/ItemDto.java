package com.maco.content.dto;

import java.util.List;

/** 화면에 보내는 문제. 정답·오류 유형은 넣지 않는다 (채점은 서버에서). */
public record ItemDto(
        Long id,
        String code,
        String skillCode,
        String type,
        String prompt,
        String context,
        String media,
        List<ChoiceDto> choices,
        List<HotspotDto> hotspots,
        String rubricCode,
        Long conceptCardId,
        int initDifficulty) {
}

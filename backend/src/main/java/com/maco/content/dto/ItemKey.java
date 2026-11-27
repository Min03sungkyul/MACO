package com.maco.content.dto;

import java.util.Map;

/** 채점용 정답 정보 (서버 안에서만 쓴다) */
public record ItemKey(
        Long id,
        String code,
        String skillCode,
        String type,
        String answer,
        Map<String, String> choiceErrorTypes,
        String rubricCode,
        String explanation,
        Long conceptCardId,
        String sampleAnswer,
        int initDifficulty,
        Double difficulty) {
}

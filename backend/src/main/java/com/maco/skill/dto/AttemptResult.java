package com.maco.skill.dto;

import com.maco.xp.dto.XpResult;

/** 채점 결과 (docs/01 5-3). xp는 받은 XP가 없으면 gained=0. */
public record AttemptResult(
        boolean correct,
        String answer,
        String errorType,
        String explanation,
        Long principleCardId,
        String weakNote,
        XpResult xp) {
}

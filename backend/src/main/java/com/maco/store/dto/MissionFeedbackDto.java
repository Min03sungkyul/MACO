package com.maco.store.dto;

import com.maco.ai.client.AiSource;
import com.maco.ai.dto.GradeOutput;
import com.maco.xp.dto.XpResult;

/** 미션 첨삭 결과 — S19. 통과하면 +50 XP */
public record MissionFeedbackDto(GradeOutput feedback, AiSource source, XpResult xp) {
}

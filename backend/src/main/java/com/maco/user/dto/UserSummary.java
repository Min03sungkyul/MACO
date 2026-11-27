package com.maco.user.dto;

import com.maco.user.domain.UserMode;

/** 다른 패키지에 엔티티 대신 넘겨주는 사용자 요약 (AGENTS.md 4장 ⑦) */
public record UserSummary(Long id, String nickname, UserMode mode, String storeType, int dailyGoalXp,
                          Long regionId, boolean demo) {
}

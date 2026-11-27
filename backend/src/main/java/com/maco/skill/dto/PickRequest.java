package com.maco.skill.dto;

import com.maco.skill.domain.AttemptContext;
import java.util.List;

/**
 * 출제 요청.
 *
 * @param skills        스킬 코드 (PHOTO, REVIEW)
 * @param maxLevel      레슨 레벨 이하 문제만 (1~5)
 * @param count         몇 문제
 * @param includeReview 복습 예정 오답을 섞을지
 * @param excludeIds    이미 낸 문제
 */
public record PickRequest(List<String> skills, int maxLevel, int count, AttemptContext context, boolean includeReview,
                          List<Long> excludeIds) {
}

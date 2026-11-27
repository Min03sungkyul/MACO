package com.maco.skill.dto;

import com.maco.skill.domain.AttemptContext;
import jakarta.validation.constraints.NotNull;

/**
 * POST /attempts — 문제 하나 풀이.
 *
 * @param answer     고른 보기 키(A~D) 또는 틀린 곳 찾기 조각 키 목록("b|d")
 * @param answerText 고쳐 쓰기 답
 * @param score      고쳐 쓰기 AI 채점 점수 (/rewrite/grade 결과, 0~100)
 */
public record AttemptRequest(
        @NotNull Long itemId,
        String answer,
        String answerText,
        @NotNull AttemptContext context,
        Long sessionId,
        Integer elapsedMs,
        Integer score) {
}

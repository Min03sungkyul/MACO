package com.maco.ai.dto;

/** @param last 손님의 마지막 말이면 true → 리포트로 넘어간다 */
public record RoleplayTurnOutput(String customerText, boolean last) {
}

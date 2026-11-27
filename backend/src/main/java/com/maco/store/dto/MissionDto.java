package com.maco.store.dto;

/** @param unlocked 연결 스킬이 unlockLevel 이상이면 열림 */
public record MissionDto(Long id, String code, String skillCode, String gate, String title, String description,
                         int unlockLevel, String submitType, boolean unlocked, boolean passed) {
}

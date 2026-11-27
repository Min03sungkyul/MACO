package com.maco.content.dto;

public record ScenarioDto(Long id, String code, String skillCode, String title, String persona, String openingLine,
                          int maxTurns, String rubricCode) {
}

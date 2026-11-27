package com.maco.content.dto;

public record RubricCriterionDto(String code, String criterionKey, String criterion, double weight, String good,
                                 String fix, String errorTypeCode) {
}

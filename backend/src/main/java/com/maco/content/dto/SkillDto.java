package com.maco.content.dto;

public record SkillDto(String code, String name, String gate, int unitOrder, String canLv1, String canLv3,
                       String canLv5, boolean ready) {
}

package com.maco.content.dto;

public record LessonDto(Long id, String skillCode, int level, int seq, String title, Long conceptCardId,
                        int itemCount) {
}

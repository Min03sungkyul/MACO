package com.maco.ai.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** AI 설정 (.env의 AI_*). 키는 코드·로그·프롬프트에 넣지 않는다. */
@ConfigurationProperties(prefix = "maco.ai")
public record AiProperties(String mode, String provider, String apiKey, String modelText, String modelVision) {

    public AiMode aiMode() {
        if (mode == null || mode.isBlank()) {
            return AiMode.RECORDED;
        }
        try {
            return AiMode.valueOf(mode.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return AiMode.RECORDED;
        }
    }
}

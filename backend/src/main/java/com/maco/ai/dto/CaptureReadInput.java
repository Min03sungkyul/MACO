package com.maco.ai.dto;

import com.maco.ai.client.AiInput;

/** @param demoKey 시연 캡처면 고정 키(예: "owner-week0"), 아니면 이미지 해시 */
public record CaptureReadInput(String platform, String imagePath, String demoKey) implements AiInput {

    @Override
    public String matchKey() {
        return demoKey == null ? "default" : demoKey;
    }
}

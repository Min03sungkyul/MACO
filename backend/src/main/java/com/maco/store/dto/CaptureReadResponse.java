package com.maco.store.dto;

import com.maco.ai.client.AiSource;
import com.maco.ai.dto.Readings;

/** 캡처 업로드 → AI가 읽은 항목. 사장님이 확인·수정한 뒤 confirm 한다 — S16 */
public record CaptureReadResponse(Long captureId, String platform, Readings readings, AiSource source) {
}

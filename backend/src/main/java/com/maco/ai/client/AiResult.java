package com.maco.ai.client;

/** AiClient.run 결과: { ok, source, data, latencyMs } */
public record AiResult<T>(boolean ok, AiSource source, T data, long latencyMs) {
}

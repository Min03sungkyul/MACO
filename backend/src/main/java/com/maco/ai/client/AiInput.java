package com.maco.ai.client;

/** 저장 응답(recorded)·캐시를 찾을 때 쓰는 입력 식별값. 시연 입력은 고정 키를 쓴다. */
public interface AiInput {

    String matchKey();
}

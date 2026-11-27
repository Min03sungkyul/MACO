package com.maco.ai.client;

/** 결과가 어디서 왔나. FALLBACK이어도 화면은 동작해야 한다 (AGENTS.md 4장 ②). */
public enum AiSource { LIVE, CACHE, RECORDED, FALLBACK }

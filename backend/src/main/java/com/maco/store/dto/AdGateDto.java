package com.maco.store.dto;

/** 광고 관문 — S21. 찾게·믿게를 통과해야 열린다. experiment는 2주 실험 카드 (P1) */
public record AdGateDto(boolean locked, String reason, GateScores scores, Experiment experiment) {

    public record Experiment(String channel, int budget, String stopRule) {
    }
}

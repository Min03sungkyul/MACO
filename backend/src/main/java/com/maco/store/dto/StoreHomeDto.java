package com.maco.store.dto;

import java.util.List;

/** 내 가게 홈 — S15. 학습 모드는 연습 가게 기준 */
public record StoreHomeDto(StoreDto store, GateCheckDto latest, List<MissionDto> missions, Quest quest) {

    /** 퀘스트 진행 바 (기획서 12-1: 시연용 고정 데이터) */
    public record Quest(String title, int done, int total) {
    }
}

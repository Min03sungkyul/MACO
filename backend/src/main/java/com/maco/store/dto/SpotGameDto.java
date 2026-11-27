package com.maco.store.dto;

import java.util.List;

/** 내 화면 틀린 곳 찾기 — S18. 손님이 보는 플레이스 화면을 진단 결과로 다시 그린다 (좌표 없이 줄 단위). */
public record SpotGameDto(Long gameId, List<Row> rows, int toFind, List<String> foundKeys) {

    /** bad는 보내지 않는다 (탭해서 찾는 게임) */
    public record Row(String key, String label, String sub) {
    }
}

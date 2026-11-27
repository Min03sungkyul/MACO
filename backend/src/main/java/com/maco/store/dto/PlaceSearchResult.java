package com.maco.store.dto;

/** 가게 검색 결과 한 줄. demo=true면 키가 없어 시연용 결과 */
public record PlaceSearchResult(String name, String category, String address, String roadAddress, String mapx,
                                String mapy, String link, boolean demo) {
}

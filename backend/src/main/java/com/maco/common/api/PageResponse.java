package com.maco.common.api;

import java.util.List;

/** 목록 응답: { "items": [...], "page": 0, "hasNext": true } */
public record PageResponse<T>(List<T> items, int page, boolean hasNext) {
}

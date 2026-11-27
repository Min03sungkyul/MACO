package com.maco.common.api;

/** 성공 응답 형식: { "data": ... } (docs/01 4장) */
public record ApiResponse<T>(T data) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data);
    }
}

package com.maco.common.api;

/** 실패 응답 형식: { "error": { "code", "message" } } (docs/01 4장) */
public record ErrorResponse(Body error) {

    public record Body(String code, String message) {
    }

    public static ErrorResponse of(ErrorCode code) {
        return new ErrorResponse(new Body(code.name(), code.getMessage()));
    }

    public static ErrorResponse of(ErrorCode code, String message) {
        return new ErrorResponse(new Body(code.name(), message));
    }
}

package com.maco.common.api;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 에러 코드 한곳 모음. 코드는 대문자_스네이크, 탭 접두어 없이 뜻으로 (docs/01 4장).
 * 새 코드가 필요하면 여기에 추가한다.
 */
@Getter
public enum ErrorCode {
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값을 확인해 주세요"),
    FILE_INVALID(HttpStatus.BAD_REQUEST, "이미지 파일(JPG·PNG, 10MB 이하)만 올릴 수 있어요"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요해요"),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 맞지 않아요"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없어요"),
    DEMO_ONLY(HttpStatus.FORBIDDEN, "시연 계정에서만 쓸 수 있어요"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "찾을 수 없어요"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없어요"),
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "문제를 찾을 수 없어요"),
    EMAIL_DUPLICATED(HttpStatus.CONFLICT, "이미 가입된 이메일이에요"),
    QUIZ_ALREADY_SUBMITTED(HttpStatus.CONFLICT, "오늘 쪽지시험은 이미 제출했어요"),
    STORE_ALREADY_REGISTERED(HttpStatus.CONFLICT, "가게는 계정당 하나만 등록할 수 있어요"),
    XP_DAILY_CAP(HttpStatus.CONFLICT, "오늘 받을 수 있는 XP를 모두 받았어요"),
    NOT_IMPLEMENTED(HttpStatus.NOT_IMPLEMENTED, "아직 준비 중인 기능이에요"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "잠시 후 다시 시도해 주세요");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}

package com.maco.auth.dto;

public record TokenResponse(String accessToken, Long userId) {
}

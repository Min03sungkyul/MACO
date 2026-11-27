package com.maco.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** JWT 설정. 비밀값은 .env의 JWT_SECRET (코드에 넣지 않는다). */
@ConfigurationProperties(prefix = "maco.jwt")
public record JwtProperties(String secret, long expiryHours) {
}

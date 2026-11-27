package com.maco.common.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 로그인 토큰 만들기·읽기. */
@Slf4j
@Component
public class JwtProvider {

    private final SecretKey key;
    private final Duration expiry;
    private final Clock clock;

    public JwtProvider(JwtProperties props, Clock clock) {
        this.clock = clock;
        this.expiry = Duration.ofHours(props.expiryHours() > 0 ? props.expiryHours() : 168);
        String secret = props.secret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            // 로컬 실행 편의: 키가 없으면 실행할 때마다 새로 만든다 (서버를 다시 켜면 다시 로그인해야 함).
            log.warn("JWT_SECRET이 없거나 32바이트보다 짧아 임시 키를 씁니다. 배포할 때는 .env에 꼭 넣으세요.");
            byte[] random = new byte[32];
            new SecureRandom().nextBytes(random);
            this.key = Keys.hmacShaKeyFor(random);
        } else {
            this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String createToken(Long userId) {
        Date issued = Date.from(clock.instant());
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(issued)
                .expiration(Date.from(clock.instant().plus(expiry)))
                .signWith(key)
                .compact();
    }

    /** 올바른 토큰이면 사용자 id, 아니면 빈 값 */
    public Optional<Long> parseUserId(String token) {
        try {
            String subject = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return Optional.of(Long.valueOf(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}

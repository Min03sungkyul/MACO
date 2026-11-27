package com.maco.auth.service;

import com.maco.auth.dto.LoginRequest;
import com.maco.auth.dto.SignupRequest;
import com.maco.auth.dto.TokenResponse;
import com.maco.common.security.JwtProvider;
import com.maco.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 이메일 가입·로그인 (담당: 박민하). 소셜 로그인(카카오·네이버)은 P1.
 * TODO(박민하): 소셜 로그인 /auth/oauth/{provider}/callback (P1, 여유 있으면)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    public TokenResponse signup(SignupRequest req) {
        Long userId = userService.registerEmail(req.email().trim().toLowerCase(), req.password(), req.nickname().trim());
        return new TokenResponse(jwtProvider.createToken(userId), userId);
    }

    public TokenResponse login(LoginRequest req) {
        Long userId = userService.authenticate(req.email().trim().toLowerCase(), req.password());
        return new TokenResponse(jwtProvider.createToken(userId), userId);
    }
}

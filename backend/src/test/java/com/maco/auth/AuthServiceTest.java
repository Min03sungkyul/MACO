package com.maco.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.maco.auth.dto.LoginRequest;
import com.maco.auth.dto.TokenResponse;
import com.maco.auth.service.AuthService;
import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.common.security.JwtProvider;
import com.maco.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserService userService;
    @Mock
    JwtProvider jwtProvider;
    @InjectMocks
    AuthService authService;

    @Test
    void 로그인에_성공하면_토큰을_준다() {
        given(userService.authenticate("owner@maco.app", "password1")).willReturn(7L);
        given(jwtProvider.createToken(7L)).willReturn("token");

        TokenResponse res = authService.login(new LoginRequest(" Owner@maco.app ", "password1"));

        assertThat(res.accessToken()).isEqualTo("token");
        assertThat(res.userId()).isEqualTo(7L);
    }

    @Test
    void 비밀번호가_틀리면_LOGIN_FAILED() {
        given(userService.authenticate("owner@maco.app", "wrong"))
                .willThrow(new BusinessException(ErrorCode.LOGIN_FAILED));

        assertThatThrownBy(() -> authService.login(new LoginRequest("owner@maco.app", "wrong")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.LOGIN_FAILED);
    }
}

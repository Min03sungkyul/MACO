package com.maco.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.common.time.AppClock;
import com.maco.user.domain.User;
import com.maco.user.repository.RegionRepository;
import com.maco.user.repository.UserRepository;
import com.maco.user.service.UserService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;
    @Mock
    RegionRepository regionRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    AppClock appClock;
    @InjectMocks
    UserService userService;

    @Test
    void 이미_가입된_이메일이면_EMAIL_DUPLICATED() {
        given(userRepository.existsByEmail("a@maco.app")).willReturn(true);

        assertThatThrownBy(() -> userService.registerEmail("a@maco.app", "password1", "가게"))
                .extracting("errorCode").isEqualTo(ErrorCode.EMAIL_DUPLICATED);
    }

    @Test
    void 비밀번호가_맞으면_사용자_id를_준다() {
        User user = User.builder().email("a@maco.app").passwordHash("hash").nickname("가게").build();
        ReflectionTestUtils.setField(user, "id", 7L);
        given(userRepository.findByEmail("a@maco.app")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password1", "hash")).willReturn(true);

        assertThat(userService.authenticate("a@maco.app", "password1")).isEqualTo(7L);
    }

    @Test
    void 비밀번호가_틀리면_LOGIN_FAILED() {
        User user = User.builder().email("a@maco.app").passwordHash("hash").nickname("가게").build();
        given(userRepository.findByEmail("a@maco.app")).willReturn(Optional.of(user));
        given(passwordEncoder.matches(any(), any())).willReturn(false);

        assertThatThrownBy(() -> userService.authenticate("a@maco.app", "wrong"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.LOGIN_FAILED);
    }

    @Test
    void 시연_계정이_아니면_날짜를_넘길_수_없다() {
        User user = User.builder().email("a@maco.app").nickname("가게").demo(false).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.skipDemoDays(1L, 7))
                .extracting("errorCode").isEqualTo(ErrorCode.DEMO_ONLY);
    }
}

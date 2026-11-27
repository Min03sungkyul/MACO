package com.maco.demo.service;

import com.maco.user.domain.UserMode;
import com.maco.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * local 프로필: 예시 계정 2개를 만든다 (기획서 12-1). 비밀번호는 로컬 전용 값 (DEMO_PASSWORD로 바꿀 수 있다).
 * - 입문자(학습 모드, 연습 카페, 마포구) learner@maco.app
 * - 사장님(내 가게 모드, 리뷰 3개 부평구 카페) owner@maco.app
 * TODO(박민하): 예시 기록(θ, 3~5일치 XP, 사장님 캡처 진단 1회) 함께 넣기 — prototype/lib/train/demo.ts
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "maco.demo.seed-on-start", havingValue = "true")
public class DemoSeeder implements ApplicationRunner {

    private final UserService userService;

    @Value("${maco.demo.password:maco1234}")
    private String password;

    @Override
    public void run(ApplicationArguments args) {
        Long learner = userService.ensureDemoUser("learner@maco.app", password, "예비 창업자", UserMode.LEARNING, "CAFE",
                "11440", "퇴근길 지하철");
        Long owner = userService.ensureDemoUser("owner@maco.app", password, "부평 무화과 카페", UserMode.STORE, "CAFE",
                "28237", "마감 정리 후");
        log.info("예시 계정 준비: learner@maco.app(id={}), owner@maco.app(id={})", learner, owner);
    }
}

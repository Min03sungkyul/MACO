package com.maco.demo.service;

import com.maco.common.time.AppClock;
import com.maco.user.service.UserService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 시연 도구 (담당: 박민하). 날짜 넘기기·시연 초기화 (기획서 E4, 12장).
 * TODO(박민하): 넘긴 기간의 예시 기록 채우기 (prototype/lib/train/demo.ts skipFourWeeks):
 * 28일 매일 목표 달성 xp_log·daily_goal, θ 상승, 사장님 계정은 4주 뒤 캡처 진단(믿게 통과)·미션 2개 통과·QR 요청 +18.
 * TODO(박민하): reset — 시연 계정의 기록 삭제 후 처음 상태(예시 기록 3~5일)로.
 */
@Service
@RequiredArgsConstructor
public class DemoService {

    private final UserService userService;
    private final AppClock appClock;

    public record DayResult(int dayOffset, LocalDate today) {
    }

    public DayResult skipDays(Long userId, int days) {
        int offset = userService.skipDemoDays(userId, days);
        return new DayResult(offset, appClock.today(userId));
    }

    public DayResult reset(Long userId) {
        userService.resetDemoDays(userId);
        return new DayResult(0, appClock.today(userId));
    }
}

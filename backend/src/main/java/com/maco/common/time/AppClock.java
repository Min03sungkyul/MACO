package com.maco.common.time;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import org.springframework.stereotype.Component;

/**
 * 서버의 "오늘"은 모두 여기서 얻는다 (AGENTS.md 4장 ①).
 * 오늘 = 실제 오늘 + users.demo_day_offset. 시연 "4주 넘기기"가 모든 기능에 그대로 반영된다.
 * LocalDate.now() 같은 호출은 이 패키지(common/time) 밖에서 쓰지 않는다.
 */
@Component
public class AppClock {

    private final Clock clock;
    private final DayOffsetProvider offsets;

    public AppClock(Clock clock, DayOffsetProvider offsets) {
        this.clock = clock;
        this.offsets = offsets;
    }

    /** 사용자 기준 오늘 (userId가 null이면 실제 오늘) */
    public LocalDate today(Long userId) {
        return LocalDate.now(clock).plusDays(offset(userId));
    }

    /** 사용자 기준 지금 (Asia/Seoul) */
    public OffsetDateTime now(Long userId) {
        return OffsetDateTime.now(clock).plusDays(offset(userId));
    }

    /** 사용자 기준 이번 주 월요일 (리그는 월요일 시작) */
    public LocalDate weekStart(Long userId) {
        return today(userId).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private int offset(Long userId) {
        return userId == null ? 0 : offsets.dayOffset(userId);
    }
}

package com.maco.common.time;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class AppClockTest {

    // 2026-12-16(수) 09:00 KST
    private final Clock fixed = Clock.fixed(Instant.parse("2026-12-16T00:00:00Z"), ClockConfig.ZONE);

    @Test
    void 시연_오프셋만큼_오늘이_밀린다() {
        AppClock clock = new AppClock(fixed, userId -> 28);

        assertThat(clock.today(1L)).isEqualTo(LocalDate.of(2027, 1, 13));
    }

    @Test
    void 사용자가_없으면_실제_오늘이다() {
        AppClock clock = new AppClock(fixed, userId -> 28);

        assertThat(clock.today(null)).isEqualTo(LocalDate.of(2026, 12, 16));
    }

    @Test
    void 주의_시작은_월요일이다() {
        AppClock clock = new AppClock(fixed, userId -> 0);

        assertThat(clock.weekStart(1L)).isEqualTo(LocalDate.of(2026, 12, 14));
    }
}

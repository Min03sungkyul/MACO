package com.maco.exam;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.exam.service.QuizService;
import org.junit.jupiter.api.Test;

class QuizServiceTest {

    @Test
    void 다섯_문제_중_넷을_맞히면_80점() {
        assertThat(QuizService.score(4, 5)).isEqualTo(80);
    }

    @Test
    void 문제가_없으면_0점() {
        assertThat(QuizService.score(0, 0)).isZero();
    }
}

package com.maco.skill;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.maco.skill.domain.SkillPolicy;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class SkillPolicyTest {

    @Test
    void 실력과_난이도가_같으면_맞힐_확률은_절반() {
        assertThat(SkillPolicy.pCorrect(0, 0)).isCloseTo(0.5, within(1e-9));
    }

    @Test
    void 맞히면_실력이_오르고_문제는_쉬워진다() {
        assertThat(SkillPolicy.nextTheta(0, 0, true, 0)).isCloseTo(0.2, within(1e-9));
        assertThat(SkillPolicy.nextDifficulty(0, 0, true)).isCloseTo(-0.05, within(1e-9));
    }

    @Test
    void 틀리면_실력이_내려간다() {
        assertThat(SkillPolicy.nextTheta(0, 0, false, 0)).isLessThan(0);
    }

    @Test
    void 많이_풀수록_실력_변화폭이_줄어든다() {
        assertThat(SkillPolicy.kUser(20)).isLessThan(SkillPolicy.kUser(0));
    }

    @Test
    void 레벨_경계() {
        assertThat(SkillPolicy.level(-1.5)).isEqualTo(1);
        assertThat(SkillPolicy.level(0)).isEqualTo(3);
        assertThat(SkillPolicy.level(1.2)).isEqualTo(5);
    }

    @Test
    void 복습은_1일_3일_7일_뒤_그다음은_끝() {
        LocalDate d = LocalDate.of(2026, 12, 1);
        assertThat(SkillPolicy.nextReviewDate(d, 0)).isEqualTo(d.plusDays(1));
        assertThat(SkillPolicy.nextReviewDate(d, 2)).isEqualTo(d.plusDays(7));
        assertThat(SkillPolicy.nextReviewDate(d, 3)).isNull();
    }
}

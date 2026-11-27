package com.maco.xp;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.xp.domain.XpPolicy;
import com.maco.xp.domain.XpReason;
import org.junit.jupiter.api.Test;

class XpPolicyTest {

    @Test
    void 처음_풀면_전부_두_번째는_절반_세_번째는_0() {
        assertThat(XpPolicy.apply(10, 0, 0)).isEqualTo(10);
        assertThat(XpPolicy.apply(10, 1, 0)).isEqualTo(5);
        assertThat(XpPolicy.apply(10, 2, 0)).isZero();
    }

    @Test
    void 하루_상한_300을_넘지_않는다() {
        assertThat(XpPolicy.apply(50, 0, 280)).isEqualTo(20);
        assertThat(XpPolicy.apply(50, 0, 300)).isZero();
    }

    @Test
    void 상황극은_점수_100점이면_20XP() {
        assertThat(XpPolicy.roleplayXp(100)).isEqualTo(20);
        assertThat(XpPolicy.roleplayXp(-10)).isZero();
    }

    @Test
    void 배점표() {
        assertThat(XpPolicy.amount(XpReason.MISSION_PASS)).isEqualTo(50);
    }
}

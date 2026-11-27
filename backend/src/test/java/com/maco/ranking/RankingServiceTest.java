package com.maco.ranking;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.ranking.domain.VirtualUsers;
import java.util.List;
import org.junit.jupiter.api.Test;

class RankingServiceTest {

    @Test
    void 같은_주_같은_지역이면_가상_사용자가_언제나_같다() {
        assertThat(VirtualUsers.region("부평구", "2026-12-14", 3)).isEqualTo(VirtualUsers.region("부평구", "2026-12-14", 3));
        assertThat(VirtualUsers.league("2026-12-14", 3)).hasSize(29);
    }

    @Test
    void 지역_사용자는_300명에서_549명() {
        List<Integer> xs = VirtualUsers.region("부평구", "2026-12-14", 6);
        assertThat(xs.size() + 1).isBetween(300, 549);
    }
}

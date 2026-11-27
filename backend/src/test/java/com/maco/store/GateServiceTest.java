package com.maco.store;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.ai.dto.Readings;
import com.maco.store.dto.DiagnosisCard;
import com.maco.store.dto.GateScores;
import com.maco.store.service.GateService;
import java.util.List;
import org.junit.jupiter.api.Test;

class GateServiceTest {

    private final GateService gates = new GateService();

    @Test
    void 시연_카페는_믿게를_통과하지_못해_광고가_잠긴다() {
        GateScores s = gates.scores(Readings.demoCafe());

        assertThat(s.findScore()).isEqualTo(70);
        assertThat(s.trustPassed()).isFalse();
        assertThat(s.adUnlocked()).isFalse();
    }

    @Test
    void 네_주_뒤에는_찾게_믿게를_통과해_광고가_열린다() {
        Readings after = new Readings(true, true, 9, true, 21, 4.3, 19, 2, true, false, false);

        GateScores s = gates.scores(after);

        assertThat(s.findScore()).isEqualTo(100);
        assertThat(s.trustPassed()).isTrue();
        assertThat(s.adUnlocked()).isTrue();
    }

    @Test
    void 진단_카드는_점수가_낮은_항목부터() {
        List<DiagnosisCard> cards = gates.cards(Readings.demoCafe());

        assertThat(cards).isNotEmpty();
        assertThat(cards.get(0).value()).isZero();
        assertThat(cards).extracting(DiagnosisCard::key).doesNotContain("hours", "contact");
    }
}

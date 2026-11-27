package com.maco.skill;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.content.dto.ItemKey;
import com.maco.skill.domain.Grader;
import java.util.Map;
import org.junit.jupiter.api.Test;

class GraderTest {

    private ItemKey key(String type, String answer, Map<String, String> errors) {
        return new ItemKey(1L, "X", "PHOTO", type, answer, errors, null, "이유", null, null, 1, null);
    }

    @Test
    void 고르기_정답() {
        var g = Grader.grade(key("CHOICE2", "B", Map.of("A", "PHOTO_LIGHT")), "b", null);
        assertThat(g.correct()).isTrue();
        assertThat(g.errorType()).isNull();
    }

    @Test
    void 고르기_오답이면_고른_보기의_오류_유형() {
        var g = Grader.grade(key("CHOICE2", "B", Map.of("A", "PHOTO_LIGHT")), "A", null);
        assertThat(g.correct()).isFalse();
        assertThat(g.errorType()).isEqualTo("PHOTO_LIGHT");
    }

    @Test
    void 틀린_곳_찾기는_순서와_상관없이_모두_맞아야_정답() {
        var key = key("SPOT", "b|d|f", Map.of("b", "PHOTO_LIGHT", "d", "PHOTO_BLUR", "f", "PHOTO_LIGHT"));
        assertThat(Grader.grade(key, "f|b|d", null).correct()).isTrue();
        var missed = Grader.grade(key, "b|f", null);
        assertThat(missed.correct()).isFalse();
        assertThat(missed.errorType()).isEqualTo("PHOTO_BLUR");
    }

    @Test
    void 고쳐_쓰기는_70점부터_정답() {
        assertThat(Grader.grade(key("REWRITE", null, Map.of()), null, 70).correct()).isTrue();
        assertThat(Grader.grade(key("REWRITE", null, Map.of()), null, 69).correct()).isFalse();
        assertThat(Grader.grade(key("REWRITE", null, Map.of()), null, null).correct()).isFalse();
    }
}

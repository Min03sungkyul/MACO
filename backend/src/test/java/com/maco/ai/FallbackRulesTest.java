package com.maco.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.ai.dto.ExplainInput;
import com.maco.ai.dto.GradeInput;
import com.maco.ai.dto.GradeOutput;
import com.maco.ai.dto.RoleplayReportInput;
import com.maco.ai.dto.RoleplayReportOutput;
import com.maco.ai.dto.RoleplayTurn;
import com.maco.ai.dto.RoleplayTurnInput;
import com.maco.ai.fallback.FallbackRules;
import com.maco.ai.fallback.PhotoMetrics;
import java.util.List;
import org.junit.jupiter.api.Test;

class FallbackRulesTest {

    private final FallbackRules rules = new FallbackRules();

    static final List<GradeInput.Criterion> COMPLAINT = List.of(
            new GradeInput.Criterion("EMPATHY", "공감", "공감 좋아요", "공감 먼저", "REPLY_NO_EMPATHY"),
            new GradeInput.Criterion("APOLOGY", "사과", "사과 좋아요", "사과하세요", "REPLY_NO_APOLOGY"),
            new GradeInput.Criterion("FIX", "개선 약속", "개선 좋아요", "개선 약속", "REPLY_NO_FIX"),
            new GradeInput.Criterion("REVISIT", "다시 오기", "재방문 좋아요", "다시 오라고", "REPLY_NO_REVISIT"),
            new GradeInput.Criterion("CALM", "변명 없음", "담백해요", "변명 빼기", "REPLY_DEFENSIVE"));

    @Test
    void 공감_사과_개선_다시오기가_모두_있으면_만점() {
        GradeOutput g = rules.grade(new GradeInput("REPLY_COMPLAINT", COMPLAINT, null,
                "미지근한 라떼를 드려 불편하셨겠어요. 정말 죄송합니다. 온도를 한 번 더 확인하겠습니다. 다음에 오시면 따뜻하게 드릴게요."));

        assertThat(g.score()).isEqualTo(100);
        assertThat(g.pass()).isTrue();
        assertThat(g.fix()).isNull();
    }

    @Test
    void 변명만_하면_통과하지_못하고_고칠_점은_하나() {
        GradeOutput g = rules.grade(new GradeInput("REPLY_COMPLAINT", COMPLAINT, null, "원래 저희 라떼는 그 온도예요."));

        assertThat(g.pass()).isFalse();
        assertThat(g.fix()).isEqualTo("공감 먼저");
        assertThat(g.errorTypes()).contains("REPLY_DEFENSIVE");
    }

    @Test
    void 손님은_사과를_들으면_마음이_풀리고_세_번째_답_뒤에는_끝난다() {
        var first = rules.roleplayTurn(new RoleplayTurnInput("RP", "", 3, 0, List.of(), "정말 죄송합니다"));
        var last = rules.roleplayTurn(new RoleplayTurnInput("RP", "", 3, 2, List.of(), "감사합니다"));

        assertThat(first.customerText()).startsWith("사과해 주시니");
        assertThat(first.last()).isFalse();
        assertThat(last.last()).isTrue();
    }

    @Test
    void 상황극_리포트는_고칠_문장을_최대_3개() {
        RoleplayReportOutput r = rules.roleplayReport(new RoleplayReportInput("RP", "REPLY_COMPLAINT", COMPLAINT, List.of(
                new RoleplayTurn("customer", "미지근했어요"), new RoleplayTurn("owner", "네"),
                new RoleplayTurn("customer", "..."), new RoleplayTurn("owner", "알겠습니다 그런데 원래 그래요"))));

        assertThat(r.lines()).hasSizeLessThanOrEqualTo(3).isNotEmpty();
        assertThat(r.lines().get(0).turn()).isEqualTo(1);
    }

    @Test
    void 오답_설명은_오류_유형_이름과_팁을_넣는다() {
        var e = rules.explain(new ExplainInput("PHOTO-CHOICE2-001", "?", "A", "PHOTO_LIGHT", "밝기", "창가에서", "어두워요."));

        assertThat(e.text()).contains("\"밝기\"").contains("창가에서");
    }

    @Test
    void 사진은_해상도와_상관없이_가로_160px로_줄여서_잰다() {
        java.awt.image.BufferedImage big = new java.awt.image.BufferedImage(1600, 1200, java.awt.image.BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g = big.createGraphics();
        g.setColor(java.awt.Color.WHITE);
        g.fillRect(0, 0, 1600, 1200);
        g.setColor(java.awt.Color.BLACK);
        for (int x = 0; x < 1600; x += 80) g.fillRect(x, 0, 40, 1200);
        g.dispose();

        PhotoMetrics.Measured m = PhotoMetrics.measure(big);

        assertThat(m.brightness()).isBetween(100.0, 160.0);
        assertThat(m.sharpness()).isGreaterThan(PhotoMetrics.MIN_SHARPNESS);
    }

    @Test
    void 사진은_어둡거나_흔들리면_통과하지_못한다() {
        assertThat(PhotoMetrics.judge(120, 10).pass()).isTrue();
        assertThat(PhotoMetrics.judge(40, 10).fix()).contains("어두워요");
        assertThat(PhotoMetrics.judge(120, 2).errorTypes()).containsExactly("PHOTO_BLUR");
    }
}

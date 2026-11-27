package com.maco.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.ai.client.AiClient;
import com.maco.ai.client.AiProperties;
import com.maco.ai.client.AiResult;
import com.maco.ai.client.AiSource;
import com.maco.ai.client.AiTask;
import com.maco.ai.dto.CaptureReadInput;
import com.maco.ai.dto.GradeInput;
import com.maco.ai.dto.GradeOutput;
import com.maco.ai.dto.Readings;
import com.maco.ai.fallback.FallbackRules;
import com.maco.ai.recorded.RecordedResponses;
import java.time.Clock;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class AiClientTest {

    private final RecordedResponses recorded = new RecordedResponses(JsonMapper.builder().build());

    private AiClient client(String mode) {
        return new AiClient(new AiProperties(mode, null, null, null, null), recorded, new FallbackRules(), Clock.systemUTC());
    }

    @Test
    void recorded_모드는_저장된_시연_응답을_준다() {
        AiResult<Readings> r = client("recorded").run(AiTask.CAPTURE_READ_PLACE,
                new CaptureReadInput("PLACE", "x.png", "owner-week4"), Readings.class);

        assertThat(r.source()).isEqualTo(AiSource.RECORDED);
        assertThat(r.data().reviews()).isEqualTo(21);
    }

    @Test
    void off_모드는_규칙_FALLBACK이고_화면용_데이터는_있다() {
        AiResult<Readings> r = client("off").run(AiTask.CAPTURE_READ_PLACE,
                new CaptureReadInput("PLACE", "x.png", null), Readings.class);

        assertThat(r.source()).isEqualTo(AiSource.FALLBACK);
        assertThat(r.ok()).isFalse();
        assertThat(r.data()).isNotNull();
    }

    @Test
    void 저장_응답이_없는_작업은_FALLBACK() {
        AiResult<GradeOutput> r = client("recorded").run(AiTask.REWRITE_GRADE,
                new GradeInput("REPLY_PRAISE", FallbackRulesTest.COMPLAINT, null, "감사해요"), GradeOutput.class);

        assertThat(r.source()).isEqualTo(AiSource.FALLBACK);
    }
}

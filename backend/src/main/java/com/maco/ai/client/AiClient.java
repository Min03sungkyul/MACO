package com.maco.ai.client;

import com.maco.ai.fallback.FallbackRules;
import com.maco.ai.recorded.RecordedResponses;
import java.time.Clock;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * AI 호출의 유일한 창구 (AGENTS.md 4장 ②, docs/01 5-4). AI 회사 API·SDK는 이 패키지 밖에서 쓰지 않는다.
 *
 * <pre>
 * AiResult&lt;GradeOutput&gt; r = aiClient.run(AiTask.REWRITE_GRADE, input, GradeOutput.class);
 * if (r.source() == AiSource.FALLBACK) { ... 규칙 문장이어도 화면은 그대로 동작 ... }
 * </pre>
 *
 * <p>순서: live(실제 AI) → recorded(저장 응답) → FALLBACK(규칙). ok는 FALLBACK이면 false지만 data는 항상 있다.
 * TODO(강민국): live 모드 — LiveAiProvider(provider별 어댑터)로 prompts/&lt;task&gt;.md + 입력 → JSON 출력 → 형식 검사
 * → 틀리면 1번 재시도 → 그래도 틀리면 FALLBACK. ai_cache 재사용, ai_log에 토큰·비용·시간 기록.
 * 이미지는 긴 변 1568px 이하로 줄여 보내고, 사용자 이름·연락처는 프롬프트에 넣지 않는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiClient {

    private final AiProperties props;
    private final RecordedResponses recorded;
    private final FallbackRules fallback;
    private final Clock clock;

    public <T> AiResult<T> run(AiTask task, Object input, Class<T> outputType) {
        long start = clock.millis();
        AiMode mode = props.aiMode();
        String key = input instanceof AiInput in ? in.matchKey() : "default";

        if (mode == AiMode.LIVE) {
            log.debug("AI live 모드는 아직 준비 중이라 저장 응답·규칙으로 대신합니다: {}", task);
        }
        if (mode != AiMode.OFF) {
            Optional<T> saved = recorded.find(task, key, outputType);
            if (saved.isPresent()) {
                return new AiResult<>(true, AiSource.RECORDED, saved.get(), clock.millis() - start);
            }
        }
        T data = outputType.cast(fallback.produce(task, input));
        return new AiResult<>(false, AiSource.FALLBACK, data, clock.millis() - start);
    }
}

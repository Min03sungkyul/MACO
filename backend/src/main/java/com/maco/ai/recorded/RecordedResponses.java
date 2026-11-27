package com.maco.ai.recorded;

import com.maco.ai.client.AiTask;
import java.io.IOException;
import java.io.InputStream;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * 시연용 저장 응답 (AI_MODE=recorded). resources/ai/recorded/<TASK>.json 의 { "matchKey": 출력 } 을 읽는다.
 * TODO(강민국): 시연 계정 2개의 모든 AI 입력에 저장 응답 채우기 (기획서 12장: 인터넷이 느려도 멈추지 않게).
 * TODO(강민국): DB ai_recorded 테이블도 함께 찾기 (live로 받은 좋은 응답을 시연용으로 저장).
 */
@Slf4j
@Component
public class RecordedResponses {

    private final JsonMapper json;
    private final Map<AiTask, JsonNode> byTask = new EnumMap<>(AiTask.class);

    public RecordedResponses(JsonMapper json) {
        this.json = json;
        try {
            for (Resource r : new PathMatchingResourcePatternResolver().getResources("classpath*:ai/recorded/*.json")) {
                String name = r.getFilename();
                if (name == null) continue;
                try (InputStream in = r.getInputStream()) {
                    byTask.put(AiTask.valueOf(name.replace(".json", "")), json.readTree(in));
                } catch (IllegalArgumentException e) {
                    log.warn("알 수 없는 AiTask 저장 응답 파일: {}", name);
                }
            }
        } catch (IOException e) {
            log.warn("저장 응답을 읽지 못했어요", e);
        }
    }

    public <T> Optional<T> find(AiTask task, String matchKey, Class<T> type) {
        JsonNode all = byTask.get(task);
        if (all == null) {
            return Optional.empty();
        }
        JsonNode node = all.get(matchKey);
        if (node == null) {
            node = all.get("default");
        }
        return node == null ? Optional.empty() : Optional.of(json.treeToValue(node, type));
    }
}

package com.maco.content.loader;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

/**
 * content/*.csv → DB (담당: 박민하·이동성). local 프로필에서 서버를 켤 때마다 다시 넣는다(덮어쓰기).
 * CSV 열 이름 = DB 컬럼 이름. DB에 없는 열(legacy_id, reviewed_by 등)은 무시한다.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "maco.content.load-on-start", havingValue = "true")
public class ContentLoader implements ApplicationRunner {

    /** 파일 → 테이블. 순서가 중요하다 (외래 키). */
    private static final Map<String, String> FILES = new LinkedHashMap<>();

    static {
        FILES.put("skills.csv", "skill");
        FILES.put("concept_cards.csv", "concept_card");
        FILES.put("lessons.csv", "lesson");
        FILES.put("error_types.csv", "error_type");
        FILES.put("items.csv", "item");
        FILES.put("hotspots.csv", "hotspot");
        FILES.put("rubrics.csv", "rubric");
        FILES.put("roleplay_scenarios.csv", "roleplay_scenario");
        FILES.put("practice_stores.csv", "practice_store");
    }

    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    @Value("${maco.content.dir:../content}")
    private String contentDir;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        Path dir = Path.of(contentDir);
        if (!Files.isDirectory(dir)) {
            log.warn("콘텐츠 폴더가 없어 적재를 건너뜁니다: {}", dir.toAbsolutePath());
            return;
        }
        for (var e : FILES.entrySet()) {
            Path file = dir.resolve(e.getKey());
            if (!Files.exists(file)) {
                continue;
            }
            List<Map<String, String>> rows = CsvReader.read(Files.readString(file, StandardCharsets.UTF_8));
            int n = upsert(e.getValue(), rows);
            log.info("콘텐츠 적재: {} → {} {}행", e.getKey(), e.getValue(), n);
        }
    }

    private int upsert(String table, List<Map<String, String>> rows) {
        if (rows.isEmpty()) {
            return 0;
        }
        Set<String> columns = new HashSet<>(jdbc.queryForList(
                "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
                String.class, table).stream().map(String::toLowerCase).toList());
        int count = 0;
        for (Map<String, String> raw : rows) {
            Map<String, Object> row = new LinkedHashMap<>();
            raw.forEach((k, v) -> {
                if (columns.contains(k.toLowerCase())) {
                    row.put(k, convert(v));
                }
            });
            if ("item".equals(table)) {
                row.put("choices_json", json.writeValueAsString(ItemChoices.fromRow(raw)));
            }
            if (row.isEmpty()) {
                continue;
            }
            List<String> cols = new ArrayList<>(row.keySet());
            String sql = "INSERT INTO " + table + " (" + cols.stream().map(c -> "`" + c + "`").collect(Collectors.joining(","))
                    + ") VALUES (" + cols.stream().map(c -> "?").collect(Collectors.joining(","))
                    + ") ON DUPLICATE KEY UPDATE " + cols.stream().map(c -> "`" + c + "`=VALUES(`" + c + "`)")
                    .collect(Collectors.joining(","));
            jdbc.update(sql, cols.stream().map(row::get).toArray());
            count++;
        }
        return count;
    }

    /** 빈 칸 → NULL, true/false → 1/0 */
    static Object convert(String v) {
        if (v == null || v.isEmpty()) {
            return null;
        }
        if ("true".equalsIgnoreCase(v)) {
            return 1;
        }
        if ("false".equalsIgnoreCase(v)) {
            return 0;
        }
        return v;
    }
}

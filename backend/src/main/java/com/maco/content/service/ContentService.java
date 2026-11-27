package com.maco.content.service;

import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.content.dto.ChoiceDto;
import com.maco.content.dto.ConceptCardDto;
import com.maco.content.dto.ErrorTypeDto;
import com.maco.content.dto.HotspotDto;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.ItemKey;
import com.maco.content.dto.LessonDto;
import com.maco.content.dto.PracticeStoreDto;
import com.maco.content.dto.RubricCriterionDto;
import com.maco.content.dto.ScenarioDto;
import com.maco.content.dto.SkillDto;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

/**
 * 문제·개념 카드·오류 유형 등 콘텐츠 읽기 (담당: 이동성). 콘텐츠 행은 CSV 적재기가 넣는다.
 * 다른 패키지는 이 서비스로만 콘텐츠를 읽는다 (AGENTS.md 4장 ⑦).
 * 콘텐츠는 바뀌지 않는 읽기 전용 데이터라 엔티티 대신 JdbcTemplate으로 읽는다.
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ContentService {

    private static final TypeReference<List<Map<String, String>>> CHOICES = new TypeReference<>() { };

    private final NamedParameterJdbcTemplate jdbc;
    private final JsonMapper json;

    public List<SkillDto> skills() {
        return jdbc.query("SELECT * FROM skill ORDER BY unit_order", (rs, i) -> new SkillDto(
                rs.getString("code"), rs.getString("name"), rs.getString("gate"), rs.getInt("unit_order"),
                rs.getString("can_lv1"), rs.getString("can_lv3"), rs.getString("can_lv5"), rs.getBoolean("ready")));
    }

    public List<LessonDto> lessons() {
        return jdbc.query("SELECT * FROM lesson ORDER BY skill_code, seq", (rs, i) -> lesson(rs));
    }

    public LessonDto lesson(Long id) {
        return jdbc.query("SELECT * FROM lesson WHERE id = :id", Map.of("id", id), (rs, i) -> lesson(rs))
                .stream().findFirst().orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "레슨을 찾을 수 없어요"));
    }

    public Optional<ConceptCardDto> conceptCard(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return jdbc.query("SELECT * FROM concept_card WHERE id = :id", Map.of("id", id), (rs, i) -> new ConceptCardDto(
                rs.getLong("id"), rs.getString("skill_code"), rs.getInt("level"), rs.getString("title"),
                rs.getString("body"), rs.getString("evidence"), rs.getString("image"))).stream().findFirst();
    }

    public Optional<ErrorTypeDto> errorType(String code) {
        if (code == null) {
            return Optional.empty();
        }
        return jdbc.query("SELECT * FROM error_type WHERE code = :code", Map.of("code", code), (rs, i) -> new ErrorTypeDto(
                rs.getString("code"), rs.getString("skill_code"), rs.getString("name"), rs.getString("description"),
                rs.getString("fix_tip"))).stream().findFirst();
    }

    /** 활성 문제 (스킬 목록, 시작 난이도 이하) — 출제 후보 */
    public List<ItemDto> activeItems(Collection<String> skillCodes, int maxInitDifficulty) {
        if (skillCodes.isEmpty()) {
            return List.of();
        }
        var params = new MapSqlParameterSource().addValue("skills", skillCodes).addValue("max", maxInitDifficulty);
        List<ItemDto> items = jdbc.query("""
                SELECT * FROM item WHERE active = TRUE AND skill_code IN (:skills) AND init_difficulty <= :max
                ORDER BY init_difficulty, code""", params, (rs, i) -> item(rs, List.of()));
        return items.stream().map(this::withHotspots).toList();
    }

    public ItemDto item(Long id) {
        return jdbc.query("SELECT * FROM item WHERE id = :id", Map.of("id", id), (rs, i) -> item(rs, List.of()))
                .stream().findFirst().map(this::withHotspots)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));
    }

    /** 채점용 정답 정보 */
    public ItemKey itemKey(Long id) {
        return jdbc.query("SELECT * FROM item WHERE id = :id", Map.of("id", id), (rs, i) -> {
            Map<String, String> errors = new LinkedHashMap<>();
            for (Map<String, String> c : parseChoices(rs.getString("choices_json"))) {
                if (c.get("errorType") != null) {
                    errors.put(c.get("key"), c.get("errorType"));
                }
            }
            if ("SPOT".equals(rs.getString("type"))) {
                // 틀린 곳 찾기는 조각별 오류 유형
                hotspotRows(rs.getString("code")).forEach(h -> {
                    if (h.errorType != null) {
                        errors.put(h.partKey, h.errorType);
                    }
                });
            }
            return new ItemKey(rs.getLong("id"), rs.getString("code"), rs.getString("skill_code"), rs.getString("type"),
                    rs.getString("answer"), errors, rs.getString("rubric_code"), rs.getString("explanation"),
                    nullableLong(rs, "concept_card_id"), rs.getString("sample_answer"), rs.getInt("init_difficulty"),
                    (Double) rs.getObject("difficulty"));
        }).stream().findFirst().orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));
    }

    public List<RubricCriterionDto> rubric(String code) {
        return jdbc.query("SELECT * FROM rubric WHERE code = :code ORDER BY seq", Map.of("code", code),
                (rs, i) -> new RubricCriterionDto(rs.getString("code"), rs.getString("criterion_key"),
                        rs.getString("criterion"), rs.getDouble("weight"), rs.getString("good"), rs.getString("fix"),
                        rs.getString("error_type_code")));
    }

    public List<ScenarioDto> scenarios() {
        return jdbc.query("SELECT * FROM roleplay_scenario ORDER BY id", (rs, i) -> scenario(rs));
    }

    public ScenarioDto scenario(Long id) {
        return jdbc.query("SELECT * FROM roleplay_scenario WHERE id = :id", Map.of("id", id), (rs, i) -> scenario(rs))
                .stream().findFirst().orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "상황극을 찾을 수 없어요"));
    }

    public List<PracticeStoreDto> practiceStores() {
        return jdbc.query("SELECT * FROM practice_store ORDER BY id", (rs, i) -> new PracticeStoreDto(
                rs.getLong("id"), rs.getString("code"), rs.getString("store_type"), rs.getString("name"),
                rs.getString("place_image"), rs.getString("insta_image"), rs.getString("menu_json"),
                rs.getString("reviews_json"), rs.getString("gate_preset_json")));
    }

    // ───────── 내부 ─────────

    private record HotspotRow(String partKey, String label, Integer stars, String errorType, Double x, Double y,
                              Double w, Double h) {
    }

    private List<HotspotRow> hotspotRows(String itemCode) {
        return jdbc.query("SELECT * FROM hotspot WHERE owner_type = 'ITEM' AND owner_code = :code ORDER BY seq",
                Map.of("code", itemCode), (rs, i) -> new HotspotRow(rs.getString("part_key"), rs.getString("label"),
                        (Integer) rs.getObject("stars", Integer.class), rs.getString("error_type_code"),
                        (Double) rs.getObject("x"), (Double) rs.getObject("y"), (Double) rs.getObject("w"),
                        (Double) rs.getObject("h")));
    }

    private ItemDto withHotspots(ItemDto it) {
        if (!"SPOT".equals(it.type())) {
            return it;
        }
        List<HotspotDto> hs = hotspotRows(it.code()).stream()
                .map(h -> new HotspotDto(h.partKey, h.label, h.stars, h.x, h.y, h.w, h.h)).toList();
        return new ItemDto(it.id(), it.code(), it.skillCode(), it.type(), it.prompt(), it.context(), it.media(),
                it.choices(), hs, it.rubricCode(), it.conceptCardId(), it.initDifficulty());
    }

    private ItemDto item(ResultSet rs, List<HotspotDto> hotspots) throws SQLException {
        List<ChoiceDto> choices = parseChoices(rs.getString("choices_json")).stream()
                .map(c -> new ChoiceDto(c.get("key"), c.get("text"), c.get("image"))).toList();
        return new ItemDto(rs.getLong("id"), rs.getString("code"), rs.getString("skill_code"), rs.getString("type"),
                rs.getString("prompt"), rs.getString("context"), rs.getString("media"), choices, hotspots,
                rs.getString("rubric_code"), nullableLong(rs, "concept_card_id"), rs.getInt("init_difficulty"));
    }

    private LessonDto lesson(ResultSet rs) throws SQLException {
        return new LessonDto(rs.getLong("id"), rs.getString("skill_code"), rs.getInt("level"), rs.getInt("seq"),
                rs.getString("title"), nullableLong(rs, "concept_card_id"), rs.getInt("item_count"));
    }

    private ScenarioDto scenario(ResultSet rs) throws SQLException {
        return new ScenarioDto(rs.getLong("id"), rs.getString("code"), rs.getString("skill_code"), rs.getString("title"),
                rs.getString("persona"), rs.getString("opening_line"), rs.getInt("max_turns"), rs.getString("rubric_code"));
    }

    private List<Map<String, String>> parseChoices(String raw) {
        return raw == null || raw.isBlank() ? List.of() : json.readValue(raw, CHOICES);
    }

    private static Long nullableLong(ResultSet rs, String col) throws SQLException {
        long v = rs.getLong(col);
        return rs.wasNull() ? null : v;
    }
}

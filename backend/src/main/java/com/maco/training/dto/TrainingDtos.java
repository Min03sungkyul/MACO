package com.maco.training.dto;

import com.maco.ai.client.AiSource;
import com.maco.ai.dto.GradeOutput;
import com.maco.content.dto.ConceptCardDto;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.LessonDto;
import com.maco.xp.dto.XpResult;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/** 📚 트레이닝 API의 요청·응답 (담당: 주승준). 프론트 타입: frontend/src/lib/types/training.ts */
public final class TrainingDtos {

    private TrainingDtos() {
    }

    /** 경로 노드 상태 */
    public enum NodeStatus { LOCKED, OPEN, DONE }

    public record PathNode(Long lessonId, int level, String title, NodeStatus status, Integer bestAccuracy) {
    }

    public record PathUnit(String skillCode, String name, String gate, boolean ready, int skillLevel,
                           List<PathNode> nodes) {
    }

    /** GET /training/path — S6 */
    public record PathResponse(List<PathUnit> units) {
    }

    /** GET /training/today — S6 오늘의 추천 레슨 */
    public record TodayResponse(Long lessonId, String title, String reason, int reviewDueCount, List<String> weakErrorTypes) {
    }

    /** POST /lessons/{lessonId}/sessions — S7, S8 */
    public record SessionResponse(Long sessionId, LessonDto lesson, ConceptCardDto conceptCard, List<ItemDto> items) {
    }

    /** POST /lessons/sessions/{sessionId}/finish */
    public record FinishRequest(@NotNull Long lessonId, int correctCount, int totalCount) {
    }

    /** 레슨 완료 — S10 */
    public record FinishResponse(int accuracy, XpResult xp, String weakReport) {
    }

    /** POST /rewrite/grade — S8 고쳐 쓰기 */
    public record RewriteGradeRequest(@NotNull Long itemId, @NotNull String text) {
    }

    public record RewriteGradeResponse(GradeOutput feedback, AiSource source, String sampleAnswer) {
    }

    /** GET /placement — S4 */
    public record PlacementResponse(List<ItemDto> items) {
    }

    public record PlacementAnswer(@NotNull Long itemId, String answer) {
    }

    public record PlacementSubmitRequest(@NotNull List<PlacementAnswer> answers) {
    }

    /** 스킬별 시작 실력 */
    public record PlacementResult(Map<String, Integer> levels, int correctCount, int totalCount) {
    }
}

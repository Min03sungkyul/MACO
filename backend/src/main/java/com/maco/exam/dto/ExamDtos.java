package com.maco.exam.dto;

import com.maco.ai.client.AiSource;
import com.maco.ai.dto.RoleplayReportOutput;
import com.maco.ai.dto.RoleplayTurn;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.ScenarioDto;
import com.maco.skill.dto.AttemptResult;
import com.maco.xp.dto.XpResult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** 📝 시험 API의 요청·응답 (담당: 이동성). 프론트 타입: frontend/src/lib/types/exam.ts */
public final class ExamDtos {

    private ExamDtos() {
    }

    /** GET /exam/home — S11 */
    public record ExamHome(boolean quizDoneToday, Integer quizScore, int wrongNoteCount, ScenarioDto todayScenario) {
    }

    /** POST /quizzes/daily — S12 */
    public record QuizResponse(Long quizId, LocalDate quizDate, List<ItemDto> items) {
    }

    public record QuizAnswer(@NotNull Long itemId, String answer) {
    }

    public record QuizSubmitRequest(@NotNull List<QuizAnswer> answers) {
    }

    /** 100점 만점 점수, 문제별 결과, XP(정답당 4 + 만점 10) */
    public record QuizResult(int score, List<AttemptResult> results, XpResult xp) {
    }

    /** GET /wrong-notes — S13 */
    public record WrongNote(ItemDto item, int wrongCount, LocalDate nextReviewDate) {
    }

    public record RoleplayStartRequest(@NotNull Long scenarioId) {
    }

    /** 상황극 세션 — S14. notice: "연습용 가상 상황이에요" */
    public record RoleplaySession(Long sessionId, ScenarioDto scenario, List<RoleplayTurn> turns, boolean finished,
                                  String notice) {
    }

    public record RoleplayTurnRequest(@NotBlank @Size(max = 500) String text) {
    }

    public record RoleplayTurnResponse(String customerText, boolean last, AiSource source) {
    }

    /** 루브릭 점수, 잘한 점, 고칠 문장 3개, XP */
    public record RoleplayFinishResponse(RoleplayReportOutput report, AiSource source, XpResult xp) {
    }
}

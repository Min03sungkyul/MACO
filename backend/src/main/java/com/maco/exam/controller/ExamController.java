package com.maco.exam.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.content.dto.ScenarioDto;
import com.maco.exam.dto.ExamDtos.ExamHome;
import com.maco.exam.dto.ExamDtos.QuizResponse;
import com.maco.exam.dto.ExamDtos.QuizResult;
import com.maco.exam.dto.ExamDtos.QuizSubmitRequest;
import com.maco.exam.dto.ExamDtos.RoleplayFinishResponse;
import com.maco.exam.dto.ExamDtos.RoleplaySession;
import com.maco.exam.dto.ExamDtos.RoleplayStartRequest;
import com.maco.exam.dto.ExamDtos.RoleplayTurnRequest;
import com.maco.exam.dto.ExamDtos.RoleplayTurnResponse;
import com.maco.exam.dto.ExamDtos.WrongNote;
import com.maco.exam.service.QuizService;
import com.maco.exam.service.RoleplayService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 📝 시험 (담당: 이동성) — docs/03 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ExamController {

    private final QuizService quizService;
    private final RoleplayService roleplayService;

    @GetMapping("/exam/home")
    public ApiResponse<ExamHome> home(@CurrentUser Long userId) {
        return ApiResponse.ok(quizService.home(userId, roleplayService.scenarios().stream().findFirst().orElse(null)));
    }

    @PostMapping("/quizzes/daily")
    public ApiResponse<QuizResponse> daily(@CurrentUser Long userId) {
        return ApiResponse.ok(quizService.createDaily(userId));
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ApiResponse<QuizResult> submit(@CurrentUser Long userId, @PathVariable Long quizId,
                                          @Valid @RequestBody QuizSubmitRequest req) {
        return ApiResponse.ok(quizService.submit(userId, quizId, req.answers()));
    }

    @GetMapping("/wrong-notes")
    public ApiResponse<List<WrongNote>> wrongNotes(@CurrentUser Long userId) {
        return ApiResponse.ok(quizService.wrongNotes(userId));
    }

    @GetMapping("/roleplay/scenarios")
    public ApiResponse<List<ScenarioDto>> scenarios() {
        return ApiResponse.ok(roleplayService.scenarios());
    }

    @PostMapping("/roleplay/sessions")
    public ApiResponse<RoleplaySession> start(@CurrentUser Long userId, @Valid @RequestBody RoleplayStartRequest req) {
        return ApiResponse.ok(roleplayService.start(userId, req.scenarioId()));
    }

    @PostMapping("/roleplay/sessions/{id}/turns")
    public ApiResponse<RoleplayTurnResponse> turn(@CurrentUser Long userId, @PathVariable Long id,
                                                  @Valid @RequestBody RoleplayTurnRequest req) {
        return ApiResponse.ok(roleplayService.turn(userId, id, req.text()));
    }

    @PostMapping("/roleplay/sessions/{id}/finish")
    public ApiResponse<RoleplayFinishResponse> finish(@CurrentUser Long userId, @PathVariable Long id) {
        return ApiResponse.ok(roleplayService.finish(userId, id));
    }
}

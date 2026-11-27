package com.maco.training.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.training.dto.TrainingDtos.FinishRequest;
import com.maco.training.dto.TrainingDtos.FinishResponse;
import com.maco.training.dto.TrainingDtos.PathResponse;
import com.maco.training.dto.TrainingDtos.PlacementResponse;
import com.maco.training.dto.TrainingDtos.PlacementResult;
import com.maco.training.dto.TrainingDtos.PlacementSubmitRequest;
import com.maco.training.dto.TrainingDtos.RewriteGradeRequest;
import com.maco.training.dto.TrainingDtos.RewriteGradeResponse;
import com.maco.training.dto.TrainingDtos.SessionResponse;
import com.maco.training.dto.TrainingDtos.TodayResponse;
import com.maco.training.service.TrainingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 📚 트레이닝 + 배치 테스트 (담당: 주승준) — docs/03 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    @GetMapping("/training/path")
    public ApiResponse<PathResponse> path(@CurrentUser Long userId) {
        return ApiResponse.ok(trainingService.path(userId));
    }

    @GetMapping("/training/today")
    public ApiResponse<TodayResponse> today(@CurrentUser Long userId) {
        return ApiResponse.ok(trainingService.today(userId));
    }

    @PostMapping("/lessons/{lessonId}/sessions")
    public ApiResponse<SessionResponse> start(@CurrentUser Long userId, @PathVariable Long lessonId) {
        return ApiResponse.ok(trainingService.startLesson(userId, lessonId));
    }

    @PostMapping("/lessons/sessions/{sessionId}/finish")
    public ApiResponse<FinishResponse> finish(@CurrentUser Long userId, @PathVariable Long sessionId,
                                              @Valid @RequestBody FinishRequest req) {
        return ApiResponse.ok(trainingService.finishLesson(userId, sessionId, req));
    }

    @PostMapping("/rewrite/grade")
    public ApiResponse<RewriteGradeResponse> grade(@Valid @RequestBody RewriteGradeRequest req) {
        return ApiResponse.ok(trainingService.gradeRewrite(req.itemId(), req.text()));
    }

    @GetMapping("/placement")
    public ApiResponse<PlacementResponse> placement() {
        return ApiResponse.ok(trainingService.placement());
    }

    @PostMapping("/placement/submit")
    public ApiResponse<PlacementResult> submitPlacement(@CurrentUser Long userId, @Valid @RequestBody PlacementSubmitRequest req) {
        return ApiResponse.ok(trainingService.submitPlacement(userId, req.answers()));
    }
}

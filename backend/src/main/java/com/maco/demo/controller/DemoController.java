package com.maco.demo.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.demo.service.DemoService;
import com.maco.demo.service.DemoService.DayResult;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 🎬 시연 도구 (시연 계정만, 담당: 박민하) — docs/03 */
@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
public class DemoController {

    private final DemoService demoService;

    public record SkipRequest(@Min(1) @Max(60) int days) {
    }

    @PostMapping("/skip-days")
    public ApiResponse<DayResult> skip(@CurrentUser Long userId, @Valid @RequestBody SkipRequest req) {
        return ApiResponse.ok(demoService.skipDays(userId, req.days()));
    }

    @PostMapping("/reset")
    public ApiResponse<DayResult> reset(@CurrentUser Long userId) {
        return ApiResponse.ok(demoService.reset(userId));
    }
}

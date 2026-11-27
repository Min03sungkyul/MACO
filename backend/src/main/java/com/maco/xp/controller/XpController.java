package com.maco.xp.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.xp.dto.StatusResponse;
import com.maco.xp.service.XpService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class XpController {

    private final XpService xpService;

    /** 상단 바: 오늘 XP, 목표, 스트릭 */
    @GetMapping("/me/status")
    public ApiResponse<StatusResponse> status(@CurrentUser Long userId) {
        return ApiResponse.ok(xpService.status(userId));
    }

    /** 바쁜 날 2분 복습을 마쳤을 때 → 오늘 스트릭 유지 (기획서 C3) */
    @PostMapping("/streak/busy-review")
    public ApiResponse<StatusResponse> busyReview(@CurrentUser Long userId) {
        return ApiResponse.ok(xpService.keepStreakWithBusyReview(userId));
    }
}

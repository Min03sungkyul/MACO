package com.maco.user.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.user.dto.MeResponse;
import com.maco.user.dto.RegionDto;
import com.maco.user.dto.SettingsRequest;
import com.maco.user.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MeController {

    private final UserService userService;

    /** 내 정보, 모드, 목표, 지역, today(가상 날짜) — S전체 */
    @GetMapping("/me")
    public ApiResponse<MeResponse> me(@CurrentUser Long userId) {
        return ApiResponse.ok(userService.getMe(userId));
    }

    /** 모드, 업종, 일일 목표, 습관 고리, 지역, 공개 범위, 리그 끄기 — S2, S5, S26 */
    @PatchMapping("/me/settings")
    public ApiResponse<MeResponse> updateSettings(@CurrentUser Long userId, @Valid @RequestBody SettingsRequest req) {
        return ApiResponse.ok(userService.updateSettings(userId, req));
    }

    /** 지역 목록 (로그인 없이) — S5 */
    @GetMapping("/regions")
    public ApiResponse<List<RegionDto>> regions(@RequestParam(required = false) String sido) {
        return ApiResponse.ok(userService.regions(sido));
    }
}

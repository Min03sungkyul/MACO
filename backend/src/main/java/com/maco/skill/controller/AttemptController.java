package com.maco.skill.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.skill.dto.AttemptRequest;
import com.maco.skill.dto.AttemptResult;
import com.maco.skill.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AttemptController {

    private final SkillService skillService;

    /** 문제 하나 풀이 기록·채점. 레슨·쪽지시험·오답 노트·배치 테스트가 모두 사용 — S8, S12, S13 */
    @PostMapping("/attempts")
    public ApiResponse<AttemptResult> record(@CurrentUser Long userId, @Valid @RequestBody AttemptRequest req) {
        return ApiResponse.ok(skillService.record(userId, req));
    }
}

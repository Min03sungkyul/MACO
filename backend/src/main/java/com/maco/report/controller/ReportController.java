package com.maco.report.controller;

import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.report.dto.ReportDtos.Badge;
import com.maco.report.dto.ReportDtos.Report;
import com.maco.report.dto.ReportDtos.SkillLevel;
import com.maco.report.dto.ReportDtos.Stats;
import com.maco.report.service.ReportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 👤 내 정보 (담당: 박민하) — docs/03 */
@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/stats")
    public ApiResponse<Stats> stats(@CurrentUser Long userId) {
        return ApiResponse.ok(reportService.stats(userId));
    }

    @GetMapping("/report")
    public ApiResponse<Report> report(@CurrentUser Long userId, @RequestParam(defaultValue = "4") int weeks) {
        return ApiResponse.ok(reportService.report(userId, weeks));
    }

    @GetMapping("/skills")
    public ApiResponse<List<SkillLevel>> skills(@CurrentUser Long userId) {
        return ApiResponse.ok(reportService.skills(userId));
    }

    @GetMapping("/badges")
    public ApiResponse<List<Badge>> badges(@CurrentUser Long userId) {
        return ApiResponse.ok(reportService.badges(userId));
    }
}

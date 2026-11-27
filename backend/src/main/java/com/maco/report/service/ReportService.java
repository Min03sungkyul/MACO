package com.maco.report.service;

import com.maco.common.time.AppClock;
import com.maco.content.service.ContentService;
import com.maco.report.dto.ReportDtos.Badge;
import com.maco.report.dto.ReportDtos.Report;
import com.maco.report.dto.ReportDtos.SkillLevel;
import com.maco.report.dto.ReportDtos.Stats;
import com.maco.report.dto.ReportDtos.WeekPoint;
import com.maco.skill.domain.SkillPolicy;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 학습 기록·성장 리포트·스킬 맵 (담당: 박민하). 화면 S25.
 * TODO(박민하): xp_log·daily_goal·attempt·user_skill·gate_check(StoreService에 조회 요청 → 강민국)에서 집계.
 * 4주 넘기기 뒤에는 예시 기록 4주치가 그래프에 나와야 한다 (기획서 12-1).
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ContentService contentService;
    private final AppClock appClock;

    public Stats stats(Long userId) {
        return new Stats(0, 0, 0, 0, 0, 0, 0, 0);
    }

    public Report report(Long userId, int weeks) {
        LocalDate week = appClock.weekStart(userId);
        List<WeekPoint> points = new ArrayList<>();
        for (int i = Math.max(1, Math.min(weeks, 12)) - 1; i >= 0; i--) {
            points.add(new WeekPoint(week.minusWeeks(i), SkillPolicy.THETA_START, null, null, null, 0));
        }
        return new Report(points);
    }

    public List<SkillLevel> skills(Long userId) {
        return contentService.skills().stream()
                .map(s -> new SkillLevel(s.code(), s.name(), SkillPolicy.level(SkillPolicy.THETA_START),
                        SkillPolicy.THETA_START, s.ready()))
                .toList();
    }

    /** 배지 (P1) */
    public List<Badge> badges(Long userId) {
        return List.of(new Badge("FIRST_PERFECT", "첫 만점", false), new Badge("STREAK_7", "7일 연속", false),
                new Badge("FIRST_MISSION", "첫 실전 미션", false));
    }
}

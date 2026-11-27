package com.maco.xp.service;

import com.maco.common.time.AppClock;
import com.maco.user.service.UserService;
import com.maco.xp.domain.XpPolicy;
import com.maco.xp.domain.XpReason;
import com.maco.xp.dto.StatusResponse;
import com.maco.xp.dto.XpResult;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * XP 적립 (담당: 박민하). 모든 탭은 xp_log에 직접 쓰지 않고 이것만 부른다 (AGENTS.md 4장 ③).
 *
 * <p>지금은 스텁: 배점만 계산해 돌려주고 저장하지 않는다.
 * TODO(박민하): prototype/lib/train/engine.ts의 record·addXp·streak·streakBonus를 옮겨 실제로 저장한다.
 * <ul>
 *   <li>xp_log INSERT (user_id, source_key) UNIQUE → 같은 sourceKey는 두 번 주지 않는다</li>
 *   <li>오늘 같은 문제 반복 횟수 → XpPolicy.apply(base, repeat, earnedToday)</li>
 *   <li>daily_goal 갱신 → 목표를 처음 넘으면 goalAchievedNow=true, streak 갱신, 7일이면 STREAK_7</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class XpService {

    private final AppClock appClock;
    private final UserService userService;

    public XpResult award(Long userId, XpReason reason, String sourceKey) {
        return stub(userId, XpPolicy.apply(XpPolicy.amount(reason), 0, 0));
    }

    /** 상황극처럼 점수에 따라 XP가 달라질 때 (0~100) */
    public XpResult awardScore(Long userId, XpReason reason, String sourceKey, int score0to100) {
        return stub(userId, XpPolicy.apply(XpPolicy.roleplayXp(score0to100), 0, 0));
    }

    /** XP 없이 지금 상태만 (배치 테스트, 쪽지시험 오답 등) */
    public XpResult current(Long userId) {
        StatusResponse s = status(userId);
        return XpResult.none(s.todayXp(), s.goalXp(), s.streakDays());
    }

    /** 상단 바용 오늘 상태 */
    public StatusResponse status(Long userId) {
        LocalDate today = appClock.today(userId);
        int goal = userService.getSummary(userId).dailyGoalXp();
        // TODO(박민하): daily_goal·streak 테이블에서 읽기. needsRestart = 2일 이상 쉼 (기획서 C6)
        return new StatusResponse(today, 0, goal, false, 0, 0, 0, false);
    }

    /**
     * 바쁜 날 2분 복습으로 오늘 스트릭 유지 (기획서 C3).
     * TODO(박민하): daily_goal.busy_kept = true, achieved 처리, streak 갱신 (prototype markBusy·goalMet)
     */
    public StatusResponse keepStreakWithBusyReview(Long userId) {
        StatusResponse s = status(userId);
        return new StatusResponse(s.today(), s.todayXp(), s.goalXp(), true, s.streakDays(), s.trainingSeconds(),
                s.solvedCount(), false);
    }

    private XpResult stub(Long userId, int gained) {
        int goal = userService.getSummary(userId).dailyGoalXp();
        return new XpResult(gained, gained, goal, false, 0, List.of());
    }
}

package com.maco.skill.service;

import com.maco.common.time.AppClock;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.ItemKey;
import com.maco.content.service.ContentService;
import com.maco.skill.domain.Grader;
import com.maco.skill.domain.SkillPolicy;
import com.maco.skill.dto.AttemptRequest;
import com.maco.skill.dto.AttemptResult;
import com.maco.skill.dto.PickRequest;
import com.maco.xp.domain.XpReason;
import com.maco.xp.dto.XpResult;
import com.maco.xp.service.XpService;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 학습자 모델·Elo 출제 엔진 (담당: 박민하). 트레이닝·시험이 같이 쓴다 (AGENTS.md 4장 ④).
 *
 * <p>지금 동작: 정답 채점(Grader), 문제 고르기(시작 난이도 기준 θ=0으로 p≈0.7 근처), XP 적립 호출.
 * TODO(박민하): prototype/lib/train/engine.ts를 옮겨 아래를 저장·반영한다.
 * <ul>
 *   <li>pick: user_skill.θ, item.difficulty로 SkillPolicy.pickScore + 복습 예정(+1) + 약점 오류 유형(+0.2) − 오늘 본 문제(0.5)</li>
 *   <li>record: attempt 저장 → θ·d 갱신(SkillPolicy.nextTheta/nextDifficulty) → 오답이면 wrong_note·복습 날짜
 *       → 오류 유형 연속 3번이면 weakNote → 레벨 변화는 XpResult.levelUps</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class SkillService {

    private final ContentService contentService;
    private final XpService xpService;
    private final AppClock appClock;

    public List<ItemDto> pick(Long userId, PickRequest req) {
        double theta = SkillPolicy.THETA_START; // TODO(박민하): user_skill에서 읽기
        List<Long> exclude = req.excludeIds() == null ? List.of() : req.excludeIds();
        int maxLevel = req.maxLevel() <= 0 ? 5 : req.maxLevel();
        return contentService.activeItems(req.skills(), maxLevel).stream()
                .filter(it -> !exclude.contains(it.id()))
                .sorted(Comparator.comparingDouble((ItemDto it) ->
                        -SkillPolicy.pickScore(theta, SkillPolicy.initialDifficulty(it.initDifficulty()))))
                .limit(req.count())
                .toList();
    }

    public AttemptResult record(Long userId, AttemptRequest req) {
        ItemKey key = contentService.itemKey(req.itemId());
        Grader.Graded g = Grader.grade(key, req.answer(), req.score());
        LocalDate today = appClock.today(userId);

        // 배치 테스트는 XP 없음, 쪽지시험은 정답만 4 XP (만점 보너스는 시험 제출 때)
        XpResult xp = switch (req.context()) {
            case PLACEMENT -> xpService.current(userId);
            case QUIZ -> g.correct()
                    ? xpService.award(userId, XpReason.QUIZ_CORRECT, sourceKey(req, today))
                    : xpService.current(userId);
            default -> xpService.award(userId, g.correct() ? XpReason.PRACTICE_CORRECT : XpReason.PRACTICE_WRONG,
                    sourceKey(req, today));
        };

        // TODO(박민하): attempt 저장, θ·d 갱신, wrong_note 등록, 약점 메모(weakNote)
        String weakNote = null;
        return new AttemptResult(g.correct(), key.answer(), g.errorType(), key.explanation(), key.conceptCardId(),
                weakNote, xp);
    }

    private static String sourceKey(AttemptRequest req, LocalDate today) {
        return "attempt:" + req.context() + ":" + (req.sessionId() == null ? "-" : req.sessionId()) + ":"
                + req.itemId() + ":" + today;
    }
}

package com.maco.exam.service;

import com.maco.common.time.AppClock;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.ScenarioDto;
import com.maco.exam.dto.ExamDtos.ExamHome;
import com.maco.exam.dto.ExamDtos.QuizAnswer;
import com.maco.exam.dto.ExamDtos.QuizResponse;
import com.maco.exam.dto.ExamDtos.QuizResult;
import com.maco.exam.dto.ExamDtos.WrongNote;
import com.maco.skill.domain.AttemptContext;
import com.maco.skill.domain.SkillPolicy;
import com.maco.skill.dto.AttemptRequest;
import com.maco.skill.dto.AttemptResult;
import com.maco.skill.dto.PickRequest;
import com.maco.skill.service.SkillService;
import com.maco.xp.domain.XpReason;
import com.maco.xp.dto.XpResult;
import com.maco.xp.service.XpService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 쪽지시험·오답 노트 (담당: 이동성). 화면 S11~S13. 출제·채점은 SkillService, XP는 XpService.
 *
 * <p>TODO(이동성): prototype/lib/train/engine.ts quizItems를 옮긴다.
 * <ul>
 *   <li>출제: 복습 예정 → 오늘 배운 스킬 → 약점 순서로 5문제 (SkillService.pick includeReview)</li>
 *   <li>quiz INSERT (user_id, kind, quiz_date) UNIQUE → 하루 1번, 이미 냈으면 QUIZ_ALREADY_SUBMITTED</li>
 *   <li>오답 노트: wrong_note 조회 (복습 날짜순) — SkillService에 조회 메서드 요청 → 박민하</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class QuizService {

    private final SkillService skillService;
    private final XpService xpService;
    private final AppClock appClock;

    /** TODO(이동성): 오늘 쪽지시험 제출 여부·점수, 오답 노트 개수 */
    public ExamHome home(Long userId, ScenarioDto todayScenario) {
        return new ExamHome(false, null, wrongNotes(userId).size(), todayScenario);
    }

    public QuizResponse createDaily(Long userId) {
        LocalDate today = appClock.today(userId);
        List<ItemDto> items = skillService.pick(userId, new PickRequest(List.of("PHOTO", "REVIEW"), 5,
                SkillPolicy.QUIZ_SIZE, AttemptContext.QUIZ, true, List.of()));
        return new QuizResponse(null, today, items);
    }

    public QuizResult submit(Long userId, Long quizId, List<QuizAnswer> answers) {
        List<AttemptResult> results = new ArrayList<>();
        XpResult last = xpService.current(userId);
        int gained = 0;
        for (QuizAnswer a : answers) {
            AttemptResult r = skillService.record(userId,
                    new AttemptRequest(a.itemId(), a.answer(), null, AttemptContext.QUIZ, quizId, null, null));
            results.add(r);
            gained += r.xp().gained();
            last = r.xp();
        }
        int correct = (int) results.stream().filter(AttemptResult::correct).count();
        int score = score(correct, answers.size());
        if (score == 100) {
            XpResult bonus = xpService.award(userId, XpReason.QUIZ_PERFECT, "quiz:" + quizId + ":perfect");
            gained += bonus.gained();
            last = bonus;
        }
        XpResult total = new XpResult(gained, last.todayXp(), last.goalXp(), last.goalAchievedNow(), last.streakDays(),
                last.levelUps());
        // TODO(이동성): quiz.score, submitted_at 저장
        return new QuizResult(score, results, total);
    }

    public List<WrongNote> wrongNotes(Long userId) {
        return List.of();
    }

    /** 100점 만점 */
    public static int score(int correct, int total) {
        return total == 0 ? 0 : Math.round(100f * correct / total);
    }
}

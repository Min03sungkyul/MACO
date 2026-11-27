package com.maco.training.service;

import com.maco.ai.client.AiClient;
import com.maco.ai.client.AiResult;
import com.maco.ai.client.AiTask;
import com.maco.ai.dto.GradeInput;
import com.maco.ai.dto.GradeOutput;
import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.ItemKey;
import com.maco.content.dto.LessonDto;
import com.maco.content.dto.SkillDto;
import com.maco.content.service.ContentService;
import com.maco.skill.domain.AttemptContext;
import com.maco.skill.domain.SkillPolicy;
import com.maco.skill.dto.AttemptRequest;
import com.maco.skill.dto.AttemptResult;
import com.maco.skill.dto.PickRequest;
import com.maco.skill.service.SkillService;
import com.maco.training.dto.TrainingDtos.FinishRequest;
import com.maco.training.dto.TrainingDtos.FinishResponse;
import com.maco.training.dto.TrainingDtos.NodeStatus;
import com.maco.training.dto.TrainingDtos.PathNode;
import com.maco.training.dto.TrainingDtos.PathResponse;
import com.maco.training.dto.TrainingDtos.PathUnit;
import com.maco.training.dto.TrainingDtos.PlacementAnswer;
import com.maco.training.dto.TrainingDtos.PlacementResponse;
import com.maco.training.dto.TrainingDtos.PlacementResult;
import com.maco.training.dto.TrainingDtos.RewriteGradeResponse;
import com.maco.training.dto.TrainingDtos.SessionResponse;
import com.maco.training.dto.TrainingDtos.TodayResponse;
import com.maco.user.service.UserService;
import com.maco.xp.domain.XpReason;
import com.maco.xp.dto.XpResult;
import com.maco.xp.service.XpService;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 📚 트레이닝 (담당: 주승준). 화면 S4, S6~S10.
 * 출제·채점은 SkillService, XP는 XpService, 고쳐 쓰기 채점은 AiClient를 쓴다.
 *
 * <p>TODO(주승준): 아래를 DB에 저장·반영한다 (prototype/lib/train/engine.ts nodeOpen·finishNode·lessonItems).
 * <ul>
 *   <li>경로: lesson_session 최고 정답률로 DONE, 앞 노드를 끝내야 다음 OPEN</li>
 *   <li>오늘의 추천: 약점 오류 유형·복습 예정 반영 (SkillService에 조회 요청 → 박민하)</li>
 *   <li>세션: lesson_session INSERT, 7문제 중 복습 2개</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class TrainingService {

    /** 배치 테스트: 두 스킬 × 레벨 1·3·5에서 고르게 10문제 (prototype placementItems) */
    private static final List<String> PLACEMENT_CODES = List.of(
            "PHOTO-CHOICE2-001", "REVIEW-JUDGE-001", "PHOTO-CHOICE2-005", "REVIEW-CHOICE2-002", "PHOTO-CHOICE2-002",
            "REVIEW-JUDGE-002", "PHOTO-JUDGE-005", "REVIEW-CHOICE2-004", "PHOTO-JUDGE-003", "REVIEW-JUDGE-008");

    private final ContentService contentService;
    private final SkillService skillService;
    private final XpService xpService;
    private final AiClient aiClient;
    private final UserService userService;

    public PathResponse path(Long userId) {
        List<LessonDto> lessons = contentService.lessons();
        List<PathUnit> units = new ArrayList<>();
        for (SkillDto s : contentService.skills()) {
            List<PathNode> nodes = new ArrayList<>();
            boolean first = true;
            for (LessonDto l : lessons.stream().filter(l -> l.skillCode().equals(s.code())).toList()) {
                NodeStatus status = s.ready() && first ? NodeStatus.OPEN : NodeStatus.LOCKED;
                nodes.add(new PathNode(l.id(), l.level(), l.title(), status, null));
                first = false;
            }
            units.add(new PathUnit(s.code(), s.name(), s.gate(), s.ready(), SkillPolicy.level(SkillPolicy.THETA_START), nodes));
        }
        return new PathResponse(units);
    }

    public TodayResponse today(Long userId) {
        LessonDto l = contentService.lessons().stream().findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "레슨이 아직 없어요"));
        return new TodayResponse(l.id(), l.title(), "처음 시작하는 레슨이에요", 0, List.of());
    }

    public SessionResponse startLesson(Long userId, Long lessonId) {
        LessonDto lesson = contentService.lesson(lessonId);
        List<ItemDto> items = skillService.pick(userId, new PickRequest(List.of(lesson.skillCode()), lesson.level(),
                lesson.itemCount(), AttemptContext.LESSON, true, List.of()));
        return new SessionResponse(null, lesson, contentService.conceptCard(lesson.conceptCardId()).orElse(null), items);
    }

    public FinishResponse finishLesson(Long userId, Long sessionId, FinishRequest req) {
        int accuracy = req.totalCount() == 0 ? 0 : Math.round(100f * req.correctCount() / req.totalCount());
        XpResult xp = xpService.award(userId, XpReason.LESSON_COMPLETE, "lesson:" + req.lessonId() + ":" + sessionId);
        return new FinishResponse(accuracy, xp, null);
    }

    public RewriteGradeResponse gradeRewrite(Long itemId, String text) {
        ItemKey key = contentService.itemKey(itemId);
        if (key.rubricCode() == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "고쳐 쓰기 문제가 아니에요");
        }
        ItemDto item = contentService.item(itemId);
        List<GradeInput.Criterion> criteria = contentService.rubric(key.rubricCode()).stream()
                .map(c -> new GradeInput.Criterion(c.criterionKey(), c.criterion(), c.good(), c.fix(), c.errorTypeCode()))
                .toList();
        AiResult<GradeOutput> r = aiClient.run(AiTask.REWRITE_GRADE,
                new GradeInput(key.rubricCode(), criteria, item.context(), text), GradeOutput.class);
        // 예시는 채점 뒤에만 보여 준다 (AI가 대신 써 주지 않는다)
        return new RewriteGradeResponse(r.data(), r.source(), key.sampleAnswer());
    }

    public PlacementResponse placement() {
        List<ItemDto> all = contentService.activeItems(List.of("PHOTO", "REVIEW"), 5);
        List<ItemDto> picked = PLACEMENT_CODES.stream()
                .flatMap(code -> all.stream().filter(i -> i.code().equals(code)).findFirst().stream()).toList();
        return new PlacementResponse(picked.isEmpty() ? all.stream().limit(10).toList() : picked);
    }

    public PlacementResult submitPlacement(Long userId, List<PlacementAnswer> answers) {
        int correct = 0;
        Map<String, int[]> perSkill = new LinkedHashMap<>();
        for (PlacementAnswer a : answers) {
            AttemptResult r = skillService.record(userId,
                    new AttemptRequest(a.itemId(), a.answer(), null, AttemptContext.PLACEMENT, null, null, null));
            String skill = contentService.itemKey(a.itemId()).skillCode();
            int[] c = perSkill.computeIfAbsent(skill, k -> new int[2]);
            c[1]++;
            if (r.correct()) {
                c[0]++;
                correct++;
            }
        }
        userService.completePlacement(userId);
        // TODO(박민하·주승준): 맞힌 비율로 user_skill.θ 시작값 정하기 (지금은 비율로 레벨만 추정)
        Map<String, Integer> levels = new LinkedHashMap<>();
        perSkill.forEach((k, v) -> levels.put(k, Math.max(1, Math.round(5f * v[0] / Math.max(1, v[1])))));
        return new PlacementResult(levels, correct, answers.size());
    }
}

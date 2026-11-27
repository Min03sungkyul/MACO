package com.maco.exam.service;

import com.maco.ai.client.AiClient;
import com.maco.ai.client.AiResult;
import com.maco.ai.client.AiTask;
import com.maco.ai.dto.GradeInput;
import com.maco.ai.dto.RoleplayReportInput;
import com.maco.ai.dto.RoleplayReportOutput;
import com.maco.ai.dto.RoleplayTurn;
import com.maco.ai.dto.RoleplayTurnInput;
import com.maco.ai.dto.RoleplayTurnOutput;
import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.content.dto.ScenarioDto;
import com.maco.content.service.ContentService;
import com.maco.exam.dto.ExamDtos.RoleplayFinishResponse;
import com.maco.exam.dto.ExamDtos.RoleplaySession;
import com.maco.exam.dto.ExamDtos.RoleplayTurnResponse;
import com.maco.xp.domain.XpReason;
import com.maco.xp.dto.XpResult;
import com.maco.xp.service.XpService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AI 손님 상황극 (담당: 이동성, AI는 강민국의 AiClient). 화면 S14. 3턴 → 루브릭 리포트.
 *
 * <p>지금은 세션을 서버 메모리에 둔다 (서버를 다시 켜면 사라짐).
 * TODO(이동성): roleplay_session 테이블에 저장 (turns_json, status, report_json, xp_gained, ai_source)
 */
@Service
@RequiredArgsConstructor
public class RoleplayService {

    public static final String NOTICE = "연습용 가상 상황이에요. 실제 손님이 아니에요.";

    private final ContentService contentService;
    private final AiClient aiClient;
    private final XpService xpService;

    private record Session(Long userId, ScenarioDto scenario, List<RoleplayTurn> turns, boolean[] finished) {
    }

    private final Map<Long, Session> sessions = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    public List<ScenarioDto> scenarios() {
        return contentService.scenarios();
    }

    public RoleplaySession start(Long userId, Long scenarioId) {
        ScenarioDto s = contentService.scenario(scenarioId);
        List<RoleplayTurn> turns = new ArrayList<>(List.of(new RoleplayTurn("customer", s.openingLine())));
        long id = ids.incrementAndGet();
        sessions.put(id, new Session(userId, s, turns, new boolean[]{false}));
        return new RoleplaySession(id, s, List.copyOf(turns), false, NOTICE);
    }

    public RoleplayTurnResponse turn(Long userId, Long sessionId, String text) {
        Session s = find(userId, sessionId);
        int ownerIndex = (int) s.turns().stream().filter(t -> "owner".equals(t.role())).count();
        if (ownerIndex >= s.scenario().maxTurns()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "대화가 끝났어요. 리포트를 확인해 주세요");
        }
        s.turns().add(new RoleplayTurn("owner", text));
        AiResult<RoleplayTurnOutput> r = aiClient.run(AiTask.ROLEPLAY_TURN, new RoleplayTurnInput(s.scenario().code(),
                s.scenario().persona(), s.scenario().maxTurns(), ownerIndex, List.copyOf(s.turns()), text), RoleplayTurnOutput.class);
        if (r.data().customerText() != null) {
            s.turns().add(new RoleplayTurn("customer", r.data().customerText()));
        }
        return new RoleplayTurnResponse(r.data().customerText(), r.data().last(), r.source());
    }

    public RoleplayFinishResponse finish(Long userId, Long sessionId) {
        Session s = find(userId, sessionId);
        List<GradeInput.Criterion> criteria = contentService.rubric(s.scenario().rubricCode()).stream()
                .map(c -> new GradeInput.Criterion(c.criterionKey(), c.criterion(), c.good(), c.fix(), c.errorTypeCode()))
                .toList();
        AiResult<RoleplayReportOutput> r = aiClient.run(AiTask.ROLEPLAY_REPORT, new RoleplayReportInput(
                s.scenario().code(), s.scenario().rubricCode(), criteria, List.copyOf(s.turns())), RoleplayReportOutput.class);
        XpResult xp = s.finished()[0] ? xpService.current(userId)
                : xpService.awardScore(userId, XpReason.ROLEPLAY, "roleplay:" + sessionId, r.data().score());
        s.finished()[0] = true;
        return new RoleplayFinishResponse(r.data(), r.source(), xp);
    }

    private Session find(Long userId, Long sessionId) {
        Session s = sessions.get(sessionId);
        if (s == null || !s.userId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "상황극을 찾을 수 없어요");
        }
        return s;
    }
}

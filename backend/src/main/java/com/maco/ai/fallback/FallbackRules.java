package com.maco.ai.fallback;

import com.maco.ai.client.AiTask;
import com.maco.ai.dto.CaptureReadInput;
import com.maco.ai.dto.ExplainInput;
import com.maco.ai.dto.ExplainOutput;
import com.maco.ai.dto.GradeInput;
import com.maco.ai.dto.GradeOutput;
import com.maco.ai.dto.MissionFeedbackInput;
import com.maco.ai.dto.Readings;
import com.maco.ai.dto.RoleplayReportInput;
import com.maco.ai.dto.RoleplayReportOutput;
import com.maco.ai.dto.RoleplayTurn;
import com.maco.ai.dto.RoleplayTurnInput;
import com.maco.ai.dto.RoleplayTurnOutput;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * AI가 없거나 실패했을 때 쓰는 규칙 결과 (FALLBACK). 출처: prototype/lib/ai/adapter.ts
 * 원칙: AI는 결과물을 대신 만들지 않고 채점·설명만 한다. 이 규칙만으로도 시연 9단계가 끝까지 돈다.
 */
@Component
public class FallbackRules {

    /** 가정값: 루브릭 채점 통과 점수 (프로토타입 75, docs/01 70 → docs/07 4장에서 확정) */
    public static final int PASS_SCORE = 70;
    /** 가정값: 너무 짧은 답은 어느 항목도 통과로 치지 않는다 */
    private static final int MIN_LENGTH = 8;

    /** 루브릭 항목별 규칙 패턴 (rubric.code:criterion_key). 새 루브릭을 만들면 여기에도 추가한다. */
    private static final Map<String, Pattern> PATTERNS = Map.of(
            "REPLY_PRAISE:THANKS", Pattern.compile("감사|고마|고맙"),
            "REPLY_PRAISE:SPECIFIC", Pattern.compile("크루아상|라떼|케이크|빵|커피|메뉴|바삭|고소|분위기|자리"),
            "REPLY_PRAISE:REVISIT", Pattern.compile("또 |다시|들러|방문|오세요|와 주세요|오시면"),
            "REPLY_PRAISE:CLEAN", Pattern.compile("^(?![\\s\\S]*(팔로우|이벤트 참여|!!!))"),
            "REPLY_COMPLAINT:EMPATHY", Pattern.compile("불편|속상|실망|답답|기다리|아쉬"),
            "REPLY_COMPLAINT:APOLOGY", Pattern.compile("죄송|사과"),
            "REPLY_COMPLAINT:FIX", Pattern.compile("확인하|바꾸|개선|안내|준비하|하겠|할게|드리겠|챙기"),
            "REPLY_COMPLAINT:REVISIT", Pattern.compile("다음|또 |다시|오시면|방문"),
            "REPLY_COMPLAINT:CALM", Pattern.compile("^(?![\\s\\S]*(그런데|원래|다른 손님|어쩔 수|저희 탓))"));

    /** 상황극 손님 대본 (시나리오 RP-LUKEWARM-LATTE). 사장님 답에 따라 다음 말이 달라진다. */
    private static final List<List<String[]>> ROLEPLAY_SCRIPT = List.of(
            List.of(new String[]{"죄송|사과", "사과해 주시니 마음이 좀 풀리네요. 그런데 다음에 가도 또 그럴까 봐 걱정돼요."},
                    new String[]{".*", "음… 제 말을 제대로 들으신 건지 모르겠어요. 다음에 또 미지근하면 어떡하죠?"}),
            List.of(new String[]{"확인|바꾸|개선|하겠|할게|드리겠", "그렇게 해 주신다면 한 번 더 가 볼게요. 혹시 다음에 가면 말씀드리면 되나요?"},
                    new String[]{".*", "구체적으로 뭐가 달라지는지 잘 모르겠어요. 다른 가게를 가야 할지 고민돼요."}));

    public Object produce(AiTask task, Object input) {
        return switch (task) {
            case CAPTURE_READ_PLACE, CAPTURE_READ_INSTA -> readCapture((CaptureReadInput) input);
            case REWRITE_GRADE -> grade((GradeInput) input);
            case EXPLAIN_WRONG -> explain((ExplainInput) input);
            case ROLEPLAY_TURN -> roleplayTurn((RoleplayTurnInput) input);
            case ROLEPLAY_REPORT -> roleplayReport((RoleplayReportInput) input);
            case MISSION_FEEDBACK -> missionFeedback((MissionFeedbackInput) input);
            case WEEKLY_COACH -> new ExplainOutput("이번 주도 꾸준히 트레이닝하셨어요. 약점 리포트에서 가장 많이 틀린 유형을 하나 골라 다시 풀어 보세요.");
        };
    }

    /** 캡처를 읽지 못하면 빈 값 → 사장님이 확인 화면에서 직접 채운다 */
    public Readings readCapture(CaptureReadInput input) {
        return new Readings(false, false, 0, false, 0, 0, 0, 999, false, false, false);
    }

    /** 루브릭 규칙 채점 (prototype gradeText) */
    public GradeOutput grade(GradeInput in) {
        String t = in.text() == null ? "" : in.text().trim();
        List<GradeOutput.Check> checks = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        String good = null;
        String fix = null;
        for (GradeInput.Criterion c : in.criteria()) {
            Pattern p = PATTERNS.get(in.rubricCode() + ":" + c.key());
            boolean ok = p != null && t.length() >= MIN_LENGTH && p.matcher(t).find();
            checks.add(new GradeOutput.Check(c.key(), c.label(), ok));
            if (ok && good == null) {
                good = c.good();
            }
            if (!ok) {
                if (fix == null) {
                    fix = c.fix();
                }
                if (c.errorType() != null) {
                    errors.add(c.errorType());
                }
            }
        }
        int score = checks.isEmpty() ? 0 : Math.round(100f * checks.stream().filter(GradeOutput.Check::ok).count() / checks.size());
        return new GradeOutput(score, score >= PASS_SCORE, checks,
                good == null ? "끝까지 써 보셨어요. 그게 시작이에요." : good, fix, errors);
    }

    /** "왜 틀렸어요?" (prototype explainWrong) */
    public ExplainOutput explain(ExplainInput in) {
        String name = in.errorName() == null ? "핵심" : in.errorName();
        String tip = in.fixTip() == null ? "" : " 기억할 한 가지: " + in.fixTip();
        return new ExplainOutput("이 문제는 \"" + name + "\"을(를) 보는 문제예요. " + in.explanation() + tip);
    }

    /** 상황극 손님의 다음 말 (prototype guestReply). 마지막 답 뒤에는 last=true */
    public RoleplayTurnOutput roleplayTurn(RoleplayTurnInput in) {
        int i = in.ownerTurnIndex();
        if (i >= ROLEPLAY_SCRIPT.size() || i >= in.maxTurns() - 1) {
            return new RoleplayTurnOutput(null, true);
        }
        String owner = in.ownerText() == null ? "" : in.ownerText();
        for (String[] rule : ROLEPLAY_SCRIPT.get(i)) {
            if (Pattern.compile(rule[0]).matcher(owner).find()) {
                return new RoleplayTurnOutput(rule[1], false);
            }
        }
        return new RoleplayTurnOutput(ROLEPLAY_SCRIPT.get(i).getLast()[1], false);
    }

    /** 상황극 리포트 (prototype gradeRoleplay): 빠진 항목을 가장 짧게 답한 턴에 붙여 최대 3개 */
    public RoleplayReportOutput roleplayReport(RoleplayReportInput in) {
        List<String> owner = in.turns().stream().filter(t -> "owner".equals(t.role())).map(RoleplayTurn::text).toList();
        GradeOutput g = grade(new GradeInput(in.rubricCode(), in.criteria(), null, String.join(" ", owner)));
        int shortest = 0;
        for (int i = 1; i < owner.size(); i++) {
            if (owner.get(i).length() < owner.get(shortest).length()) {
                shortest = i;
            }
        }
        List<RoleplayReportOutput.FixLine> lines = new ArrayList<>();
        for (GradeOutput.Check c : g.checks()) {
            if (!c.ok() && lines.size() < 3 && !owner.isEmpty()) {
                String fix = in.criteria().stream().filter(x -> x.key().equals(c.key())).findFirst()
                        .map(GradeInput.Criterion::fix).orElse("");
                lines.add(new RoleplayReportOutput.FixLine(shortest + 1, owner.get(shortest), fix));
            }
        }
        return new RoleplayReportOutput(g.score(), g.checks(), g.good(), lines);
    }

    /** 미션 첨삭: 글은 루브릭 규칙, 사진은 밝기·선명도 규칙 (prototype judgePhoto) */
    public GradeOutput missionFeedback(MissionFeedbackInput in) {
        if (in.grade() != null) {
            return grade(in.grade());
        }
        return PhotoMetrics.judge(in.brightness() == null ? 0 : in.brightness(),
                in.sharpness() == null ? 0 : in.sharpness());
    }
}

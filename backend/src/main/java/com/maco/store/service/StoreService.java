package com.maco.store.service;

import com.maco.ai.client.AiClient;
import com.maco.ai.client.AiResult;
import com.maco.ai.client.AiTask;
import com.maco.ai.dto.CaptureReadInput;
import com.maco.ai.dto.GradeInput;
import com.maco.ai.dto.GradeOutput;
import com.maco.ai.dto.MissionFeedbackInput;
import com.maco.ai.dto.Readings;
import com.maco.ai.fallback.PhotoMetrics;
import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.common.time.AppClock;
import com.maco.content.dto.PracticeStoreDto;
import com.maco.content.service.ContentService;
import com.maco.store.domain.GatePolicy;
import com.maco.store.dto.AdGateDto;
import com.maco.store.dto.CaptureReadResponse;
import com.maco.store.dto.GateCheckDto;
import com.maco.store.dto.GateScores;
import com.maco.store.dto.MissionDto;
import com.maco.store.dto.MissionFeedbackDto;
import com.maco.store.dto.PlaceSearchResult;
import com.maco.store.dto.ReviewCardDto;
import com.maco.store.dto.ReviewCardRequest;
import com.maco.store.dto.SpotGameDto;
import com.maco.store.dto.SpotTapResult;
import com.maco.store.dto.StoreDto;
import com.maco.store.dto.StoreHomeDto;
import com.maco.store.dto.StoreRegisterRequest;
import com.maco.user.domain.UserMode;
import com.maco.user.dto.UserSummary;
import com.maco.user.service.UserService;
import com.maco.xp.domain.XpReason;
import com.maco.xp.dto.XpResult;
import com.maco.xp.service.XpService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * 내 가게 / 연습 가게 (담당: 강민국). 화면 S15~S21.
 *
 * <p>지금 동작: 가게 검색, 캡처 업로드·AI 읽기(recorded/FALLBACK), 관문 점수·진단 카드, 틀린 곳 찾기 줄 만들기·판정,
 * 미션 첨삭(글 루브릭·사진 밝기/선명도), 광고 잠금 판단.
 * TODO(강민국): 아래를 DB에 저장한다 (V6 테이블). 지금은 저장하지 않고 시연 캡처 값으로 응답한다.
 * <ul>
 *   <li>store(계정당 1개), capture, gate_check(최근 진단), spot_game(찾은 줄), mission_submission, review_card, review_request_log</li>
 *   <li>미션 해금: 연결 스킬 레벨 ≥ unlock_level (SkillService에 스킬 레벨 조회 추가 요청 → 박민하)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class StoreService {

    private final PlaceSearchService placeSearchService;
    private final GateService gateService;
    private final UploadService uploadService;
    private final AiClient aiClient;
    private final ContentService contentService;
    private final UserService userService;
    private final XpService xpService;
    private final AppClock appClock;
    private final NamedParameterJdbcTemplate jdbc;

    public List<PlaceSearchResult> search(String query) {
        return placeSearchService.search(query);
    }

    public StoreDto register(Long userId, StoreRegisterRequest req) {
        // TODO(강민국): store INSERT (user_id UNIQUE → 이미 있으면 STORE_ALREADY_REGISTERED), 주소로 region 찾기
        return new StoreDto(null, req.name(), req.category(), req.roadAddress() != null ? req.roadAddress() : req.address(), false);
    }

    public List<PracticeStoreDto> practiceStores() {
        return contentService.practiceStores();
    }

    public StoreHomeDto home(Long userId) {
        UserSummary user = userService.getSummary(userId);
        return new StoreHomeDto(currentStore(user), latestGateCheck(userId), missions(userId),
                new StoreHomeDto.Quest("이번 주 리뷰 요청 5번", 2, 5)); // 가정값: 시연용 고정 퀘스트 (기획서 12-1)
    }

    /** 캡처 업로드 → 저장 → AI가 항목을 읽는다 (사장님 확인 전) */
    public CaptureReadResponse uploadCapture(Long userId, MultipartFile file, String platform) {
        String p = "INSTA".equalsIgnoreCase(platform) ? "INSTA" : "PLACE";
        UploadService.Saved saved = uploadService.save(file, "captures");
        AiTask task = "INSTA".equals(p) ? AiTask.CAPTURE_READ_INSTA : AiTask.CAPTURE_READ_PLACE;
        // 시연 계정은 날짜에 따라 다른 저장 응답 (4주 넘기기 뒤 다시 캡처 → 믿게 통과)
        boolean afterFourWeeks = appClock.today(userId).isAfter(appClock.today(null).plusDays(20));
        String demoKey = userService.getSummary(userId).demo() && afterFourWeeks ? "owner-week4" : "default";
        AiResult<Readings> r = aiClient.run(task, new CaptureReadInput(p, saved.path(), demoKey), Readings.class);
        // TODO(강민국): capture INSERT (status READ, ai_read_json, ai_source) → captureId
        return new CaptureReadResponse(null, p, r.data(), r.source());
    }

    /** 사장님이 확인·수정한 값으로 관문 진단 */
    public GateCheckDto confirmCapture(Long userId, Long captureId, Readings confirmed) {
        // TODO(강민국): capture.confirmed_json 저장, gate_check INSERT
        return gateCheck(userId, confirmed);
    }

    public GateCheckDto latestGateCheck(Long userId) {
        // TODO(강민국): gate_check 최근 1건. 학습 모드는 연습 가게의 gate_preset_json
        return gateCheck(userId, Readings.demoCafe());
    }

    public SpotGameDto startSpotGame(Long userId) {
        Readings r = latestGateCheck(userId).readings();
        List<SpotGameDto.Row> rows = placeRows(r, currentStore(userService.getSummary(userId)).name()).stream()
                .map(x -> new SpotGameDto.Row(x.key, x.label, x.sub)).toList();
        int bad = (int) placeRows(r, "").stream().filter(x -> x.ruleKey != null).count();
        // TODO(강민국): spot_game INSERT → gameId, found_ids_json
        return new SpotGameDto(null, rows, bad, List.of());
    }

    public SpotTapResult tapSpot(Long userId, Long gameId, String rowKey) {
        Readings r = latestGateCheck(userId).readings();
        List<PlaceRow> rows = placeRows(r, "");
        int toFind = (int) rows.stream().filter(x -> x.ruleKey != null).count();
        PlaceRow row = rows.stream().filter(x -> x.key.equals(rowKey)).findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT, "없는 줄이에요"));
        if (row.ruleKey == null) {
            return new SpotTapResult(false, "여긴 괜찮아요", null, 0, toFind, xpService.current(userId));
        }
        GatePolicy.Rule rule = GatePolicy.RULES.stream().filter(x -> x.key().equals(row.ruleKey)).findFirst().orElseThrow();
        XpResult xp = xpService.award(userId, XpReason.SPOT_FOUND, "spot:" + gameId + ":" + rowKey);
        // TODO(강민국): found_ids_json에 추가하고 foundCount를 실제 값으로
        return new SpotTapResult(true, rule.card(), tipFor(rule.skill()), 1, toFind, xp);
    }

    public List<MissionDto> missions(Long userId) {
        // TODO(강민국): unlocked = 스킬 레벨 ≥ unlock_level, passed = mission_submission.passed
        return jdbc.query("SELECT * FROM mission ORDER BY id", Map.of(), (rs, i) -> new MissionDto(
                rs.getLong("id"), rs.getString("code"), rs.getString("skill_code"), rs.getString("gate"),
                rs.getString("title"), rs.getString("description"), rs.getInt("unlock_level"),
                rs.getString("submit_type"), true, false));
    }

    public MissionFeedbackDto submitMission(Long userId, Long missionId, String text, MultipartFile image) {
        MissionDto m = missions(userId).stream().filter(x -> x.id().equals(missionId)).findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "미션을 찾을 수 없어요"));
        MissionFeedbackInput input;
        if ("PHOTO".equals(m.submitType())) {
            UploadService.Saved saved = uploadService.save(image, "missions");
            PhotoMetrics.Measured pm = PhotoMetrics.measure(saved.image());
            input = new MissionFeedbackInput(m.code(), "PHOTO", null, pm.brightness(), pm.sharpness(), saved.path());
        } else {
            if (text == null || text.isBlank()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "답글을 써 주세요");
            }
            String rubric = "REPLY_COMPLAINT";
            List<GradeInput.Criterion> criteria = contentService.rubric(rubric).stream()
                    .map(c -> new GradeInput.Criterion(c.criterionKey(), c.criterion(), c.good(), c.fix(), c.errorTypeCode()))
                    .toList();
            input = new MissionFeedbackInput(m.code(), "TEXT", new GradeInput(rubric, criteria, null, text), null, null, null);
        }
        AiResult<GradeOutput> r = aiClient.run(AiTask.MISSION_FEEDBACK, input, GradeOutput.class);
        XpResult xp = r.data().pass()
                ? xpService.award(userId, XpReason.MISSION_PASS, "mission:" + m.code() + ":" + appClock.today(userId))
                : xpService.current(userId);
        // TODO(강민국): mission_submission INSERT (feedback_json, score, passed, ai_source)
        return new MissionFeedbackDto(r.data(), r.source(), xp);
    }

    public ReviewCardDto createReviewCard(Long userId, ReviewCardRequest req) {
        String name = currentStore(userService.getSummary(userId)).name();
        String message = req.message() == null || req.message().isBlank()
                ? "오늘 방문 어떠셨어요? 솔직한 리뷰 한 줄이 저희에게 큰 힘이 돼요." : req.message();
        String url = req.qrTargetUrl() == null || req.qrTargetUrl().isBlank() ? "https://map.naver.com" : req.qrTargetUrl();
        // TODO(강민국): review_card INSERT. 문구는 대가 없는 요청만 (쿠폰·할인 조건 금지)
        return new ReviewCardDto(null, name, message, url, 0, 0);
    }

    public ReviewCardDto reviewCard(Long userId, Long id) {
        return createReviewCard(userId, new ReviewCardRequest(null, null));
    }

    /** 오늘 리뷰를 부탁한 수 +1 */
    public ReviewCardDto addReviewRequest(Long userId) {
        // TODO(강민국): review_request_log (store_id, log_date=AppClock.today) count + 1
        ReviewCardDto c = reviewCard(userId, null);
        return new ReviewCardDto(c.id(), c.storeName(), c.message(), c.qrTargetUrl(), 1, 1);
    }

    public AdGateDto adGate(Long userId) {
        GateScores s = latestGateCheck(userId).scores();
        String reason = s.adUnlocked() ? null : !s.findPassed() ? "찾게 관문부터 통과해 주세요" : "믿게 관문을 통과하면 열려요";
        // TODO(강민국): 2주 실험 카드 ad_experiment (P1)
        return new AdGateDto(!s.adUnlocked(), reason, s, null);
    }

    // ───────── 내부 ─────────

    private GateCheckDto gateCheck(Long userId, Readings r) {
        return new GateCheckDto(appClock.today(userId), r, gateService.scores(r), gateService.cards(r));
    }

    private StoreDto currentStore(UserSummary user) {
        if (user.mode() == UserMode.STORE) {
            // TODO(강민국): store 테이블에서 읽기
            return new StoreDto(null, user.nickname(), "카페,디저트", "인천 부평구 부평대로 88", false);
        }
        String name = contentService.practiceStores().stream().findFirst().map(PracticeStoreDto::name).orElse("연습 카페 마코");
        return new StoreDto(null, name, "카페", null, true);
    }

    /** 손님이 보는 플레이스 화면 (prototype components/train/shop.tsx placeRows). ruleKey가 있으면 틀린 곳 */
    record PlaceRow(String key, String label, String sub, String ruleKey) {
    }

    static List<PlaceRow> placeRows(Readings r, String name) {
        List<PlaceRow> rows = new ArrayList<>();
        rows.add(new PlaceRow("title", name, "카페 · 리뷰 " + r.reviews() + " · ★" + String.format("%.1f", r.rating()), null));
        rows.add(new PlaceRow("hours", "영업시간", r.hours() ? "매일 10:00 – 21:00" : "정보 없음", r.hours() ? null : "hours"));
        rows.add(new PlaceRow("contact", "전화 · 주소", r.contact() ? "032-000-0000 · 부평대로 88" : "정보 없음", r.contact() ? null : "contact"));
        rows.add(new PlaceRow("menuPrice", "메뉴", r.menuPrice() ? "무화과 라떼 6,000원 · 무화과 케이크 7,500원" : "무화과 라떼 · 무화과 케이크 (가격 없음)", r.menuPrice() ? null : "menuPrice"));
        rows.add(new PlaceRow("photos", "사진 " + r.photos() + "장", r.photos() >= GatePolicy.PHOTOS_ENOUGH ? "메뉴 · 매장 · 외관" : "메뉴 사진만 몇 장", r.photos() >= GatePolicy.PHOTOS_ENOUGH ? null : "photos"));
        rows.add(new PlaceRow("replied", "리뷰", r.replied() < r.reviews() ? "답글 없는 리뷰 " + (r.reviews() - r.replied()) + "개" : "모든 리뷰에 답글", r.replied() < r.reviews() ? "replied" : null));
        rows.add(new PlaceRow("news", "소식", r.news() ? "이번 주 신메뉴 소식" : "아직 소식이 없어요", r.news() ? null : "news"));
        return rows;
    }

    private static final Set<String> INFO = Set.of("INFO", "PROMO");

    private static String tipFor(String skill) {
        if ("PHOTO".equals(skill)) return "팔고 싶은 메뉴가 화면의 절반 이상을 차지하게 찍어요.";
        if ("REVIEW".equals(skill)) return "가능하면 하루 안에 답해요.";
        return INFO.contains(skill) ? "플레이스 정보를 채우면 손님이 묻지 않고 찾아와요." : null;
    }
}

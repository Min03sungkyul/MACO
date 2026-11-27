package com.maco.store.controller;

import com.maco.ai.dto.Readings;
import com.maco.common.api.ApiResponse;
import com.maco.common.security.CurrentUser;
import com.maco.content.dto.PracticeStoreDto;
import com.maco.store.dto.AdGateDto;
import com.maco.store.dto.CaptureReadResponse;
import com.maco.store.dto.GateCheckDto;
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
import com.maco.store.service.StoreService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 🏪 내 가게 / 연습 가게 (담당: 강민국) — docs/03 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/stores/search")
    public ApiResponse<List<PlaceSearchResult>> search(@RequestParam String query) {
        return ApiResponse.ok(storeService.search(query));
    }

    @PostMapping("/stores")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StoreDto> register(@CurrentUser Long userId, @Valid @RequestBody StoreRegisterRequest req) {
        return ApiResponse.ok(storeService.register(userId, req));
    }

    @GetMapping("/practice-stores")
    public ApiResponse<List<PracticeStoreDto>> practiceStores() {
        return ApiResponse.ok(storeService.practiceStores());
    }

    @GetMapping("/store/home")
    public ApiResponse<StoreHomeDto> home(@CurrentUser Long userId) {
        return ApiResponse.ok(storeService.home(userId));
    }

    @PostMapping(value = "/captures", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CaptureReadResponse> upload(@CurrentUser Long userId, @RequestPart("file") MultipartFile file,
                                                   @RequestParam(defaultValue = "PLACE") String platform) {
        return ApiResponse.ok(storeService.uploadCapture(userId, file, platform));
    }

    @PutMapping("/captures/{id}/confirm")
    public ApiResponse<GateCheckDto> confirm(@CurrentUser Long userId, @PathVariable Long id, @RequestBody Readings readings) {
        return ApiResponse.ok(storeService.confirmCapture(userId, id, readings));
    }

    @GetMapping("/gate-checks/latest")
    public ApiResponse<GateCheckDto> latest(@CurrentUser Long userId) {
        return ApiResponse.ok(storeService.latestGateCheck(userId));
    }

    @PostMapping("/spot-games")
    public ApiResponse<SpotGameDto> startSpot(@CurrentUser Long userId) {
        return ApiResponse.ok(storeService.startSpotGame(userId));
    }

    @PostMapping("/spot-games/{id}/taps")
    public ApiResponse<SpotTapResult> tap(@CurrentUser Long userId, @PathVariable Long id, @RequestBody TapRequest req) {
        return ApiResponse.ok(storeService.tapSpot(userId, id, req.key()));
    }

    public record TapRequest(String key) {
    }

    @GetMapping("/missions")
    public ApiResponse<List<MissionDto>> missions(@CurrentUser Long userId) {
        return ApiResponse.ok(storeService.missions(userId));
    }

    @PostMapping(value = "/missions/{id}/submissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MissionFeedbackDto> submit(@CurrentUser Long userId, @PathVariable Long id,
                                                  @RequestParam(required = false) String text,
                                                  @RequestPart(value = "file", required = false) MultipartFile file) {
        return ApiResponse.ok(storeService.submitMission(userId, id, text, file));
    }

    @PostMapping("/review-cards")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewCardDto> createCard(@CurrentUser Long userId, @Valid @RequestBody ReviewCardRequest req) {
        return ApiResponse.ok(storeService.createReviewCard(userId, req));
    }

    @GetMapping("/review-cards/{id}")
    public ApiResponse<ReviewCardDto> card(@CurrentUser Long userId, @PathVariable Long id) {
        return ApiResponse.ok(storeService.reviewCard(userId, id));
    }

    @PostMapping("/review-requests")
    public ApiResponse<ReviewCardDto> addRequest(@CurrentUser Long userId) {
        return ApiResponse.ok(storeService.addReviewRequest(userId));
    }

    @GetMapping("/ad-gate")
    public ApiResponse<AdGateDto> adGate(@CurrentUser Long userId) {
        return ApiResponse.ok(storeService.adGate(userId));
    }
}

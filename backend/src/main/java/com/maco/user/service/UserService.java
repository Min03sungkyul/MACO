package com.maco.user.service;

import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import com.maco.common.time.AppClock;
import com.maco.user.domain.User;
import com.maco.user.domain.UserMode;
import com.maco.user.dto.MeResponse;
import com.maco.user.dto.RegionDto;
import com.maco.user.dto.SettingsRequest;
import com.maco.user.dto.UserSummary;
import com.maco.user.repository.RegionRepository;
import com.maco.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 사용자·설정·지역 (담당: 박민하). 다른 패키지는 엔티티 대신 이 서비스의 DTO를 쓴다. */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppClock appClock;

    /** 이메일 가입 → 새 사용자 id */
    @Transactional
    public Long registerEmail(String email, String rawPassword, String nickname) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATED);
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .nickname(nickname)
                .build();
        return userRepository.save(user).getId();
    }

    /** 이메일·비밀번호가 맞으면 사용자 id, 아니면 LOGIN_FAILED */
    @Transactional(readOnly = true)
    public Long authenticate(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPasswordHash() != null && passwordEncoder.matches(rawPassword, u.getPasswordHash()))
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAILED))
                .getId();
    }

    @Transactional(readOnly = true)
    public MeResponse getMe(Long userId) {
        User u = find(userId);
        RegionDto region = u.getRegionId() == null ? null
                : regionRepository.findById(u.getRegionId()).map(RegionDto::from).orElse(null);
        return new MeResponse(u.getId(), u.getEmail(), u.getNickname(), u.getMode(), u.getStoreType(),
                u.getDailyGoalXp(), u.getHabitCue(), region, u.getRankingVisibility(), u.isLeagueEnabled(),
                u.isPlacementDone(), u.isDemo(), appClock.today(userId));
    }

    @Transactional
    public MeResponse updateSettings(Long userId, SettingsRequest req) {
        if (req.regionId() != null && !regionRepository.existsById(req.regionId())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "없는 지역이에요");
        }
        find(userId).updateSettings(req.mode(), req.storeType(), req.dailyGoalXp(), req.habitCue(), req.regionId(),
                req.rankingVisibility(), req.leagueEnabled());
        return getMe(userId);
    }

    @Transactional(readOnly = true)
    public UserSummary getSummary(Long userId) {
        User u = find(userId);
        return new UserSummary(u.getId(), u.getNickname(), u.getMode(), u.getStoreType(), u.getDailyGoalXp(),
                u.getRegionId(), u.isDemo());
    }

    @Transactional
    public void completePlacement(Long userId) {
        find(userId).completePlacement();
    }

    /** 시연 날짜 넘기기 → 바뀐 오프셋 (시연 계정만) */
    @Transactional
    public int skipDemoDays(Long userId, int days) {
        User u = find(userId);
        if (!u.isDemo()) {
            throw new BusinessException(ErrorCode.DEMO_ONLY);
        }
        u.skipDays(days);
        return u.getDemoDayOffset();
    }

    @Transactional
    public void resetDemoDays(Long userId) {
        User u = find(userId);
        if (!u.isDemo()) {
            throw new BusinessException(ErrorCode.DEMO_ONLY);
        }
        u.resetDemoDays();
    }

    /** 시연 계정 만들기 (이미 있으면 그 id) — demo 패키지가 부른다 */
    @Transactional
    public Long ensureDemoUser(String email, String rawPassword, String nickname, UserMode mode, String storeType,
                               String regionCode, String habitCue) {
        return userRepository.findByEmail(email).map(User::getId).orElseGet(() -> {
            Long regionId = regionRepository.findAll().stream()
                    .filter(r -> r.getCode().equals(regionCode)).findFirst().map(r -> r.getId()).orElse(null);
            User user = User.builder()
                    .email(email).passwordHash(passwordEncoder.encode(rawPassword)).nickname(nickname)
                    .mode(mode).storeType(storeType).dailyGoalXp(60).habitCue(habitCue).regionId(regionId).demo(true)
                    .build();
            user.completePlacement();
            return userRepository.save(user).getId();
        });
    }

    @Transactional(readOnly = true)
    public List<RegionDto> regions(String sido) {
        var list = sido == null || sido.isBlank()
                ? regionRepository.findAllByOrderBySidoAscSigunguAsc()
                : regionRepository.findBySidoOrderBySigungu(sido);
        return list.stream().map(RegionDto::from).toList();
    }

    private User find(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}

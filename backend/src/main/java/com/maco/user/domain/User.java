package com.maco.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** users 테이블 (docs/02 1장). created_at·updated_at은 DB 기본값이 채운다. */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    @Column(name = "provider_user_id")
    private String providerUserId;

    private String nickname;

    @Enumerated(EnumType.STRING)
    private UserMode mode;

    @Column(name = "store_type")
    private String storeType;

    @Column(name = "daily_goal_xp")
    private int dailyGoalXp;

    @Column(name = "habit_cue")
    private String habitCue;

    @Column(name = "region_id")
    private Long regionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ranking_visibility")
    private RankingVisibility rankingVisibility;

    @Column(name = "league_enabled")
    private boolean leagueEnabled;

    @Column(name = "placement_done")
    private boolean placementDone;

    @Column(name = "is_demo")
    private boolean demo;

    @Column(name = "demo_day_offset")
    private int demoDayOffset;

    @Builder
    private User(String email, String passwordHash, String nickname, UserMode mode, String storeType,
                 Integer dailyGoalXp, String habitCue, Long regionId, boolean demo) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.provider = AuthProvider.EMAIL;
        this.nickname = nickname;
        this.mode = mode;
        this.storeType = storeType;
        this.dailyGoalXp = dailyGoalXp == null ? 60 : dailyGoalXp;
        this.habitCue = habitCue;
        this.regionId = regionId;
        this.rankingVisibility = RankingVisibility.PUBLIC;
        this.leagueEnabled = true;
        this.placementDone = false;
        this.demo = demo;
        this.demoDayOffset = 0;
    }

    /** null인 값은 바꾸지 않는다 (PATCH) */
    public void updateSettings(UserMode mode, String storeType, Integer dailyGoalXp, String habitCue, Long regionId,
                               RankingVisibility visibility, Boolean leagueEnabled) {
        if (mode != null) this.mode = mode;
        if (storeType != null) this.storeType = storeType;
        if (dailyGoalXp != null) this.dailyGoalXp = dailyGoalXp;
        if (habitCue != null) this.habitCue = habitCue;
        if (regionId != null) this.regionId = regionId;
        if (visibility != null) this.rankingVisibility = visibility;
        if (leagueEnabled != null) this.leagueEnabled = leagueEnabled;
    }

    public void completePlacement() {
        this.placementDone = true;
    }

    /** 시연 날짜 넘기기 (시연 계정만, 확인은 서비스에서) */
    public void skipDays(int days) {
        this.demoDayOffset += days;
    }

    public void resetDemoDays() {
        this.demoDayOffset = 0;
    }
}

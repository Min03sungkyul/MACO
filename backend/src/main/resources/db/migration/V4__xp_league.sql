-- 점수·꾸준함·랭킹 (docs/02 5장, 담당: 박민하)

CREATE TABLE xp_log (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    reason     VARCHAR(30)  NOT NULL,
    amount     INT          NOT NULL,
    source_key VARCHAR(100) NOT NULL,
    xp_date    DATE         NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_xp_log_source UNIQUE (user_id, source_key),
    INDEX idx_xp_log_date (xp_date),
    CONSTRAINT fk_xp_log_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- busy_kept: 바쁜 날 2분 복습으로 목표를 채운 것으로 친 날 (기획서 C3)
CREATE TABLE daily_goal (
    user_id          BIGINT      NOT NULL,
    goal_date        DATE        NOT NULL,
    goal_xp          INT         NOT NULL,
    earned_xp        INT         NOT NULL DEFAULT 0,
    training_seconds INT         NOT NULL DEFAULT 0,
    solved_count     INT         NOT NULL DEFAULT 0,
    achieved         BOOLEAN     NOT NULL DEFAULT FALSE,
    busy_kept        BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, goal_date),
    CONSTRAINT fk_daily_goal_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE streak (
    user_id            BIGINT      PRIMARY KEY,
    current_days       INT         NOT NULL DEFAULT 0,
    best_days          INT         NOT NULL DEFAULT 0,
    last_achieved_date DATE        NULL,
    bonus_given_date   DATE        NULL,
    updated_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_streak_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE league_group (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    week_start DATE        NOT NULL,
    tier       TINYINT     NOT NULL,
    size       INT         NOT NULL DEFAULT 30,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_league_group_week (week_start, tier)
);

CREATE TABLE league_member (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id   BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    weekly_xp  INT         NOT NULL DEFAULT 0,
    `rank`     INT         NULL,
    result     VARCHAR(10) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_league_member UNIQUE (group_id, user_id),
    CONSTRAINT fk_league_member_group FOREIGN KEY (group_id) REFERENCES league_group (id) ON DELETE CASCADE,
    CONSTRAINT fk_league_member_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

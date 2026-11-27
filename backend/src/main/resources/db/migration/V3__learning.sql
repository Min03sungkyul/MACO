-- 학습 기록·Elo (docs/02 3장, 담당: 박민하)

CREATE TABLE user_skill (
    user_id       BIGINT      NOT NULL,
    skill_code    VARCHAR(10) NOT NULL,
    theta         DOUBLE      NOT NULL DEFAULT -1.2,
    level         TINYINT     NOT NULL DEFAULT 1,
    attempt_count INT         NOT NULL DEFAULT 0,
    correct_count INT         NOT NULL DEFAULT 0,
    updated_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, skill_code),
    CONSTRAINT fk_user_skill_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE lesson_session (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT      NOT NULL,
    lesson_id     BIGINT      NOT NULL,
    item_ids_json JSON        NULL,
    started_at    DATETIME(6) NOT NULL,
    finished_at   DATETIME(6) NULL,
    correct_count INT         NOT NULL DEFAULT 0,
    total_count   INT         NOT NULL DEFAULT 0,
    xp_gained     INT         NOT NULL DEFAULT 0,
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_lesson_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_session_lesson FOREIGN KEY (lesson_id) REFERENCES lesson (id)
);

CREATE TABLE attempt (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT      NOT NULL,
    item_id         BIGINT      NOT NULL,
    context         VARCHAR(20) NOT NULL,
    session_id      BIGINT      NULL,
    answer          VARCHAR(100) NULL,
    answer_text     TEXT        NULL,
    correct         BOOLEAN     NOT NULL,
    score           INT         NULL,
    error_type_code VARCHAR(40) NULL,
    elapsed_ms      INT         NULL,
    p_expected      DOUBLE      NULL,
    theta_before    DOUBLE      NULL,
    theta_after     DOUBLE      NULL,
    attempt_date    DATE        NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_attempt_user_date (user_id, attempt_date),
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_item FOREIGN KEY (item_id) REFERENCES item (id)
);

CREATE TABLE wrong_note (
    user_id          BIGINT      NOT NULL,
    item_id          BIGINT      NOT NULL,
    wrong_count      INT         NOT NULL DEFAULT 1,
    review_step      TINYINT     NOT NULL DEFAULT 0,
    last_wrong_date  DATE        NOT NULL,
    next_review_date DATE        NOT NULL,
    resolved         BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, item_id),
    CONSTRAINT fk_wrong_note_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_wrong_note_item FOREIGN KEY (item_id) REFERENCES item (id)
);

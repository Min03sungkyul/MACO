-- 시험 (docs/02 4장, 담당: 이동성)

CREATE TABLE quiz (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT      NOT NULL,
    kind          VARCHAR(10) NOT NULL,
    quiz_date     DATE        NOT NULL,
    item_ids_json JSON        NOT NULL,
    score         INT         NULL,
    submitted_at  DATETIME(6) NULL,
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_quiz_day UNIQUE (user_id, kind, quiz_date),
    CONSTRAINT fk_quiz_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE roleplay_session (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT      NOT NULL,
    scenario_id        BIGINT      NOT NULL,
    turns_json         JSON        NOT NULL,
    status             VARCHAR(15) NOT NULL DEFAULT 'IN_PROGRESS',
    rubric_scores_json JSON        NULL,
    total_score        INT         NULL,
    report_json        JSON        NULL,
    xp_gained          INT         NOT NULL DEFAULT 0,
    ai_source          VARCHAR(10) NULL,
    created_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_roleplay_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_roleplay_session_scenario FOREIGN KEY (scenario_id) REFERENCES roleplay_scenario (id)
);

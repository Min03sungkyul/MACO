-- 내 가게 (docs/02 6장, 담당: 강민국)

CREATE TABLE store (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    name         VARCHAR(100) NOT NULL,
    category     VARCHAR(100) NULL,
    address      VARCHAR(255) NULL,
    road_address VARCHAR(255) NULL,
    region_id    BIGINT       NULL,
    naver_link   VARCHAR(255) NULL,
    mapx         VARCHAR(20)  NULL,
    mapy         VARCHAR(20)  NULL,
    verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_store_user UNIQUE (user_id),
    CONSTRAINT fk_store_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_store_region FOREIGN KEY (region_id) REFERENCES region (id)
);

CREATE TABLE capture (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id       BIGINT       NOT NULL,
    platform       VARCHAR(10)  NOT NULL,
    image_path     VARCHAR(255) NOT NULL,
    status         VARCHAR(10)  NOT NULL DEFAULT 'UPLOADED',
    ai_read_json   JSON         NULL,
    confirmed_json JSON         NULL,
    ai_source      VARCHAR(10)  NULL,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_capture_store FOREIGN KEY (store_id) REFERENCES store (id) ON DELETE CASCADE
);

CREATE TABLE gate_check (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id         BIGINT      NOT NULL,
    check_date       DATE        NOT NULL,
    place_capture_id BIGINT      NULL,
    insta_capture_id BIGINT      NULL,
    find_score       INT         NOT NULL,
    trust_score      INT         NOT NULL,
    notify_score     INT         NOT NULL,
    find_passed      BOOLEAN     NOT NULL,
    trust_passed     BOOLEAN     NOT NULL,
    ad_unlocked      BOOLEAN     NOT NULL,
    findings_json    JSON        NULL,
    created_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_gate_check_store FOREIGN KEY (store_id) REFERENCES store (id) ON DELETE CASCADE
);

CREATE TABLE spot_game (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT      NOT NULL,
    source           VARCHAR(10) NOT NULL,
    source_id        BIGINT      NULL,
    hotspot_ids_json JSON        NULL,
    found_ids_json   JSON        NULL,
    finished_at      DATETIME(6) NULL,
    created_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_spot_game_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE mission (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(40)  NOT NULL,
    skill_code   VARCHAR(10)  NOT NULL,
    gate         VARCHAR(10)  NOT NULL,
    title        VARCHAR(100) NOT NULL,
    description  TEXT         NULL,
    unlock_level TINYINT      NOT NULL DEFAULT 1,
    submit_type  VARCHAR(10)  NOT NULL,
    rubric_code  VARCHAR(40)  NULL,
    mode_scope   VARCHAR(10)  NOT NULL DEFAULT 'BOTH',
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_mission_code UNIQUE (code)
);

CREATE TABLE mission_submission (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    mission_id    BIGINT       NOT NULL,
    text          TEXT         NULL,
    image_path    VARCHAR(255) NULL,
    feedback_json JSON         NULL,
    score         INT          NULL,
    passed        BOOLEAN      NOT NULL DEFAULT FALSE,
    ai_source     VARCHAR(10)  NULL,
    submitted_at  DATETIME(6)  NOT NULL,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_mission_submission_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_mission_submission_mission FOREIGN KEY (mission_id) REFERENCES mission (id)
);

CREATE TABLE review_card (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id      BIGINT       NOT NULL,
    message       VARCHAR(255) NOT NULL,
    qr_target_url VARCHAR(500) NOT NULL,
    design        VARCHAR(20)  NULL,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_review_card_store FOREIGN KEY (store_id) REFERENCES store (id) ON DELETE CASCADE
);

CREATE TABLE review_request_log (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id   BIGINT      NOT NULL,
    log_date   DATE        NOT NULL,
    count      INT         NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_review_request_day UNIQUE (store_id, log_date),
    CONSTRAINT fk_review_request_store FOREIGN KEY (store_id) REFERENCES store (id) ON DELETE CASCADE
);

-- MVP 미션 2종 (prototype/components/train/shop.tsx MISSIONS). 스킬 Lv2부터 열린다 (가정값)
INSERT INTO mission (code, skill_code, gate, title, description, unlock_level, submit_type, rubric_code) VALUES
    ('M-PHOTO', 'PHOTO', 'FIND', '대표 메뉴 사진 다시 찍기', '배운 대로 밝고 선명하게, 주인공 하나만 크게 찍어 올려요. 마코가 밝기와 선명도를 채점해요.', 2, 'PHOTO', NULL),
    ('M-REPLY', 'REVIEW', 'TRUST', '최근 리뷰에 답글 달기', '공감 → 사과 → 개선 → 다시 오기 순서로 직접 답글을 써요. 마코는 대신 써 주지 않고 첨삭만 해요.', 2, 'TEXT', 'REPLY_COMPLAINT');

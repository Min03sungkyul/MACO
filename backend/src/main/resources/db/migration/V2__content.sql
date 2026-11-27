-- 콘텐츠 (docs/02 2장). 행은 content/ CSV 적재기가 넣는다. 구조 담당: 박민하, 열 확인: 이동성

CREATE TABLE skill (
    code       VARCHAR(10)  PRIMARY KEY,
    name       VARCHAR(30)  NOT NULL,
    gate       VARCHAR(10)  NOT NULL,
    unit_order INT          NOT NULL,
    can_lv1    VARCHAR(100) NULL,
    can_lv3    VARCHAR(100) NULL,
    can_lv5    VARCHAR(100) NULL,
    ready      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE concept_card (
    id         BIGINT       PRIMARY KEY,
    skill_code VARCHAR(10)  NOT NULL,
    level      TINYINT      NOT NULL,
    title      VARCHAR(100) NOT NULL,
    body       TEXT         NOT NULL,
    evidence   VARCHAR(255) NULL,
    image      VARCHAR(255) NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_concept_skill FOREIGN KEY (skill_code) REFERENCES skill (code)
);

CREATE TABLE lesson (
    id              BIGINT       PRIMARY KEY,
    skill_code      VARCHAR(10)  NOT NULL,
    level           TINYINT      NOT NULL,
    seq             INT          NOT NULL,
    title           VARCHAR(100) NOT NULL,
    concept_card_id BIGINT       NULL,
    item_count      INT          NOT NULL DEFAULT 7,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_lesson_skill FOREIGN KEY (skill_code) REFERENCES skill (code),
    CONSTRAINT fk_lesson_concept FOREIGN KEY (concept_card_id) REFERENCES concept_card (id)
);

CREATE TABLE error_type (
    code        VARCHAR(40)  PRIMARY KEY,
    skill_code  VARCHAR(10)  NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255) NULL,
    fix_tip     VARCHAR(255) NOT NULL,
    evidence    VARCHAR(255) NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE item (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40)  NOT NULL,
    skill_code      VARCHAR(10)  NOT NULL,
    type            VARCHAR(10)  NOT NULL,
    kind            VARCHAR(10)  NOT NULL DEFAULT 'RULE',
    mode_scope      VARCHAR(10)  NOT NULL DEFAULT 'BOTH',
    store_type      VARCHAR(20)  NULL,
    prompt          TEXT         NOT NULL,
    context         TEXT         NULL,
    media           VARCHAR(255) NULL,
    choices_json    JSON         NULL,
    answer          VARCHAR(100) NULL,
    rubric_code     VARCHAR(40)  NULL,
    sample_answer   TEXT         NULL,
    explanation     TEXT         NOT NULL,
    concept_card_id BIGINT       NULL,
    init_difficulty TINYINT      NOT NULL DEFAULT 3,
    difficulty      DOUBLE       NULL,
    attempt_count   INT          NOT NULL DEFAULT 0,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_item_code UNIQUE (code),
    CONSTRAINT fk_item_skill FOREIGN KEY (skill_code) REFERENCES skill (code),
    CONSTRAINT fk_item_concept FOREIGN KEY (concept_card_id) REFERENCES concept_card (id)
);

-- 틀린 곳 찾기 영역. 프로토타입은 좌표 대신 격자·목록 조각이라 x·y·w·h는 비어 있을 수 있다.
CREATE TABLE hotspot (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_type      VARCHAR(20)  NOT NULL,
    owner_code      VARCHAR(40)  NOT NULL,
    part_key        VARCHAR(10)  NOT NULL,
    seq             INT          NOT NULL DEFAULT 0,
    label           VARCHAR(255) NULL,
    stars           TINYINT      NULL,
    bad             BOOLEAN      NOT NULL DEFAULT FALSE,
    error_type_code VARCHAR(40)  NULL,
    reason          VARCHAR(255) NULL,
    x               DOUBLE       NULL,
    y               DOUBLE       NULL,
    w               DOUBLE       NULL,
    h               DOUBLE       NULL,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_hotspot UNIQUE (owner_type, owner_code, part_key)
);

CREATE TABLE rubric (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40)  NOT NULL,
    criterion_key   VARCHAR(20)  NOT NULL,
    seq             INT          NOT NULL DEFAULT 0,
    criterion       VARCHAR(50)  NOT NULL,
    weight          DOUBLE       NOT NULL DEFAULT 1,
    description     VARCHAR(255) NULL,
    good            VARCHAR(255) NULL,
    fix             VARCHAR(255) NULL,
    error_type_code VARCHAR(40)  NULL,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_rubric UNIQUE (code, criterion_key)
);

CREATE TABLE roleplay_scenario (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(40)  NOT NULL,
    skill_code   VARCHAR(10)  NOT NULL,
    title        VARCHAR(100) NOT NULL,
    persona      TEXT         NOT NULL,
    opening_line TEXT         NOT NULL,
    max_turns    INT          NOT NULL DEFAULT 3,
    rubric_code  VARCHAR(40)  NOT NULL,
    mode_scope   VARCHAR(10)  NOT NULL DEFAULT 'BOTH',
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_roleplay_code UNIQUE (code)
);

CREATE TABLE practice_store (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(20)  NOT NULL,
    store_type       VARCHAR(20)  NOT NULL,
    name             VARCHAR(50)  NOT NULL,
    place_image      VARCHAR(255) NULL,
    insta_image      VARCHAR(255) NULL,
    menu_json        JSON         NULL,
    reviews_json     JSON         NULL,
    gate_preset_json JSON         NULL,
    created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_practice_store_code UNIQUE (code)
);

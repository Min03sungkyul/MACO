-- 사용자·지역 (docs/02 1장, 담당: 박민하)

CREATE TABLE region (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    sido       VARCHAR(20)  NOT NULL,
    sigungu    VARCHAR(20)  NOT NULL,
    code       VARCHAR(10)  NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_region_code UNIQUE (code)
);

CREATE TABLE users (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    email              VARCHAR(255) NULL,
    password_hash      VARCHAR(100) NULL,
    provider           VARCHAR(10)  NOT NULL DEFAULT 'EMAIL',
    provider_user_id   VARCHAR(100) NULL,
    nickname           VARCHAR(30)  NOT NULL,
    mode               VARCHAR(10)  NULL,
    store_type         VARCHAR(20)  NULL,
    daily_goal_xp      INT          NOT NULL DEFAULT 60,
    habit_cue          VARCHAR(50)  NULL,
    region_id          BIGINT       NULL,
    ranking_visibility VARCHAR(10)  NOT NULL DEFAULT 'PUBLIC',
    league_enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    placement_done     BOOLEAN      NOT NULL DEFAULT FALSE,
    is_demo            BOOLEAN      NOT NULL DEFAULT FALSE,
    demo_day_offset    INT          NOT NULL DEFAULT 0,
    created_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_provider UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_users_region FOREIGN KEY (region_id) REFERENCES region (id)
);

-- MVP 지역: 인천·서울 일부 구 (행정구역 코드)
INSERT INTO region (sido, sigungu, code) VALUES
    ('인천광역시', '중구', '28110'),
    ('인천광역시', '동구', '28140'),
    ('인천광역시', '미추홀구', '28177'),
    ('인천광역시', '연수구', '28185'),
    ('인천광역시', '남동구', '28200'),
    ('인천광역시', '부평구', '28237'),
    ('인천광역시', '계양구', '28245'),
    ('인천광역시', '서구', '28260'),
    ('서울특별시', '종로구', '11110'),
    ('서울특별시', '성동구', '11200'),
    ('서울특별시', '마포구', '11440'),
    ('서울특별시', '관악구', '11620'),
    ('서울특별시', '강남구', '11680');

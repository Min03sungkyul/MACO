-- AI 모듈 (docs/02 7장, 담당: 강민국)

CREATE TABLE ai_cache (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cache_key   VARCHAR(100) NOT NULL,
    task        VARCHAR(30)  NOT NULL,
    output_json JSON         NOT NULL,
    model       VARCHAR(50)  NULL,
    hit_count   INT          NOT NULL DEFAULT 0,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_ai_cache_key UNIQUE (cache_key)
);

CREATE TABLE ai_log (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT        NULL,
    task          VARCHAR(30)   NOT NULL,
    model         VARCHAR(50)   NULL,
    source        VARCHAR(10)   NOT NULL,
    input_tokens  INT           NULL,
    output_tokens INT           NULL,
    cost_usd      DECIMAL(10,6) NULL,
    latency_ms    INT           NULL,
    ok            BOOLEAN       NOT NULL,
    error_code    VARCHAR(50)   NULL,
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_ai_log_task (task, created_at)
);

CREATE TABLE ai_recorded (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    task        VARCHAR(30)  NOT NULL,
    match_key   VARCHAR(100) NOT NULL,
    output_json JSON         NOT NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_ai_recorded UNIQUE (task, match_key)
);

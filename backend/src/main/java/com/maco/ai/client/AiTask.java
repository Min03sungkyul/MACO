package com.maco.ai.client;

/** AI가 하는 일 목록 (docs/01 5-4). 프롬프트는 resources/prompts/<task>.md */
public enum AiTask {
    CAPTURE_READ_PLACE,   // 내 가게: 플레이스 캡처 → 항목값
    CAPTURE_READ_INSTA,   // 내 가게: 인스타 캡처 → 항목값
    REWRITE_GRADE,        // 트레이닝: 고쳐 쓰기 루브릭 채점
    EXPLAIN_WRONG,        // 트레이닝·시험: "왜 틀렸어요?"
    ROLEPLAY_TURN,        // 시험: 상황극 손님의 다음 말
    ROLEPLAY_REPORT,      // 시험: 상황극 루브릭 리포트
    MISSION_FEEDBACK,     // 내 가게: 미션 제출물 첨삭
    WEEKLY_COACH          // 시험: 주간 코칭 (P1)
}

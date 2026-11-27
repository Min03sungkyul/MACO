package com.maco.ai.dto;

import com.maco.ai.client.AiInput;

/**
 * 미션 첨삭 입력. 사진 미션은 서버가 계산한 밝기·선명도를 같이 넘긴다 (AI가 실패해도 규칙 첨삭).
 *
 * @param grade 글 미션이면 루브릭 입력, 사진 미션이면 null
 */
public record MissionFeedbackInput(String missionCode, String submitType, GradeInput grade, Double brightness,
                                   Double sharpness, String imagePath) implements AiInput {

    @Override
    public String matchKey() {
        return missionCode + ":" + (grade == null ? imagePath : grade.matchKey());
    }
}

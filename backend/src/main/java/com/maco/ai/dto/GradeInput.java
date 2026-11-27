package com.maco.ai.dto;

import com.maco.ai.client.AiInput;
import java.util.List;

/**
 * 고쳐 쓰기·미션 글 첨삭 입력.
 *
 * @param rubricCode 루브릭 코드 (REPLY_PRAISE, REPLY_COMPLAINT)
 * @param criteria   루브릭 항목 (content의 rubric 표)
 * @param context    손님 리뷰 등 문제 상황
 * @param text       사용자가 쓴 글
 */
public record GradeInput(String rubricCode, List<Criterion> criteria, String context, String text) implements AiInput {

    public record Criterion(String key, String label, String good, String fix, String errorType) {
    }

    @Override
    public String matchKey() {
        return rubricCode + ":" + Integer.toHexString(text == null ? 0 : text.trim().hashCode());
    }
}

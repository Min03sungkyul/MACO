package com.maco.ai.dto;

import com.maco.ai.client.AiInput;

/** "왜 틀렸어요?" 입력 */
public record ExplainInput(String itemCode, String prompt, String chosen, String errorType, String errorName,
                           String fixTip, String explanation) implements AiInput {

    @Override
    public String matchKey() {
        return itemCode + ":" + chosen;
    }
}

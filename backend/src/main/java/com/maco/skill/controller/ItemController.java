package com.maco.skill.controller;

import com.maco.ai.client.AiClient;
import com.maco.ai.client.AiResult;
import com.maco.ai.client.AiSource;
import com.maco.ai.client.AiTask;
import com.maco.ai.dto.ExplainInput;
import com.maco.ai.dto.ExplainOutput;
import com.maco.common.api.ApiResponse;
import com.maco.content.dto.ErrorTypeDto;
import com.maco.content.dto.ItemDto;
import com.maco.content.dto.ItemKey;
import com.maco.content.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** "왜 틀렸어요?" — 누를 때만 AI를 부른다 (S9). 담당: 박민하 (AI는 강민국의 AiClient) */
@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ContentService contentService;
    private final AiClient aiClient;

    public record ExplainRequest(String answer) {
    }

    public record ExplainResponse(String text, AiSource source) {
    }

    @PostMapping("/{itemId}/explain")
    public ApiResponse<ExplainResponse> explain(@PathVariable Long itemId, @RequestBody ExplainRequest req) {
        ItemDto item = contentService.item(itemId);
        ItemKey key = contentService.itemKey(itemId);
        String chosen = req.answer() == null ? "" : req.answer().trim().toUpperCase();
        String errorCode = key.choiceErrorTypes().get(chosen);
        ErrorTypeDto err = contentService.errorType(errorCode).orElse(null);
        ExplainInput input = new ExplainInput(item.code(), item.prompt(), chosen, errorCode,
                err == null ? null : err.name(), err == null ? null : err.fixTip(), key.explanation());
        AiResult<ExplainOutput> r = aiClient.run(AiTask.EXPLAIN_WRONG, input, ExplainOutput.class);
        return ApiResponse.ok(new ExplainResponse(r.data().text(), r.source()));
    }
}

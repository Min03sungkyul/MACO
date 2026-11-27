package com.maco.ai.dto;

import com.maco.ai.client.AiInput;
import java.util.List;

/** @param ownerTurnIndex 사장님 답의 순서 (0부터) */
public record RoleplayTurnInput(String scenarioCode, String persona, int maxTurns, int ownerTurnIndex,
                                List<RoleplayTurn> turns, String ownerText) implements AiInput {

    @Override
    public String matchKey() {
        return scenarioCode + ":" + ownerTurnIndex;
    }
}

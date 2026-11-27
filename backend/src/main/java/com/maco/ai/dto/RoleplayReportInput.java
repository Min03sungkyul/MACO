package com.maco.ai.dto;

import com.maco.ai.client.AiInput;
import java.util.List;

public record RoleplayReportInput(String scenarioCode, String rubricCode, List<GradeInput.Criterion> criteria,
                                  List<RoleplayTurn> turns) implements AiInput {

    @Override
    public String matchKey() {
        return scenarioCode + ":" + turns.size();
    }
}

package com.maco.ai.dto;

import java.util.List;

/** 상황극 리포트: 루브릭 점수, 잘한 점, 고칠 문장 최대 3개 */
public record RoleplayReportOutput(int score, List<GradeOutput.Check> checks, String good, List<FixLine> lines) {

    public record FixLine(int turn, String text, String fix) {
    }
}

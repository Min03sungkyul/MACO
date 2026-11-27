package com.maco.ai.dto;

import java.util.List;

/** 루브릭 채점 결과: 잘한 점 먼저, 고칠 점은 하나만 (기획서 8-3) */
public record GradeOutput(int score, boolean pass, List<Check> checks, String good, String fix,
                          List<String> errorTypes) {

    public record Check(String key, String label, boolean ok) {
    }
}

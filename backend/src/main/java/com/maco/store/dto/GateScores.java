package com.maco.store.dto;

/** 관문 점수 0~100과 통과 여부. 광고는 찾게·믿게를 통과해야 열린다. */
public record GateScores(int findScore, int trustScore, int notifyScore, boolean findPassed, boolean trustPassed,
                         boolean notifyPassed, boolean adUnlocked) {
}

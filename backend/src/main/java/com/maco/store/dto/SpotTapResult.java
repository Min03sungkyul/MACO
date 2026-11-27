package com.maco.store.dto;

import com.maco.xp.dto.XpResult;

/** @param reason 진단 카드 문장 (맞았을 때), xp 찾을 때마다 +5 */
public record SpotTapResult(boolean found, String card, String tip, int foundCount, int toFind, XpResult xp) {
}

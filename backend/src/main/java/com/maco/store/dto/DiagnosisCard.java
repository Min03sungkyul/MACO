package com.maco.store.dto;

/**
 * 진단 카드 (점수 낮은 항목부터).
 *
 * @param value 0~1 (1이면 충족)
 * @param skill 연결된 트레이닝 스킬 → "이 연습 하러 가기"
 */
public record DiagnosisCard(String gate, String key, String label, double value, String card, String skill) {
}

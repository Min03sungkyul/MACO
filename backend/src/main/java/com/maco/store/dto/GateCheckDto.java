package com.maco.store.dto;

import com.maco.ai.dto.Readings;
import java.time.LocalDate;
import java.util.List;

/** 관문 진단 결과 — S17, S21 */
public record GateCheckDto(LocalDate checkDate, Readings readings, GateScores scores, List<DiagnosisCard> cards) {
}

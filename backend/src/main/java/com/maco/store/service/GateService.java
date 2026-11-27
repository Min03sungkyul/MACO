package com.maco.store.service;

import com.maco.ai.dto.Readings;
import com.maco.store.domain.Gate;
import com.maco.store.domain.GatePolicy;
import com.maco.store.dto.DiagnosisCard;
import com.maco.store.dto.GateScores;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/** 관문 점수·진단 카드 계산 (prototype gates.ts의 gateScores, diagnosisCards, adsUnlocked). AI 없이 규칙으로. */
@Service
public class GateService {

    public GateScores scores(Readings r) {
        int find = score(r, Gate.FIND);
        int trust = score(r, Gate.TRUST);
        int notify = score(r, Gate.NOTIFY);
        boolean fp = find >= GatePolicy.PASS;
        boolean tp = trust >= GatePolicy.PASS;
        return new GateScores(find, trust, notify, fp, tp, notify >= GatePolicy.PASS, fp && tp);
    }

    /** 점수가 낮은 항목부터, 연결된 연습까지 */
    public List<DiagnosisCard> cards(Readings r) {
        return GatePolicy.RULES.stream()
                .map(x -> new DiagnosisCard(x.gate().name(), x.key(), x.label(), x.score().applyAsDouble(r), x.card(), x.skill()))
                .filter(c -> c.value() < 1)
                .sorted(Comparator.comparingDouble(DiagnosisCard::value))
                .toList();
    }

    private int score(Readings r, Gate gate) {
        List<GatePolicy.Rule> rules = GatePolicy.RULES.stream().filter(x -> x.gate() == gate).toList();
        double sum = rules.stream().mapToDouble(x -> x.score().applyAsDouble(r)).sum();
        return (int) Math.round(sum / rules.size() * 100);
    }
}

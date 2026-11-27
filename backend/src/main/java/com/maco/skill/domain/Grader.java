package com.maco.skill.domain;

import com.maco.content.dto.ItemKey;
import java.util.Arrays;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/** 규칙 채점 (AI 없음). 고쳐 쓰기는 AI 채점 점수로 판단한다. */
public final class Grader {

    private Grader() {
    }

    public record Graded(boolean correct, String errorType) {
    }

    public static Graded grade(ItemKey key, String answer, Integer rewriteScore) {
        return switch (key.type()) {
            case "CHOICE2", "JUDGE" -> {
                boolean ok = key.answer() != null && key.answer().equalsIgnoreCase(trim(answer));
                yield new Graded(ok, ok ? null : key.choiceErrorTypes().get(trim(answer).toUpperCase()));
            }
            case "SPOT" -> {
                Set<String> expected = split(key.answer());
                Set<String> given = split(answer);
                boolean ok = expected.equals(given);
                // 틀렸으면 놓친 조각 또는 잘못 고른 조각의 오류 유형 하나
                String err = ok ? null : expected.stream().filter(k -> !given.contains(k)).findFirst()
                        .or(() -> given.stream().filter(k -> !expected.contains(k)).findFirst())
                        .map(k -> key.choiceErrorTypes().get(k)).orElse(null);
                yield new Graded(ok, err);
            }
            case "REWRITE" -> {
                boolean ok = rewriteScore != null && rewriteScore >= SkillPolicy.REWRITE_PASS_SCORE;
                yield new Graded(ok, null);
            }
            default -> new Graded(false, null);
        };
    }

    private static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    private static Set<String> split(String s) {
        if (s == null || s.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(s.split("[|,]")).map(String::trim).filter(x -> !x.isEmpty())
                .collect(Collectors.toCollection(TreeSet::new));
    }
}

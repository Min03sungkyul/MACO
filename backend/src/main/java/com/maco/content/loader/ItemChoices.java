package com.maco.content.loader;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * items.csv의 choice_a~d, error_a~d 열 → item.choices_json 형식으로 바꾼다.
 * 보기 칸이 "photo:"로 시작하면 그림 스펙(image), 아니면 글(text).
 */
public final class ItemChoices {

    private static final String[] KEYS = {"a", "b", "c", "d"};

    private ItemChoices() {
    }

    public static List<Map<String, String>> fromRow(Map<String, String> row) {
        List<Map<String, String>> out = new ArrayList<>();
        for (String k : KEYS) {
            String value = row.getOrDefault("choice_" + k, "");
            if (value.isBlank()) {
                continue;
            }
            Map<String, String> c = new LinkedHashMap<>();
            c.put("key", k.toUpperCase());
            if (value.startsWith("photo:") || value.startsWith("images/")) {
                c.put("image", value);
            } else {
                c.put("text", value);
            }
            String err = row.getOrDefault("error_" + k, "");
            if (!err.isBlank()) {
                c.put("errorType", err);
            }
            out.add(c);
        }
        return out;
    }
}

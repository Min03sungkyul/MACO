package com.maco.content.loader;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 작은 CSV 읽기 (RFC 4180: 큰따옴표 안의 쉼표·줄바꿈·"" 처리). 첫 줄은 열 이름. */
public final class CsvReader {

    private CsvReader() {
    }

    public static List<Map<String, String>> read(String text) {
        List<List<String>> rows = parse(text.startsWith("﻿") ? text.substring(1) : text);
        if (rows.isEmpty()) {
            return List.of();
        }
        List<String> header = rows.get(0);
        List<Map<String, String>> out = new ArrayList<>();
        for (List<String> row : rows.subList(1, rows.size())) {
            if (row.size() == 1 && row.get(0).isBlank()) {
                continue;
            }
            Map<String, String> m = new LinkedHashMap<>();
            for (int i = 0; i < header.size(); i++) {
                m.put(header.get(i).trim(), i < row.size() ? row.get(i) : "");
            }
            out.add(m);
        }
        return out;
    }

    private static List<List<String>> parse(String s) {
        List<List<String>> rows = new ArrayList<>();
        List<String> row = new ArrayList<>();
        StringBuilder cell = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (quoted) {
                if (c == '"' && i + 1 < s.length() && s.charAt(i + 1) == '"') {
                    cell.append('"');
                    i++;
                } else if (c == '"') {
                    quoted = false;
                } else {
                    cell.append(c);
                }
            } else if (c == '"') {
                quoted = true;
            } else if (c == ',') {
                row.add(cell.toString());
                cell.setLength(0);
            } else if (c == '\n' || c == '\r') {
                if (c == '\r' && i + 1 < s.length() && s.charAt(i + 1) == '\n') {
                    i++;
                }
                row.add(cell.toString());
                cell.setLength(0);
                rows.add(row);
                row = new ArrayList<>();
            } else {
                cell.append(c);
            }
        }
        if (cell.length() > 0 || !row.isEmpty()) {
            row.add(cell.toString());
            rows.add(row);
        }
        return rows;
    }
}

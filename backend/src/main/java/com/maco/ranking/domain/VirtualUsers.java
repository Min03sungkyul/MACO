package com.maco.ranking.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * 시연용 가상 사용자 (기획서 12-1: 리그·부평구 가상 사용자 30~400명). prototype/lib/train/league.ts의 시드 방식.
 * 같은 주·같은 지역이면 언제나 같은 숫자가 나온다.
 * TODO(박민하): users.is_demo=true 가상 사용자와 xp_log를 DB에 시드하고, 실제 집계 쿼리로 바꾼다.
 */
public final class VirtualUsers {

    private VirtualUsers() {
    }

    public static final List<String> NAMES = List.of("부평 빵공방", "삼산 꽃집", "갈산 네일", "부개 국밥", "청천 라떼",
            "산곡 떡집", "십정 공방", "일신 반찬", "구산 문구", "부평 와인바", "삼산 커피", "갈산 분식", "부개 미용실",
            "청천 베이글", "산곡 정육", "십정 카페", "일신 꽃차", "구산 피자", "부평 도넛", "삼산 수제버거", "갈산 쌀국수",
            "부개 케이크", "청천 브런치", "산곡 김밥", "십정 마카롱", "일신 젤라또", "구산 샐러드", "부평 찻집", "삼산 포케",
            "갈산 와플");

    public record Entry(String name, int xp) {
    }

    /** mulberry32 (프로토타입과 같은 난수) */
    static final class Rand {
        private int t;

        Rand(int seed) {
            this.t = seed;
        }

        double next() {
            t += 0x6d2b79f5;
            int r = (t ^ (t >>> 15)) * (1 | t);
            r ^= r + (r ^ (r >>> 7)) * (61 | r);
            return ((r ^ (r >>> 14)) & 0xffffffffL) / 4294967296.0;
        }
    }

    static int hash(String s) {
        int h = 0x811c9dc5;
        for (char c : s.toCharArray()) {
            h = (h ^ c) * 16777619;
        }
        return h;
    }

    /** 이번 주 리그의 다른 29명 주간 XP. dayIndex(0=월)가 지날수록 쌓인다. */
    public static List<Entry> league(String weekStart, int dayIndex) {
        Rand rnd = new Rand(hash(weekStart));
        List<Entry> out = new ArrayList<>();
        for (String name : NAMES.subList(0, RankingPolicy.GROUP_SIZE - 1)) {
            int weekly = (int) Math.round(40 + rnd.next() * 520);
            out.add(new Entry(name, Math.round(weekly * (dayIndex + 1) / 7f)));
        }
        return out;
    }

    /** 구 단위 다른 사용자들의 주간 XP (300~549명) */
    public static List<Integer> region(String region, String weekStart, int dayIndex) {
        Rand rnd = new Rand(hash(region + weekStart));
        int total = 300 + (int) Math.floor(new Rand(hash(region)).next() * 250);
        double scale = (dayIndex + 1) / 7.0;
        List<Integer> xs = new ArrayList<>();
        for (int i = 0; i < total - 1; i++) {
            xs.add((int) Math.round(Math.pow(rnd.next(), 2.2) * 700 * scale));
        }
        xs.sort((a, b) -> b - a);
        return xs;
    }
}

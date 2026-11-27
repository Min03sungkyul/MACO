package com.maco.ranking.domain;

import java.util.List;

/** 리그·지역 랭킹 규칙 (기획서 8-2, prototype/lib/train/league.ts). 숫자는 가정값. */
public final class RankingPolicy {

    private RankingPolicy() {
    }

    public static final List<String> TIERS = List.of("동네 새싹", "골목 스타", "상권 고수", "지역 명소", "마케팅 마스터"); // 가정값: 등급 이름 (12/8 팀 결정)
    public static final int GROUP_SIZE = 30;  // 가정값
    public static final int PROMOTE = 7;      // 가정값: 상위 7명 승급
    public static final int DEMOTE = 5;       // 가정값: 하위 5명 강등
    public static final int TOP_N = 10;       // 지역 랭킹 상위 몇 명을 보여 주나
}

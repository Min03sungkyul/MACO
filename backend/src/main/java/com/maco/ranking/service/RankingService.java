package com.maco.ranking.service;

import com.maco.common.time.AppClock;
import com.maco.ranking.domain.RankingPolicy;
import com.maco.ranking.domain.VirtualUsers;
import com.maco.ranking.dto.RankingDtos.League;
import com.maco.ranking.dto.RankingDtos.RankRow;
import com.maco.ranking.dto.RankingDtos.RegionRank;
import com.maco.user.dto.MeResponse;
import com.maco.user.service.UserService;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 주간 리그·지역 랭킹 (담당: 박민하). 화면 S22~S23.
 * 지금은 가상 사용자(VirtualUsers)와 내 주간 XP(스텁 0)로 계산한다.
 * TODO(박민하): 내 주간 XP = 그 주 xp_log 합 (AppClock.weekStart), league_group·league_member 배정, 월요일 마감 승급·강등,
 * 지역 랭킹 = 그 주 xp_log를 region별 합산 (네이티브 쿼리 허용). 4주 넘기기 뒤 지역 5위가 나오게 맞추기 (docs/07).
 */
@Service
@RequiredArgsConstructor
public class RankingService {

    private final AppClock appClock;
    private final UserService userService;

    public League league(Long userId) {
        MeResponse me = userService.getMe(userId);
        LocalDate week = appClock.weekStart(userId);
        int day = (int) ChronoUnit.DAYS.between(week, appClock.today(userId));
        int myXp = 0;
        List<RankRow> rows = new ArrayList<>();
        List<VirtualUsers.Entry> all = new ArrayList<>(VirtualUsers.league(week.toString(), day));
        all.add(new VirtualUsers.Entry(me.nickname(), myXp));
        all.sort(Comparator.comparingInt(VirtualUsers.Entry::xp).reversed());
        int myRank = 0;
        for (int i = 0; i < all.size(); i++) {
            boolean isMe = all.get(i).name().equals(me.nickname()) && all.get(i).xp() == myXp && myRank == 0;
            if (isMe) myRank = i + 1;
            rows.add(new RankRow(i + 1, all.get(i).name(), all.get(i).xp(), isMe));
        }
        int promoteXp = all.get(RankingPolicy.PROMOTE - 1).xp();
        int hoursLeft = (7 - day) * 24;
        return new League(1, RankingPolicy.TIERS.get(0), week, hoursLeft, RankingPolicy.PROMOTE,
                RankingPolicy.GROUP_SIZE - RankingPolicy.DEMOTE, myRank, Math.max(0, promoteXp - myXp + 1), rows);
    }

    public RegionRank region(Long userId) {
        MeResponse me = userService.getMe(userId);
        String region = me.region() == null ? "부평구" : me.region().sigungu();
        LocalDate week = appClock.weekStart(userId);
        int day = (int) ChronoUnit.DAYS.between(week, appClock.today(userId));
        int myXp = 0;
        return regionRank(region, VirtualUsers.region(region, week.toString(), day), me.nickname(), myXp);
    }

    /** 내 순위, 상위 10명, 바로 위·아래 */
    static RegionRank regionRank(String region, List<Integer> others, String myName, int myXp) {
        int rank = 1 + (int) others.stream().filter(x -> x > myXp).count();
        int total = others.size() + 1;
        List<RankRow> rows = new ArrayList<>();
        String prefix = region.replaceAll("구$", "");
        for (int i = 0; i < others.size(); i++) {
            String name = VirtualUsers.NAMES.get(i % VirtualUsers.NAMES.size()).replaceFirst("^\\S+", prefix)
                    + (i >= VirtualUsers.NAMES.size() ? " " + (i / VirtualUsers.NAMES.size() + 1) : "");
            rows.add(new RankRow(0, name, others.get(i), false));
        }
        rows.add(rank - 1, new RankRow(rank, myName, myXp, true));
        List<RankRow> ranked = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            RankRow r = rows.get(i);
            ranked.add(new RankRow(i + 1, r.name(), r.xp(), r.me()));
        }
        int topPercent = Math.max(1, Math.round(100f * rank / total));
        return new RegionRank(region, rank, total, topPercent,
                ranked.subList(0, Math.min(RankingPolicy.TOP_N, ranked.size())),
                ranked.subList(Math.max(0, rank - 2), Math.min(ranked.size(), rank + 1)));
    }
}

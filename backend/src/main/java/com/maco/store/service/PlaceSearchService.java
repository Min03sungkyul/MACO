package com.maco.store.service;

import com.maco.store.dto.PlaceSearchResult;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * 가게 찾기 (기획서 A2): 네이버 검색 API(지역)로 상호·업종·주소만 확인한다. 크롤링은 하지 않는다.
 * NAVER_SEARCH_CLIENT_ID/SECRET이 없거나 실패하면 시연용 결과. (prototype app/api/local-search)
 */
@Slf4j
@Service
public class PlaceSearchService {

    private final RestClient client = RestClient.create("https://openapi.naver.com");
    private final String clientId;
    private final String clientSecret;

    public PlaceSearchService(@Value("${maco.naver-search.client-id:}") String clientId,
                              @Value("${maco.naver-search.client-secret:}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    record NaverItem(String title, String category, String address, String roadAddress, String mapx, String mapy,
                     String link) {
    }

    record NaverResponse(List<NaverItem> items) {
    }

    public List<PlaceSearchResult> search(String query) {
        String q = query == null ? "" : query.trim();
        if (q.isEmpty()) {
            return List.of();
        }
        if (q.length() > 40) {
            q = q.substring(0, 40);
        }
        if (!clientId.isBlank() && !clientSecret.isBlank()) {
            try {
                final String keyword = q;
                NaverResponse res = client.get()
                        .uri(u -> u.path("/v1/search/local.json").queryParam("display", 5).queryParam("query", keyword).build())
                        .header("X-Naver-Client-Id", clientId)
                        .header("X-Naver-Client-Secret", clientSecret)
                        .retrieve().body(NaverResponse.class);
                if (res != null && res.items() != null) {
                    return res.items().stream().map(x -> new PlaceSearchResult(strip(x.title()), x.category(), x.address(),
                            x.roadAddress(), x.mapx(), x.mapy(), x.link(), false)).toList();
                }
            } catch (RestClientException e) {
                log.warn("네이버 지역 검색 실패, 시연용 결과를 씁니다: {}", e.getMessage());
            }
        }
        return demo(q);
    }

    static List<PlaceSearchResult> demo(String q) {
        return List.of(
                new PlaceSearchResult(q, "카페,디저트", "인천 부평구 부평동", "인천 부평구 부평대로 88", null, null, null, true),
                new PlaceSearchResult(q + " 2호점", "카페,디저트", "인천 남동구 구월동", "인천 남동구 인하로 21", null, null, null, true));
    }

    private static String strip(String s) {
        return s == null ? null : s.replaceAll("<[^>]+>", "");
    }
}

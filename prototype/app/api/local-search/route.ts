// 가게 등록 (기획서 A2): 가게 이름 → 네이버 검색 API(지역)로 상호·업종·주소 확인. 크롤링은 하지 않아요.
// NAVER_SEARCH_ID / NAVER_SEARCH_SECRET 가 없으면 시연용 결과를 돌려줘요.

type Place = { name: string; category: string; address: string; demo?: boolean };

const strip = (s: string) => s.replace(/<[^>]+>/g, '');

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 40) ?? '';
  if (!q) return Response.json({ items: [] });
  const id = process.env.NAVER_SEARCH_ID, secret = process.env.NAVER_SEARCH_SECRET;
  if (id && secret) {
    try {
      const r = await fetch(`https://openapi.naver.com/v1/search/local.json?display=5&query=${encodeURIComponent(q)}`, {
        headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': secret },
        cache: 'no-store',
      });
      if (r.ok) {
        const j = (await r.json()) as { items: { title: string; category: string; roadAddress: string; address: string }[] };
        return Response.json({ items: j.items.map((x): Place => ({ name: strip(x.title), category: x.category, address: x.roadAddress || x.address })) });
      }
    } catch { /* fall through to demo results */ }
  }
  const items: Place[] = [
    { name: q, category: '카페,디저트', address: '인천 부평구 부평대로 88', demo: true },
    { name: `${q} 2호점`, category: '카페,디저트', address: '인천 남동구 인하로 21', demo: true },
  ];
  return Response.json({ items, demo: true });
}

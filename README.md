# MACO

**매일 10분씩 공부하는 마케팅 트레이닝 앱** — 2026 종합설계 졸업작품 (성결대 미디어소프트웨어학과)

| 담당 | 탭 |
|---|---|
| 강민국 (팀장) | 🏪 내 가게, AI 모듈, 통합 |
| 주승준 | 📚 트레이닝, 공통 UI |
| 박민하 | 🏆 랭킹, 👤 내 정보, 공통 기반 |
| 이동성 | 📝 시험, 문제 은행 |

## 실행

```bash
docker compose up -d
```

```bash
cd backend
./gradlew bootRun
```

```bash
cd frontend
npm install
npm run dev
```

- 화면: http://localhost:3000
- 서버 API 문서: http://localhost:8080/swagger-ui

## 문서

- 기획: `docs/MACO_서비스기획서.md`
- 개발 규칙: `docs/01_공통설계.md`, DB: `docs/02_데이터설계.md`, API: `docs/03_API설계_초안.md`
- AI 코딩 규칙: `AGENTS.md` (Claude Code·Codex 공통), 사용법: `docs/04_AI코딩_하네스.md`

## PR 전에

```bash
node scripts/check-rules.mjs
```

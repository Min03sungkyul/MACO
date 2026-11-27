# MACO

**매일 10분씩 공부하는 마케팅 트레이닝 앱** — 2026 종합설계 졸업작품 (성결대 미디어소프트웨어학과)

| 담당 | 탭 |
|---|---|
| 강민국 (팀장) | 🏪 내 가게, AI 모듈, 통합 |
| 주승준 | 📚 트레이닝, 공통 UI |
| 박민하 | 🏆 랭킹, 👤 내 정보, 공통 기반 |
| 이동성 | 📝 시험, 문제 은행 |

## 실행

처음 한 번: 루트에서 `.env.example`을 `.env`로 복사하고 `DB_PASSWORD`에 `docker-compose.yml`의 로컬 비밀번호를 넣는다. 나머지 키 값은 팀 비공개 채팅으로 받는다 (비어 있어도 로컬에서는 돈다). `.env` 파일이 아예 없어도 로컬 기본값으로 돈다.

1. DB 켜기 (Docker Desktop 먼저 실행)

```bash
docker compose up -d
```

2. 서버 켜기 (`local` 프로필: 마이그레이션, `content/` CSV 적재, 예시 계정 2개 생성)

```bash
cd backend
./gradlew bootRun
```

3. 화면 켜기

```bash
cd frontend
npm install
npm run dev
```

- 화면: http://localhost:3000 · 서버 API 문서: http://localhost:8080/swagger-ui
- 예시 계정 (로컬 전용): `learner@maco.app`(입문자), `owner@maco.app`(사장님), 비밀번호 `maco1234`. 로그인 화면 아래 버튼으로도 들어갈 수 있다.
- AI 키가 없으면 `AI_MODE=recorded`(기본). 저장된 응답과 규칙 채점으로 모든 화면이 돈다.

### 서버 없이 화면만 (목업 모드)

```bash
cd frontend
npm run dev:mock
```

프로토타입 데이터로 응답한다 (`frontend/src/lib/api/mock`). 화면 작업만 할 때 쓴다.

### 내 할 일 찾기

뼈대 곳곳에 담당자 이름으로 TODO를 달아 두었다. 각자 자기 이름으로 찾는다.

```bash
grep -rn "TODO(박민하" backend/src frontend/src content
```

## 문서

- 기획: `docs/MACO_서비스기획서.md`
- 개발 규칙: `docs/01_공통설계.md`, DB: `docs/02_데이터설계.md`, API: `docs/03_API설계_초안.md`
- AI 코딩 규칙: `AGENTS.md` (Claude Code·Codex 공통), 사용법: `docs/04_AI코딩_하네스.md`
- 협업 방법: `docs/06_협업_가이드.md`, 프로토타입 기반 파트별 할 일: `docs/07_프로토타입_기반_개발계획.md`

## PR 전에

```bash
node scripts/check-rules.mjs
```

## 팀원소개
- 강민국 : 팀장
- 이동성 : 마케팅교육
- 박민하 : 얼굴담당
- 주승준 : 못생기셨어요 진짜...

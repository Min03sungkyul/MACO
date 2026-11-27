# 이전 지도: prototype → frontend · backend

이 폴더의 파일을 팀 구조(`docs/01_공통설계.md` 1장)로 옮길 때 보는 표예요.
**그대로 복사하지 말고, 아래 "옮길 때 바꿀 것"을 지켜 다시 쓰는 것**이 원칙이에요. 화면 흐름·문구·숫자는 그대로 가져가도 돼요.

## 0. 공통으로 바꿀 것

| 프로토타입 | 팀 규칙 (frontend) |
|---|---|
| 폴더가 루트에 바로 있음 (`app/`, `components/`, `lib/`) | `frontend/src/` 아래 (`src/app`, `src/components`, `src/lib`, `src/styles`) |
| 라우트 그룹 `(tabs)` `(flow)` `(onboarding)`, 주소 `/train` `/test` `/shop` `/rank` | 탭 폴더 `training` `exam` `store` `ranking` `me`, 시작 화면은 `(start)` |
| 스타일: `app/globals.css` 한 파일 (클래스 이름 `t-…`, `ob-…`) | Tailwind + `src/styles` 토큰. 색 코드를 화면에 직접 쓰지 않기 |
| 글꼴: Noto Sans KR, Outfit | Pretendard |
| 데이터: `lib/store.tsx` → 브라우저 `localStorage` | `src/lib/api/client.ts`의 `api()` + TanStack Query (키 `['<탭>', '<대상>']`) |
| 날짜: 화면에서 직접 계산 (`dayOffset`으로 시연 날짜 이동) | 서버가 주는 `today`만 사용 (서버 `AppClock`) |
| 채점·Elo·XP: 화면 코드(`lib/train/engine.ts`)에서 계산 | 서버 `SkillService`, `XpService`. 화면은 결과만 받음 |
| AI: `lib/ai/adapter.ts` (시연용 규칙·대본) | 서버 `com.maco.ai`의 `AiClient`만. 화면은 AI를 부르지 않고 `FALLBACK`일 때 기본 체크리스트 |
| 로그인: Auth.js (카카오·네이버·시연용 계정) | 서버 JWT (`/auth/...`), 토큰은 `api()`가 붙임 |
| 로딩·빈 상태가 일부 없음 | 데이터 화면마다 `Spinner`, `EmptyState`, 에러 상태 |

## 1. 화면 (frontend)

| 프로토타입 파일 | 옮길 곳 `frontend/src/…` | 화면 | 담당 |
|---|---|---|---|
| `app/page.tsx` (스플래시) | `app/page.tsx` | — | 주승준 |
| `app/layout.tsx`, `app/(tabs)/layout.tsx`, `app/*/template.tsx` | `app/layout.tsx` (하단 탭 · 상단 XP 바 · 화면 전환) | — | 주승준 |
| `app/manifest.ts`, `app/icon.svg`, `app/apple-icon.png`, `public/icon-*.png` | `app/` · `public/` (홈 화면 앱 설치) | — | 주승준 |
| `app/(onboarding)/start` | `app/(start)/login` | S1 | 주승준 |
| `app/(onboarding)/mode` | `app/(start)/mode` | S2 | 주승준 |
| `app/(onboarding)/store` | `app/(start)/store-setup` | S3 | 주승준 (검색 API는 강민국) |
| `app/(onboarding)/placement` | `app/(start)/placement` | S4 | 주승준 |
| `app/(onboarding)/goal` | `app/(start)/goal` | S5 | 주승준 |
| `app/(tabs)/train` | `app/training` | S6 | 주승준 |
| `app/(flow)/train/lesson/[node]` | `app/training/lesson/[lessonId]` | S7~S10 | 주승준 |
| `app/(flow)/train/review` (바쁜 날 2분 복습) | `app/training/review` | S6 | 주승준 |
| `app/(flow)/streak` | `app/training/streak` | — | 주승준 |
| `app/(tabs)/test` | `app/exam` | S11 | 이동성 |
| `app/(flow)/test/quiz` | `app/exam/quiz` | S12 | 이동성 |
| `app/(flow)/test/notes` | `app/exam/notes` | S13 | 이동성 |
| `app/(flow)/test/roleplay` | `app/exam/roleplay` | S14 | 이동성 |
| `app/(tabs)/shop` | `app/store` | S15 | 강민국 |
| `app/(flow)/shop/diagnose` | `app/store/diagnose` | S16~S17 | 강민국 |
| `app/(flow)/shop/spot` | `app/store/spot` | S18 | 강민국 |
| `app/(flow)/shop/mission/[id]` | `app/store/mission/[id]` | S19 | 강민국 |
| `app/(flow)/shop/qr` | `app/store/qr` | S20 | 강민국 |
| `app/(flow)/shop/ads` | `app/store/ads` | S21 | 강민국 |
| `app/(tabs)/rank` | `app/ranking` | S22~S24 | 박민하 |
| `app/(tabs)/me` (시연 도구 포함) | `app/me` | S25~S26 | 박민하 |

## 2. 부품 (frontend)

| 프로토타입 파일 | 옮길 곳 `frontend/src/…` | 담당 |
|---|---|---|
| `components/ui.tsx` (로고, 뒤로 버튼, 선택지, 칩, 하단 탭, 토스트) | `components/ui/` 파일별로 나누기 | 주승준 |
| `components/SideNav.tsx` (컴퓨터 화면 왼쪽 메뉴) | `components/ui/SideNav.tsx` | 주승준 |
| `components/train/common.tsx` (목표 링, 상단 바) | `components/ui/GoalRing.tsx`, `components/ui/TopBar.tsx` | 주승준 |
| `components/train/icons.tsx` | `components/ui/icons.tsx` | 주승준 |
| `components/train/ItemPlayer.tsx` (문제 4유형 + 피드백 + "왜 틀렸어요?") | `components/training/ItemPlayer.tsx` (레슨·쪽지시험·오답 노트가 같이 씀 → 공통화 후보) | 주승준 |
| `components/train/PhotoMock.tsx` (사진 문제 그림) | `components/training/PhotoMock.tsx` | 주승준 |
| `components/train/shop.tsx` (관문 막대, 미션 목록) | `components/store/` | 강민국 |
| `app/globals.css` 위쪽 `:root` 변수 | `styles/` 토큰 (색·간격·둥글기) | 주승준 |
| `app/globals.css` 맨 아래 "휴대폰 · 컴퓨터 공통" 블록 | `app/layout.tsx` + Tailwind 반응형 (기준 375~430px, 큰 화면 가운데 480px) | 주승준 |

## 3. 로직과 데이터 (대부분 backend로)

| 프로토타입 파일 | 옮길 곳 | 담당 |
|---|---|---|
| `lib/train/engine.ts` — Elo 갱신, 다음 문제 고르기(`pickNext`), 복습 일정 | backend `skill` 패키지 `SkillService.pick / record` | 박민하 |
| `lib/train/engine.ts` — XP·하루 상한·스트릭·일일 목표 | backend `xp` 패키지 `XpService.award` | 박민하 |
| `lib/train/engine.test.ts` | backend `skill`·`xp` 테스트의 기대값 참고 | 박민하 |
| `lib/train/bank.ts` — 문제 40개, 개념 카드, 오류 유형 사전 | `content/` CSV (60개로 채우기) | 이동성 |
| `lib/train/types.ts` | `frontend/src/lib/types/training.ts`·`exam.ts` + backend DTO | 각 탭 |
| `lib/train/gates.ts` — 찾게·믿게·알리게 점수, 광고 잠금 | backend `store` 패키지 | 강민국 |
| `lib/train/league.ts` — 주간 리그·지역 랭킹 (지금은 가짜 사용자) | backend `ranking` 패키지 | 박민하 |
| `lib/train/progress.ts` — 모드·가게·관문 기록·미션·시험 기록 | backend `user`·`store`·`exam` 테이블 | 각 탭 |
| `lib/train/demo.ts` — 예시 계정 2개, 4주 넘기기 | backend `demo` 패키지 | 박민하 |
| `lib/ai/adapter.ts` — 답글 채점 루브릭, 상황극 대본, 캡처 읽기, 사진 밝기·선명도 | backend `ai` 패키지의 `AiTask`와 저장 응답(FALLBACK) | 강민국 (상황극 루브릭은 이동성) |
| `lib/store.tsx` | 없앰. `api()` + TanStack Query로 바꿈 | — |
| `auth.ts`, `app/api/auth`, `app/api/logins` | 없앰. backend `auth` (JWT) | 박민하 |
| `app/api/local-search` (네이버 지역 검색) | backend `GET /stores/search` | 강민국 |
| `docs/api-contract.md` | 루트 `docs/03_API설계_초안.md`와 맞춰 보고 빠진 것만 옮기기 | 박민하 |

## 4. 옮기는 순서 (추천)

1. **주승준**: `frontend/` 뼈대 → 디자인 토큰·공통 UI → 시작 화면(S1~S5) → 트레이닝(S6~S10)
2. **박민하**: `skill`·`xp` 서비스를 `engine.ts` 숫자 그대로 → `/me/status`, `/attempts`
3. **이동성**: `bank.ts`를 `content/` CSV로 → 시험 화면
4. **강민국**: `gates.ts`·`adapter.ts` → 내 가게 화면과 `AiClient`
5. 서버 API가 생기기 전에는 각 `src/lib/api/<탭>.ts`에 프로토타입 데이터를 돌려주는 가짜 구현(스텁)을 먼저 둬요.

숫자(XP, Elo, 관문 기준)는 모두 가정값이에요. 옮길 때 상수 한곳에 모으고 `// 가정값` 주석을 달아 주세요.

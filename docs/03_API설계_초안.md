# 03. API 설계 초안

> 규칙은 [01_공통설계.md](01_공통설계.md) 4장. 주소 앞에는 모두 `/api/v1`이 붙는다.
> 🔒 = 로그인 필요. ✨ = 응답에 `xp`(XpResult)가 들어감. 🤖 = AI 모듈(AiClient) 사용.
> 확정 명세는 서버의 `/swagger-ui`가 기준이다. 이 문서는 첫 주에 나눠 만들기 위한 목록이다.

## 공통·시작 (박민하, 배치 테스트는 주승준)

| 메서드 | 주소 | 하는 일 | 화면 |
|---|---|---|---|
| POST | `/auth/signup` | 이메일 가입 | S1 |
| POST | `/auth/login` | 이메일 로그인 → `accessToken` | S1 |
| GET | `/auth/oauth/{kakao\|naver}/callback` | 소셜 로그인 (P1) | S1 |
| GET 🔒 | `/me` | 내 정보, 모드, 목표, 지역, `today`(가상 날짜) | 전체 |
| PATCH 🔒 | `/me/settings` | 모드, 업종, 일일 목표, 습관 고리, 지역, 공개 범위, 리그 끄기 | S2, S5, S26 |
| GET 🔒 | `/me/status` | 상단 바용: 오늘 XP, 목표, 스트릭 | 상단 바 |
| GET | `/regions?sido=` | 지역 목록 | S5 |
| GET 🔒 | `/placement` | 배치 테스트 10문제 | S4 |
| POST 🔒 | `/placement/submit` | 답 제출 → 스킬별 시작 실력 | S4 |
| POST 🔒✨ | `/attempts` | **문제 하나 풀이 기록·채점** (SkillService.record). 레슨·쪽지시험·오답 노트가 모두 사용 | S8, S12, S13 |
| POST 🔒🤖 | `/items/{itemId}/explain` | "왜 틀렸어요?" 오답 설명 (누를 때만) | S9 |

## 📚 트레이닝 (주승준)

| 메서드 | 주소 | 하는 일 | 화면 |
|---|---|---|---|
| GET 🔒 | `/training/path` | 유닛 경로: 스킬·레슨·잠금·완료 상태 | S6 |
| GET 🔒 | `/training/today` | 오늘의 추천 레슨 (약점·복습 반영) | S6 |
| POST 🔒 | `/lessons/{lessonId}/sessions` | 레슨 시작 → `sessionId`, 개념 카드, 문제 7개 | S7, S8 |
| POST 🔒🤖 | `/rewrite/grade` | 고쳐 쓰기 채점 → 항목별 점수, 고칠 점 1개 (이후 `/attempts`로 기록) | S8 |
| POST 🔒✨ | `/lessons/sessions/{sessionId}/finish` | 레슨 완료 → XP, 레벨 변화, 약점 리포트 | S10 |

## 📝 시험 (이동성)

| 메서드 | 주소 | 하는 일 | 화면 |
|---|---|---|---|
| GET 🔒 | `/exam/home` | 오늘의 쪽지시험 상태, 오답 노트 개수, 오늘의 상황극 | S11 |
| POST 🔒 | `/quizzes/daily` | 오늘의 쪽지시험 만들기 (오늘 배운 것 + 복습, 5문제) | S12 |
| POST 🔒✨ | `/quizzes/{quizId}/submit` | 제출 → 100점 만점 점수, 문제별 정답, XP | S12 |
| GET 🔒 | `/wrong-notes` | 오답 노트 목록 (복습 날짜순) | S13 |
| GET 🔒 | `/roleplay/scenarios` | 상황극 목록 | S11 |
| POST 🔒🤖 | `/roleplay/sessions` | 상황극 시작 → 손님 첫 말 ("연습용 가상 상황" 표시) | S14 |
| POST 🔒🤖 | `/roleplay/sessions/{id}/turns` | 사장님 답 → 손님 다음 말 (3턴까지) | S14 |
| POST 🔒🤖✨ | `/roleplay/sessions/{id}/finish` | 루브릭 점수, 잘한 점, 고칠 문장 3개, XP | S14 |
| POST 🔒✨ | `/quizzes/unit/{skill}` · `/submit` | 유닛 시험 (P1) | — |

## 🏪 내 가게 / 연습 가게 (강민국)

| 메서드 | 주소 | 하는 일 | 화면 |
|---|---|---|---|
| GET 🔒 | `/stores/search?query=` | 네이버 검색 API(지역)로 가게 찾기 | S3 |
| POST 🔒 | `/stores` | 내 가게 등록 (계정당 1개) | S3 |
| GET 🔒 | `/practice-stores` | 연습 가게 목록 (MVP: 카페 1개) | S3 |
| GET 🔒 | `/store/home` | 관문 점수, 해금된 미션, 퀘스트 (학습 모드는 연습 가게 기준) | S15 |
| POST 🔒🤖 | `/captures` | 캡처 업로드(multipart, `platform`) → AI가 읽은 항목 | S16 |
| PUT 🔒 | `/captures/{id}/confirm` | 사장님이 확인·수정한 값 → 관문 진단 생성 | S16 |
| GET 🔒 | `/gate-checks/latest` | 찾게·믿게·알리게 점수, 진단 카드, 광고 잠금 | S17, S21 |
| POST 🔒 | `/spot-games` | 틀린 곳 찾기 시작 (내 캡처 또는 연습 가게 화면) → 이미지, 찾을 개수 | S18 |
| POST 🔒✨ | `/spot-games/{id}/taps` | 탭한 좌표 → 맞음/아님, 이유 카드, XP | S18 |
| GET 🔒 | `/missions` | 미션 목록·해금 상태 | S15 |
| POST 🔒🤖✨ | `/missions/{id}/submissions` | 제출(multipart) → 항목별 채점, 고칠 점, 통과 시 XP | S19 |
| POST 🔒 | `/review-cards` | 리뷰 요청 QR 카드 만들기 | S20 |
| GET 🔒 | `/review-cards/{id}` | 카드 미리보기·출력용 데이터 | S20 |
| POST 🔒 | `/review-requests` | 오늘 요청한 수 기록 | S20 |
| GET 🔒 | `/ad-gate` | 광고 관문 잠금 상태, 2주 실험 카드 (P1) | S21 |

## 🏆 랭킹 (박민하)

| 메서드 | 주소 | 하는 일 | 화면 |
|---|---|---|---|
| GET 🔒 | `/league/current` | 내 등급, 그룹 30명 순위, 승급·강등선, 남은 시간 | S22 |
| GET 🔒 | `/rankings/region` | 내 지역 순위 ("부평구 23위 / 412명"), 상위 10명, 바로 위·아래 | S23 |
| GET 🔒 | `/friends` · POST `/friends` | 친구 랭킹, 초대 코드로 추가 (P1) | S24 |

## 👤 내 정보 (박민하)

| 메서드 | 주소 | 하는 일 | 화면 |
|---|---|---|---|
| GET 🔒 | `/me/stats` | 학습 기록: 트레이닝 시간, 푼 문제, XP (일·주) | S25 |
| GET 🔒 | `/me/report?weeks=4` | 성장 리포트: 주차별 실력 점수 + 관문 점수 | S25 |
| GET 🔒 | `/me/skills` | 스킬 맵 (스킬별 레벨·θ) | S25 |
| GET 🔒 | `/me/badges` | 배지 (P1) | S25 |

## 🎬 시연 도구 (박민하, AI 저장 응답은 강민국)

| 메서드 | 주소 | 하는 일 |
|---|---|---|
| POST 🔒 | `/demo/skip-days` | `{ "days": 7 }` 가상 날짜 넘기기 (시연 계정만). 넘긴 기간의 예시 기록을 함께 채움 |
| POST 🔒 | `/demo/reset` | 시연 계정을 처음 상태로 |

## 첫 주에 먼저 만들 스텁 (다른 사람이 막히지 않게)

| 스텁 | 담당 | 내용 |
|---|---|---|
| `POST /auth/login`, `GET /me` | 박민하 | 예시 계정 2개로 로그인 |
| `POST /attempts` | 박민하 | 정답 비교만 하고 고정 XpResult 반환 |
| `AiClient` (`recorded`) | 강민국 | 모든 AiTask에 저장된 예시 응답 반환 |
| `GET /training/path`, `POST /lessons/{id}/sessions` | 주승준 | CSV 문제 7개 고정 반환 |
| `POST /quizzes/daily` | 이동성 | 문제 5개 고정 반환 |

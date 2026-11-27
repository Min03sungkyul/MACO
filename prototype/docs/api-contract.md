# MACO API 약속 (서버 연결용)

화면(Next.js)은 지금 브라우저 저장소(localStorage)로 동작해요. Spring Boot 서버가 생기면, 아래 약속대로 같은 모양의 데이터를 주고받도록 바꿔요. 이름은 기획서 10장 테이블과 맞췄어요.

- 화면 쪽 기준 코드: `lib/train/engine.ts`(훈련 엔진), `lib/train/progress.ts`(사용자 기록), `lib/ai/adapter.ts`(AI 어댑터)
- 인증: 카카오·네이버 로그인 → 서버가 JWT 발급 → `Authorization: Bearer <JWT>`
- 날짜는 모두 `YYYY-MM-DD`(사용자 기기 기준 날짜), 시간은 ISO 8601

## 1. 테이블

| 테이블 | 화면 쪽 대응 | 컬럼 |
|---|---|---|
| `item` | `lib/train/bank.ts` `ITEMS` | id, skill, level(1·3·5), type(pick2·judge·spot·rewrite), content(JSON), answer(JSON), why, error_type, difficulty |
| `user_skill` | `TrainState.theta` | user_id, skill, theta(실력 점수), level(1–5) |
| `item_stat` | `TrainState.dAdj` | item_id, difficulty(Elo로 갱신, 전체 사용자 공유) |
| `attempt` | `TrainState.attempts` | id, user_id, item_id, ok, ms, ctx(lesson·quiz·review·placement·notes·unit), xp, day, created_at |
| `review_schedule` | `TrainState.review` | user_id, item_id, due(다음 복습일), step(0·1·2) |
| `error_stat` | `TrainState.errs` | user_id, error_type, streak(연속 오답), total |
| `node_progress` | `TrainState.nodes` | user_id, node_id(예: photo-1, photo-test), best_accuracy |
| `xp_log` | `xp_log` | id, user_id, kind, xp, day, created_at |
| `daily_goal` | `TrainState.days`, `goal` | user_id, day, goal_xp, xp, seconds, solved, busy_kept |
| `streak` | 계산값 | user_id, current, best, last_day |
| `gate_check` | `Progress.gateChecks` | id, user_id, day, readings(JSON), find_score, trust_score, notify_score |
| `mission` | `Progress.missions` | user_id, mission_id, day, score, submission_url |
| `quiz_attempt` | `Progress.quizzes` | user_id, day, score |
| `roleplay` | `Progress.roleplays` | user_id, day, score, transcript(JSON) |
| `league_group` | `lib/train/league.ts` | week_start, tier, group_id, user_id, week_xp |
| `region` | `Progress.region` | user_id, region_code(구 단위) |
| `ai_log`, `ai_cache` | `lib/ai/adapter.ts` | 사용량 기록, 같은 입력 결과 재사용 |

## 2. 엔드포인트

### 시작
| 메서드 | 경로 | 하는 일 |
|---|---|---|
| POST | `/api/auth/{kakao,naver}` | 소셜 로그인 → JWT |
| GET | `/api/me` | 프로필 + 모드 + 가게 + 목표 + 지역 |
| PUT | `/api/me` | 모드 전환, 목표·습관 고리·지역·공개 범위·리그 끄기 |
| GET | `/api/places/search?q=` | 네이버 검색 API(지역) 대리 호출 (지금은 `app/api/local-search`) |
| POST | `/api/placement` | 배치 테스트 10문제 결과 → `user_skill` 초기값 |

### 트레이닝·시험 (판단은 서버 엔진, AI 없음)
| 메서드 | 경로 | 하는 일 |
|---|---|---|
| GET | `/api/lessons/{nodeId}/next?used=` | 맞힐 확률 70% 근처 + 복습 예정 + 약점 유형 우선으로 다음 문제 (`pickNext`) |
| POST | `/api/attempts` | 채점 결과 저장 → Elo 갱신, 복습 예약, 오류 유형 집계, XP 적립. 응답: `{ xp, theta, weakNote }` |
| POST | `/api/lessons/{nodeId}/finish` | 레슨 완료 +10 XP, 유닛 시험 80점 이상 +30 XP |
| GET | `/api/quiz/today` | 쪽지시험 5문제 (`quizItems`) |
| POST | `/api/quiz` | 점수 저장, 정답당 4 XP, 만점 +10 |
| GET | `/api/notes` | 오답 노트 (`review_schedule`) |
| POST | `/api/busy-review` | 바쁜 날 2분 복습 → 오늘 스트릭 유지 |
| GET | `/api/summary?day=` | 오늘 XP, 목표, 스트릭, 트레이닝 시간 |

### AI 어댑터 (필요할 때만 호출, 실패하면 규칙 문장으로 대체)
| 메서드 | 경로 | 하는 일 |
|---|---|---|
| POST | `/api/ai/grade` | 고쳐 쓰기·미션 답글 채점 `{ rubric, text }` → `{ score, checks, good, fix }` |
| POST | `/api/ai/explain` | "왜 틀렸어요?" `{ itemId, errorType }` → 설명 문장 |
| POST | `/api/ai/roleplay` | 상황극 한 턴 `{ scenarioId, turns }` → 손님 답 / 마지막 턴이면 루브릭 리포트 |
| POST | `/api/ai/capture` | 캡처 이미지 → 읽은 항목 `Readings` (사장님 확인 후 저장) |

### 내 가게
| 메서드 | 경로 | 하는 일 |
|---|---|---|
| POST | `/api/gate-checks` | 확인한 `Readings` → 3관문 점수 저장 (`gateScores`) |
| POST | `/api/spot-finds` | 내 화면 틀린 곳 찾기 1개 → +5 XP |
| POST | `/api/missions/{id}` | 미션 제출·첨삭 통과 → +50 XP |
| POST | `/api/qr/requests` | 리뷰 요청 수 +1 |
| PUT | `/api/ad-plan` | 2주 실험 카드 (매체·예산·중지 기준) |

### 랭킹
| 메서드 | 경로 | 하는 일 |
|---|---|---|
| GET | `/api/league` | 이번 주 그룹 30명, 등급, 승급(상위 7)·강등(하위 5)선, 남은 시간 |
| GET | `/api/region-rank` | 내 구 순위, 전체 수, 상위 %, 상위 10명, 내 앞뒤 |

## 3. 규칙 숫자 (모두 가정값, 사용자 평가 뒤 조정)

- Elo: `p = 1 / (1 + e^-(θ - d))`, `θ ← θ + 0.4(r - p)`, `d ← d - 0.15(r - p)`, 레벨별 시작 난이도 Lv1 −1 · Lv3 0 · Lv5 +1
- 스킬 레벨: θ < −0.5 Lv1 · < 0 Lv2 · < 0.5 Lv3 · < 1 Lv4 · 그 이상 Lv5
- XP: 정답 10 · 오답 2 · 레슨 완료 10 · 쪽지시험 정답 4 + 만점 10 · 상황극 0–20 · 틀린 곳 찾기 5 · 유닛 시험 통과 30 · 미션 50 · 7일 연속 20
- 같은 날 같은 문제 반복은 XP 절반, 하루 상한 300
- 일일 목표 30 / 60 / 120 XP, 스트릭은 목표를 채운 연속 일수(바쁜 날 2분 복습 포함)
- 복습: 틀리면 다음 날 → 맞히면 3일 → 7일 → 끝
- 관문 통과 70점, 광고는 찾게·믿게 통과 후

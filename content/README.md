# content — 문제 은행·개념 카드·오류 유형 사전 (담당: 이동성)

규칙은 [AGENTS.md](AGENTS.md), 형식은 `docs/01_공통설계.md` 5-6장과 `docs/02_데이터설계.md` 2장.
서버를 `local` 프로필로 켜면 backend `com.maco.content`의 CSV 적재기가 이 폴더를 DB에 넣는다 (열 이름 = DB 컬럼 이름, DB에 없는 열은 무시).

## 지금 들어 있는 것 (프로토타입에서 변환, 2026-11-27)

주승준 프로토타입의 `prototype/lib/train/bank.ts`, `lib/ai/adapter.ts`를 그대로 옮겼다.

| 파일 | 개수 | 비고 |
|---|---|---|
| `skills.csv` | 6 | `ready=true`는 PHOTO, REVIEW만 |
| `concept_cards.csv` | 6 | 스킬 2개 × 레벨 1·3·5 |
| `lessons.csv` | 6 | 경로 노드 = 개념 카드 1장 + 문제 7개 |
| `error_types.csv` | 18 | `legacy_code` = 프로토타입 코드 (DB에는 안 들어감) |
| `items.csv` | 40 | 사진 20, 리뷰 답글 20. `legacy_id` = 프로토타입 id |
| `hotspots.csv` | 33 | 틀린 곳 찾기(SPOT) 문제의 조각. 프로토타입은 좌표 대신 격자·목록이라 `x,y,w,h`가 비어 있음 |
| `rubrics.csv` | 9 | 칭찬 답글 4항목, 불만 답글 5항목. 규칙 채점 패턴은 backend `ai` 패키지 FALLBACK에 있음 |
| `roleplay_scenarios.csv` | 1 | 미지근한 라떼 불만 손님 |
| `practice_stores.csv` | 1 | 연습 카페. `gate_preset_json`은 캡처에서 읽은 값 형식 |

### 칸 읽는 법

- 사진 보기·조각: `photo:s=latte;light=dark` → 화면의 `PhotoMock`이 그림으로 그린다 (실제 사진으로 바꾸면 `content/images/` 경로).
- SPOT 문제: `media`에 `view:grid|reviews|reply`, `answer`에 문제 있는 조각 키를 `|`로 (`b|d|f`).
- REWRITE 문제: `context` = 손님 리뷰, `rubric_code` = 채점 기준, `sample_answer` = 예시 한 줄 (대신 써 주는 용도가 아니라 채점 뒤 보여 주는 예시).

## TODO(이동성)

- [ ] 오류 유형 코드 확정: 프로토타입 18개를 팀 코드로 바꿔 두었다 (`photo-light` → `PHOTO_LIGHT` 등). `docs/01` 5-6 초안과 비교해 이름·설명(`description`)·근거(`evidence`)를 채운다.
- [ ] 보기별 오류 유형 검수: 프로토타입은 문제마다 오류 유형이 하나라, 틀린 보기·조각 전부에 같은 값을 붙여 두었다 (예: `PHOTO-SPOT-001`의 어두운 사진 조각도 `PHOTO_BLUR`). 보기마다 맞는 값으로 고친다.
- [ ] `kind`(규칙형/선호형): 전부 `RULE`로 두었다. 선호형 문제는 `PREFERENCE`로 바꾸고 설문 근거를 단다.
- [ ] 문제 20개 추가 (40 → 60, 기획서 12-1). 코드는 이어지는 번호로 (`PHOTO-CHOICE2-008` …).
- [ ] 검수한 줄에 `reviewed_by` 이니셜을 적는다.

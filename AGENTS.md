# MACO — AI 코딩 공통 규칙

이 파일은 팀원 4명이 쓰는 AI 코딩 도구(Claude Code, Codex)가 **모두 읽는 하나의 규칙 파일**이다.
Claude Code는 `CLAUDE.md`가 이 파일을 불러온다. 규칙을 바꿀 때는 이 파일만 고친다 (하네스 담당: 강민국).

## 1. 프로젝트

- MACO = **매일 10분씩 공부하는 마케팅 트레이닝 앱**. 졸업작품. 발표 2026-12-16, **기능 동결 2026-12-11**.
- 지금 만드는 것은 **프로토타입**이다. 목표는 시연 9단계가 끝까지 진짜로 도는 것. 범위는 `docs/MACO_서비스기획서.md` 12-1장.
  범위 밖 기능은 만들지 말고 사용자에게 먼저 묻는다.
- 대화·주석·커밋·PR·문서는 한국어, 코드 식별자는 영어. 서비스 용어는 "트레이닝"으로 통일한다.
- 한국어는 그대로 쓴다. `\uXXXX` 유니코드 이스케이프로 쓰지 않는다.

## 2. 작업 전에 읽을 문서 (관련된 것만)

| 알고 싶은 것 | 파일 |
|---|---|
| 무엇을 만드나 (기능 ID, 화면 S1~S26, 시연) | `docs/MACO_서비스기획서.md` |
| 저장소 구조, 브랜치, API 규칙, 공통 모듈 약속 | `docs/01_공통설계.md` |
| DB 테이블 | `docs/02_데이터설계.md` |
| API 목록 | `docs/03_API설계_초안.md` |
| 이 하네스 사용법 | `docs/04_AI코딩_하네스.md` |
| Git·PR·병합·Docker 협업 방법 (초보자용) | `docs/06_협업_가이드.md` |
| 프로토타입(`prototype/`) 기반 파트별 할 일, 바꿀 점, 정할 숫자 | `docs/07_프로토타입_기반_개발계획.md` |
| 폴더별 세부 규칙 | `frontend/AGENTS.md`, `backend/AGENTS.md`, `content/AGENTS.md` |

## 3. 담당 영역

작업을 시작할 때 `git config user.name`과 사용자의 말로 **누구의 작업인지** 확인한다.
그 사람의 담당 영역 밖 파일은 고치지 않는다. 꼭 필요하면 먼저 사용자에게 알리고, PR 설명의 "다른 담당 영역 수정"에 적는다.

| 담당 | 영역 (frontend / backend `com.maco.*`) |
|---|---|
| 강민국 (팀장) | `app/store`, `components/store` / `store`, `ai` 패키지 / 저장소 설정·하네스(`AGENTS.md`, `.agents`, `.claude`, `.codex`, `.github`, `scripts`) |
| 주승준 | `app/training`, `app/(start)`, `app/layout.tsx`, `components/ui`, `components/training`, `styles` / `training` 패키지 |
| 박민하 | `app/ranking`, `app/me`, `lib/api/client.ts` / `common`, `auth`, `user`, `xp`, `skill`, `ranking`, `report`, `demo` 패키지, `db/migration` 구조, `docker-compose*.yml` |
| 이동성 | `app/exam`, `components/exam` / `exam`, `content` 패키지 / `content/` 폴더 전체 |

`lib/api/<탭>.ts`, `lib/types/<탭>.ts`는 그 탭 담당이 관리한다.

## 4. 반드시 지킬 규칙

`node scripts/check-rules.mjs`가 표시(✔)된 규칙을 자동으로 검사한다. CI에서도 돈다.

1. ✔ **날짜·시각**: backend에서 `LocalDate.now()`, `LocalDateTime.now()`, `Instant.now()` 등을 쓰지 않는다. `com.maco.common.time.AppClock`의 `today(userId)`, `now(userId)`만 쓴다 (시연 "4주 넘기기"). 프론트는 서버가 준 `today`를 쓴다.
2. ✔ **AI 호출**: AI 회사 API·SDK는 backend `com.maco.ai` 패키지 안에서만 쓴다. 다른 곳은 `AiClient.run(AiTask, input, type)`만 부른다. 프론트에서 AI를 직접 부르지 않는다. 결과가 `FALLBACK`이어도 화면이 동작해야 한다.
3. **XP**: `XpService.award(...)`만 쓴다. `xp_log`에 직접 쓰지 않는다.
4. **풀이 기록·Elo**: `SkillService.pick / record`만 쓴다.
5. ✔ **DB 변경**: 새 Flyway 파일(`V{번호}__{설명}.sql`)로만 한다. 이미 병합된 마이그레이션은 고치지 않는다. `ddl-auto=update`는 쓰지 않는다.
6. ✔ **비밀값**: `.env`는 읽지도 커밋하지도 않는다. 키를 코드·로그·테스트·프롬프트에 넣지 않는다. 새 환경 변수는 `.env.example`에 이름만 추가한다.
7. **패키지 경계**: 다른 패키지의 repository·엔티티를 직접 쓰지 않고 그 패키지의 service를 부른다.
8. **공통 UI**: `components/ui`와 디자인 토큰을 먼저 쓴다. 필요한 부품이 없으면 탭 폴더에 만들고 주승준에게 공통화를 요청한다. 색은 토큰으로만 쓴다(✔ 경고).
9. **API 형식**: `/api/v1`, 성공 `{ "data": ... }`, 실패 `{ "error": { "code", "message" } }`, camelCase. API를 바꾸면 `docs/03_API설계_초안.md`와 `frontend/src/lib/types`를 같이 고친다.
10. **하지 않는 것**: 크롤링, 리뷰 내용 분석, AI가 글·답글을 대신 써 주기, Redis·S3, 관리자 화면, 결제. 요청을 받으면 기획서 14장을 근거로 사용자에게 확인한다.

## 5. 작업 방식

1. **시작**: `main` 최신 받기 → 브랜치 `feat/<탭>-<내용>` → 관련 문서 읽기. 파일 3개 이상 바뀌는 작업은 **계획을 먼저 보여 주고 확인**받는다.
2. **작게**: PR 하나에 기능 하나. 변경은 400줄 이하를 권장한다.
3. **확인 후 완료**: 6장의 빌드·테스트·규칙 검사를 실제로 실행해 통과한 뒤에만 "완료"라고 말한다. 실행하지 못했으면 못 했다고 말한다.
4. **커밋**: `feat(exam): 쪽지시험 채점 API 추가` 형식. push와 PR 생성은 사용자가 요청할 때만 한다. `main` 직접 push, force push, `git reset --hard`는 하지 않는다.
5. **모르면 묻기**: 기획에 없는 동작은 추측하지 말고 묻는다. 기획서와 다르게 만들어야 하면 이유를 PR에 적는다.
6. **가정값 표시**: 기획서의 숫자(XP, Elo, 관문 기준)는 가정값이다. 코드에서는 상수 한곳에 모으고 `// 가정값` 주석을 단다.

## 6. 명령어

| 목적 | 명령어 | 위치 |
|---|---|---|
| 로컬 DB 켜기 | `docker compose up -d --wait` | 루트 |
| 서버 실행 / 테스트 | `./gradlew bootRun` / `./gradlew test` | `backend/` |
| 화면 실행 / 검사 / 빌드 | `npm run dev` / `npm run lint` / `npm run build` | `frontend/` |
| 규칙 검사 | `node scripts/check-rules.mjs` | 루트 |
| 스킬 복사 (.agents → .claude) | `node scripts/sync-skills.mjs` | 루트 |

Windows PowerShell에서 Gradle은 `.\gradlew.bat bootRun`.

## 7. 스킬 (작업 절차서)

원본은 `.agents/skills/` (Codex가 읽음), 복사본은 `.claude/skills/` (Claude Code가 읽음). 고칠 때는 원본만 고치고 `node scripts/sync-skills.mjs`를 실행한다.
스킬이 도구에 보이지 않으면 해당 `SKILL.md`를 직접 읽고 그대로 따른다.

| 스킬 | 언제 |
|---|---|
| `maco-start` | 새 작업을 시작할 때 |
| `maco-feature` | 탭 기능을 화면부터 서버까지 만들 때 |
| `maco-api` | API를 추가하거나 바꿀 때 |
| `maco-content` | 문제 은행·개념 카드·오류 유형 CSV를 쓰거나 검수할 때 |
| `maco-ai-task` | AI 기능(AiTask)을 추가할 때 |
| `maco-pr` | 커밋·PR을 준비할 때 |
| `maco-review` | 팀원 PR을 리뷰할 때 (리뷰어는 팀장 강민국) |

## 8. 완료 기준

- 빌드·테스트·`check-rules` 통과
- 화면: 모바일 375px에서 확인, 로딩·에러·빈 상태가 있음
- 서버: 새 service 메서드마다 성공·실패 테스트 최소 1개씩
- API가 바뀌었으면 `docs/03`과 `lib/types`를 고침
- PR 템플릿을 채움 (AI 사용 기록 포함)

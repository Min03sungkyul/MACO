---
name: maco-feature
description: MACO의 탭 기능 하나를 DB부터 서버 API, 화면까지 끝까지 만들 때 쓴다. 정해진 순서와 공통 모듈(AppClock, XpService, SkillService, AiClient, 공통 UI) 사용법을 따른다.
---

# 탭 기능 만들기 (화면 + 서버)

먼저 `maco-start`를 마쳤는지 확인한다. 아래 순서대로, 한 단계가 끝날 때마다 빌드가 되는 상태를 유지한다.

## 서버 (backend)

1. **테이블**: 필요하면 `db/migration/V{다음번호}__{설명}.sql` 새 파일. 이름은 `docs/02_데이터설계.md`를 따른다.
2. **domain**: 엔티티 (`backend/AGENTS.md`의 Lombok 규칙).
3. **repository**: Spring Data JPA 인터페이스.
4. **service**: 판단·계산을 여기에. 공통 모듈을 쓴다.
   - 오늘 날짜 → `appClock.today(userId)`
   - XP → `xpService.award(userId, XpReason.X, sourceKey)` 결과(`XpResult`)를 응답에 넣는다
   - 문제 출제·채점 → `skillService.pick(...)`, `skillService.record(...)`
   - AI → `aiClient.run(AiTask.X, input, Output.class)`, `source == FALLBACK`일 때 대체 문장 처리
5. **dto + controller**: `record` DTO, `/api/v1/...`, 응답 `{ "data": ... }`.
6. **테스트**: service 성공·실패 각 1개 이상 → `./gradlew test`.
7. 서버를 실행하고 `/swagger-ui`에서 직접 호출해 본다.

## 화면 (frontend)

1. `src/lib/types/<탭>.ts`에 응답 타입 추가 (서버 DTO와 같은 이름).
2. `src/lib/api/<탭>.ts`에 호출 함수 추가 (`api()` 사용).
3. 화면 `src/app/<탭>/...`: `components/ui`의 공통 부품을 먼저 쓴다. 없으면 `components/<탭>/`에 만든다.
4. 로딩·에러·빈 상태를 넣고, `xp`가 있으면 `XpToast`로 보여 준다.
5. `npm run lint`, `npm run build` → 375px 화면 확인.

## 마무리

- API를 새로 만들었거나 바꿨으면 `maco-api` 스킬을 따른다.
- `node scripts/check-rules.mjs` 통과 후 `maco-pr`로 넘어간다.

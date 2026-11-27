# frontend 규칙 (Next.js, TypeScript)

루트 `AGENTS.md`를 먼저 따르고, 이 파일은 frontend에만 해당하는 내용이다.

## 구조

- App Router. 탭 화면은 `src/app/<탭>/`, 탭 전용 부품은 `src/components/<탭>/`, 공통 부품은 `src/components/ui/`.
- 서버 호출은 `src/lib/api/client.ts`의 `api()`로만 한다 (토큰 첨부, `{data}`/`{error}` 처리). 탭별 호출 함수는 `src/lib/api/<탭>.ts`.
- 서버 응답 타입은 `src/lib/types/<탭>.ts`. 이름은 `docs/03_API설계_초안.md`, 서버 DTO와 맞춘다.
- 서버 데이터 캐시는 TanStack Query. 쿼리 키는 `['<탭>', '<대상>', ...]`.

## 화면 규칙

- 기준 폭은 모바일 375~430px, 큰 화면에서는 가운데 480px.
- 스타일은 Tailwind. 색·글꼴·간격은 `src/styles` 토큰만 쓴다 (`#ffffff` 같은 색 코드를 화면에 직접 쓰지 않는다).
- 모든 데이터 화면에는 로딩·에러·빈 상태가 있어야 한다 (`Spinner`, `EmptyState` 사용).
- XP가 들어 있는 응답(`xp` 필드)은 공통 `XpToast`로 보여 주고, 상단 바 쿼리를 무효화한다.
- 날짜는 직접 계산하지 않고 서버의 `today`를 쓴다 (시연 가상 날짜).
- AI를 직접 부르지 않는다. AI 결과가 `FALLBACK`이면 "기본 체크리스트" 화면으로 자연스럽게 보여 준다.
- 화면 문구는 한국어 존댓말. "공부·훈련" 대신 **"트레이닝"**이라고 쓴다.

## 확인

- `npm run lint`, `npm run build`가 통과해야 한다.
- 브라우저 개발자 도구에서 375px로 화면을 확인하고, PR에 캡처를 붙인다.

## 처음 만들 때 (주승준)

`create-next-app`이 "폴더가 비어 있지 않다"고 하면 이 파일과 `CLAUDE.md`를 잠시 밖으로 옮기고 생성한 뒤 다시 넣는다.

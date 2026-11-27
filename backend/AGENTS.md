# backend 규칙 (Spring Boot, Java 21)

루트 `AGENTS.md`를 먼저 따르고, 이 파일은 backend에만 해당하는 내용이다.

## 구조

- 패키지는 기능별: `com.maco.<기능>.{controller, service, repository, domain, dto}`. 기능 목록과 담당은 `docs/01_공통설계.md` 1-2장.
- 공통: 응답 래퍼·에러는 `com.maco.common.api`, 시간은 `com.maco.common.time.AppClock`, 보안은 `com.maco.common.security`.

## 코드 규칙

- 컨트롤러는 입력 검증(`@Valid`)과 응답 변환만 한다. 판단·계산은 service에서 한다.
- 트랜잭션(`@Transactional`)은 service에 둔다. 조회만 하면 `readOnly = true`.
- 요청·응답 DTO는 Java `record`로 만든다. **엔티티를 응답으로 그대로 내보내지 않는다.**
- 엔티티: Lombok은 `@Getter`, `@NoArgsConstructor(access = PROTECTED)`, `@Builder`까지만. `@Data`, `@Setter`는 쓰지 않는다. 연관관계는 기본 `LAZY`.
- 에러는 `BusinessException(ErrorCode.XXX)`로 던지고 공통 핸들러가 `{ "error": ... }`로 바꾼다. `ErrorCode`에 HTTP 상태와 한국어 메시지를 함께 둔다.
- 가정값(XP 배점, Elo K값, 관문 기준)은 각 기능의 `...Policy` 클래스 상수에 모으고 `// 가정값` 주석을 단다.
- 네이티브 쿼리는 랭킹 집계에만 쓴다.

## DB

- 변경은 `src/main/resources/db/migration/V{번호}__{설명}.sql` 새 파일로만. 번호는 `main`에 있는 마지막 번호 + 1.
- 테이블·컬럼 이름은 `docs/02_데이터설계.md`를 따른다. 문서에 없는 테이블을 만들면 문서도 고친다.

## 테스트

- service 단위 테스트: JUnit 5 + Mockito. 새 public 메서드마다 성공·실패 1개 이상.
- 날짜가 들어간 테스트는 `AppClock`을 고정값으로 바꿔 끼운다.
- AI가 들어간 테스트는 `AI_MODE=off` 또는 `AiClient` 목(mock)을 쓴다. **테스트에서 실제 AI API를 부르지 않는다.**
- 실행: `./gradlew test` (Windows는 `.\gradlew.bat test`).

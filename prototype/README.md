# MACO 시연 프로토타입 (참고용)

> **이 폴더는 참고용 사본이에요. 실제 개발은 `frontend/`와 `backend/`에서 해요.**
> 서비스 기획서(`docs/MACO_서비스기획서.md`)의 시연 9단계를 화면만으로 끝까지 돌려 볼 수 있게 만든 Next.js 앱이에요.
> 서버 없이 브라우저 저장소(`localStorage`)와 시연용 저장 응답으로 동작해요. 팀 규칙(폴더 구조, Tailwind, `api()` 호출, 서버에서만 AI)과는 다르게 만들어져 있으니, 코드를 그대로 옮기지 말고 화면 흐름·문구·계산 규칙을 참고해 주세요.

## 실행

```bash
cd prototype
npm install
npm run setup      # .env.local 만들기 (처음 한 번, 무작위 세션 키만 들어가요)
npm run dev        # http://localhost:3100
npm test           # 트레이닝 엔진·시뮬레이션 단위 테스트
```

- 로그인 키가 없어도 시작 화면의 **시연용 계정**(이름만 입력)이나 **예시 계정으로 둘러보기**로 쓸 수 있어요.
- 휴대폰: `npm run phone` → 같은 와이파이에서 `http://<컴퓨터 IP>:3100` (맥: `ipconfig getifaddr en0`). 홈 화면에 추가하면 전체 화면 앱으로 열려요.
- 화면 크기: 휴대폰(320~430px)은 하단 탭, 컴퓨터(960px 이상)는 왼쪽 메뉴 + 가운데 칸.

## 시연 흐름

| 단계 | 화면 | 주소 |
|---|---|---|
| 시작 | 스플래시 → 로그인 | `/` → `/start` |
| 온보딩 | 모드 선택 → 가게 검색 → 배치 테스트 10문제 → 하루 목표 → 캡처 진단 | `/mode` → `/store` → `/placement` → `/goal` → `/shop/diagnose?first=1` |
| 📚 트레이닝 | 유닛 경로, 레슨, 복습, 연속 기록 | `/train`, `/train/lesson/[node]`, `/train/review`, `/streak` |
| 📝 시험 | 쪽지시험, 오답 노트, 상황극 | `/test`, `/test/quiz`, `/test/notes`, `/test/roleplay` |
| 🏪 내 가게 | 3관문, 캡처 진단, 틀린 곳 찾기, 미션, QR, 광고 | `/shop`, `/shop/diagnose`, `/shop/spot`, `/shop/mission/[id]`, `/shop/qr`, `/shop/ads` |
| 🏆 랭킹 | 주간 리그, 지역 랭킹 | `/rank` |
| 👤 내 정보 | 학습 기록, 스킬 맵, **시연 도구(4주 넘기기)** | `/me` |

## 팀원별로 참고할 곳

| 담당 | 볼 파일 |
|---|---|
| 박민하 (Elo·XP·랭킹·가상 날짜) | `lib/train/engine.ts`(Elo, 출제 `pickNext`, XP·스트릭·복습), `lib/train/league.ts`, `lib/train/demo.ts`, `docs/api-contract.md` |
| 이동성 (시험·문제 은행) | `lib/train/bank.ts`(문제 40개, 오류 유형 사전), `lib/ai/adapter.ts`의 상황극 대본·루브릭, `app/(flow)/test/` |
| 강민국 (내 가게·AI) | `lib/train/gates.ts`(3관문 점수), `lib/ai/adapter.ts`(AI 어댑터 자리), `app/(flow)/shop/`, `components/train/shop.tsx` |
| 주승준 (트레이닝·공통 UI) | `app/(tabs)/train`, `components/train/`, `components/ui.tsx`, `app/globals.css`(디자인 토큰) |

- `docs/api-contract.md`: 이 화면이 서버에 기대하는 테이블·엔드포인트·규칙 숫자. 정식 API는 루트 `docs/03_API설계_초안.md`가 기준이에요.
- 숫자(XP, Elo, 관문 기준)는 모두 가정값이에요.

## 아직 없는 것

- 문제 은행 40/60개 (사진 20, 리뷰 답글 20). 나머지 유닛은 "준비 중".
- 친구, 인스타 캡처, 주간 점검 (P1).
- 서버 연결: 기록은 이 기기에만 저장돼요.
- 예전 BCT 루틴 화면(`/routine`, `/today`, `/report` 등)이 남아 있어요. 기획서 범위 밖이니 참고하지 않아도 돼요.

## 로그인 키 (선택)

`.env.local`에 넣고 서버를 다시 켜면 버튼이 동작해요. 이름은 `.env.example`에 있어요. 키 값은 절대 커밋하지 마세요.

- 카카오: developers.kakao.com → Web 플랫폼 도메인과 Redirect URI `http://<주소>:3100/api/auth/callback/kakao` 등록 → `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`
- 네이버: developers.naver.com → Callback URL `http://<주소>:3100/api/auth/callback/naver` → `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET`
- 가게 검색: 네이버 검색 API(지역) → `NAVER_SEARCH_ID`, `NAVER_SEARCH_SECRET`
- 시연 때 시연용 계정을 숨기려면 `MACO_TEST_LOGIN=off`

@AGENTS.md

## Claude Code 전용

- 위 `AGENTS.md`가 팀 공통 규칙이다. 이 파일에는 Claude Code에만 해당하는 내용만 둔다.
- 스킬은 `/maco-start`, `/maco-pr`처럼 부른다 (`.claude/skills/`는 `.agents/skills/`의 복사본이므로 직접 고치지 않는다).
- 파일 3개 이상 바꾸는 작업은 Plan 모드로 계획을 먼저 보여 준다.
- 권한은 `.claude/settings.json`(팀 공용)을 따른다. 개인 설정은 `.claude/settings.local.json`에 둔다 (커밋하지 않음).
- 하위 폴더를 작업할 때는 그 폴더의 `CLAUDE.md`(= 그 폴더의 `AGENTS.md`)도 따른다.

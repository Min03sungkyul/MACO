#!/usr/bin/env node
// 스킬 원본(.agents/skills, Codex용)을 Claude Code용 복사본(.claude/skills)으로 복사한다.
//   node scripts/sync-skills.mjs
// 스킬은 항상 .agents/skills 에서만 고친다.

import { cpSync, rmSync, existsSync } from 'node:fs';

const SRC = '.agents/skills';
const DST = '.claude/skills';

if (!existsSync(SRC)) {
  console.error(`${SRC} 폴더가 없습니다. 저장소 루트에서 실행하세요.`);
  process.exit(1);
}
rmSync(DST, { recursive: true, force: true });
cpSync(SRC, DST, { recursive: true });
console.log(`✅ ${SRC} → ${DST} 복사 완료`);

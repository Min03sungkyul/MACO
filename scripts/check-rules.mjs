#!/usr/bin/env node
// MACO 공통 규칙 검사 (AGENTS.md 4장). 사람과 AI 모두 PR 전에 실행한다.
//   node scripts/check-rules.mjs
// 오류가 있으면 종료 코드 1. 경고는 표시만 한다.
// BASE_REF 환경 변수(기본 origin/main)와 비교해 병합된 마이그레이션 수정 여부도 검사한다.

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, extname, relative, sep } from 'node:path';

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

// 1) 검사할 파일 목록: git이 있으면 추적·새 파일, 없으면 폴더를 직접 훑는다.
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'build', 'out', '.gradle', 'dist', 'uploads', '.idea']);
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(relative('.', p).split(sep).join('/'));
  }
  return acc;
}

let files;
let gitAvailable = true;
try {
  files = sh('git -c core.quotepath=false ls-files -z -co --exclude-standard').split('\0').filter(Boolean);
} catch {
  gitAvailable = false;
  files = walk('.');
  warnings.push('(git 없음) 폴더 전체를 검사합니다. .gitignore는 적용되지 않습니다.');
}
files = files.filter((f) => existsSync(f));

const TEXT_EXT = new Set(['.java', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.yml', '.yaml', '.properties', '.sql', '.md', '.csv', '.toml', '.css', '.html', '.txt', '.env', '.example', '']);
const isText = (f) => TEXT_EXT.has(extname(f).toLowerCase());
const read = (f) => {
  try { return readFileSync(f, 'utf8'); } catch { return ''; }
};
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// 2) 규칙
const ENV_FILE = /^\.env(\..+)?$/;
const SECRET_PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/, 'Anthropic API 키로 보이는 값'],
  [/sk-(proj-)?[A-Za-z0-9_-]{32,}/, 'OpenAI API 키로 보이는 값'],
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API 키로 보이는 값'],
  [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, '개인 키'],
];
const NOW_PATTERN = /\b(LocalDate|LocalDateTime|ZonedDateTime|OffsetDateTime|Instant|LocalTime)\.now\s*\(/g;
const AI_VENDOR_PATTERN = /api\.anthropic\.com|api\.openai\.com|generativelanguage\.googleapis\.com|clovastudio|import\s+com\.anthropic|import\s+com\.openai|@anthropic-ai\/sdk|from\s+['"]openai['"]|@google\/genai/;
const HEX_COLOR = /#[0-9a-fA-F]{6}\b/;
const UNICODE_ESCAPE = /\\u[0-9a-fA-F]{4}/;

for (const f of files) {
  const name = basename(f);

  // 비밀값 파일
  if (ENV_FILE.test(name) && name !== '.env.example') {
    err(f, '.env 파일은 커밋하면 안 됩니다 (.gitignore 확인)');
    continue;
  }
  if (!isText(f)) continue;
  const text = read(f);
  if (f === 'scripts/check-rules.mjs') continue;

  for (const [re, label] of SECRET_PATTERNS) {
    const m = text.match(re);
    if (m) err(`${f}:${lineOf(text, m.index)}`, `${label}가 있습니다. 키는 .env에만 두세요`);
  }

  // 날짜: AppClock만 사용
  if (f.startsWith('backend/src/main/java/') && f.endsWith('.java') && !f.includes('/common/time/')) {
    for (const m of text.matchAll(NOW_PATTERN)) {
      err(`${f}:${lineOf(text, m.index)}`, `${m[0]}) 대신 AppClock.today/now(userId)를 쓰세요`);
    }
  }

  // AI 호출: com.maco.ai 패키지 안에서만
  const inCode = (f.startsWith('backend/src/main/java/') || f.startsWith('frontend/src/'));
  if (inCode && !f.startsWith('backend/src/main/java/com/maco/ai/')) {
    const m = text.match(AI_VENDOR_PATTERN);
    if (m) err(`${f}:${lineOf(text, m.index)}`, 'AI API·SDK는 com.maco.ai 패키지에서만 쓸 수 있습니다 (AiClient 사용)');
  }

  // ddl-auto=update 금지
  if (f.startsWith('backend/src/main/resources/') && /ddl-auto\s*[:=]\s*update/.test(text)) {
    err(f, 'ddl-auto=update 대신 Flyway 마이그레이션을 쓰세요');
  }

  // 색 코드는 토큰으로 (경고)
  if ((f.startsWith('frontend/src/app/') || f.startsWith('frontend/src/components/')) && /\.(tsx?|css)$/.test(f)) {
    const m = text.match(HEX_COLOR);
    if (m) warn(`${f}:${lineOf(text, m.index)}`, `색 코드 ${m[0]} 대신 디자인 토큰을 쓰세요`);
  }

  // 한국어 유니코드 이스케이프 (경고)
  if (/\.(md|csv)$/.test(f)) {
    const m = text.match(UNICODE_ESCAPE);
    if (m) warn(`${f}:${lineOf(text, m.index)}`, '유니코드 이스케이프 대신 한국어를 그대로 쓰세요');
  }
}

// 3) 병합된 마이그레이션 수정 금지
if (gitAvailable) {
  const base = process.env.BASE_REF || 'origin/main';
  try {
    sh(`git rev-parse --verify ${base}`);
    const out = sh(`git -c core.quotepath=false diff --name-status --diff-filter=MDR ${base}...HEAD -- backend/src/main/resources/db/migration`).trim();
    if (out) {
      for (const line of out.split('\n')) err(line.split('\t').pop(), '이미 병합된 마이그레이션은 고치지 말고 새 V 파일을 추가하세요');
    }
  } catch {
    warnings.push(`(${base} 없음) 마이그레이션 수정 검사는 건너뜁니다.`);
  }
}

// 4) 스킬 원본(.agents/skills)과 복사본(.claude/skills)이 같은지
const SRC = '.agents/skills/';
const DST = '.claude/skills/';
const srcFiles = files.filter((f) => f.startsWith(SRC));
const dstFiles = new Set(files.filter((f) => f.startsWith(DST)));
for (const f of srcFiles) {
  const copy = DST + f.slice(SRC.length);
  if (!dstFiles.has(copy) || read(copy) !== read(f)) {
    err(copy, '스킬 복사본이 원본과 다릅니다. node scripts/sync-skills.mjs 를 실행하세요');
  }
  dstFiles.delete(copy);
}
for (const f of dstFiles) err(f, '원본(.agents/skills)에 없는 스킬입니다. 원본에 만들고 sync-skills를 실행하세요');

// 5) 결과
for (const w of warnings) console.log(`⚠️  ${w}`);
for (const e of errors) console.log(`❌ ${e}`);
if (errors.length) {
  console.log(`\n규칙 검사 실패: 오류 ${errors.length}개, 경고 ${warnings.length}개`);
  process.exit(1);
}
console.log(`✅ 규칙 검사 통과 (파일 ${files.length}개, 경고 ${warnings.length}개)`);

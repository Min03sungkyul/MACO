#!/usr/bin/env node
/**
 * 이미 켜져 있는 화면 개발 서버(next dev)를 끈다. VS Code에서 ①·②를 누르기 전에 자동으로 실행된다.
 * Next.js는 한 폴더에 개발 서버를 하나만 허용한다 ("Another next dev server is already running").
 * Windows에서는 VS Code의 ■로 멈춰도 next dev가 뒤에 남는 경우가 있어서 필요하다.
 * next dev가 남기는 .next/dev/lock 파일의 PID를 읽어 그 프로세스(와 자식)를 끈다.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const lockPath = join(process.cwd(), '.next', 'dev', 'lock');

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

if (!existsSync(lockPath)) {
  process.exit(0);
}

let pid;
try {
  pid = JSON.parse(readFileSync(lockPath, 'utf-8')).pid;
} catch {
  process.exit(0);
}

if (!pid || !alive(pid)) {
  process.exit(0);
}

console.log(`이미 켜져 있던 화면 서버(PID ${pid})를 끕니다.`);
try {
  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
  } else {
    process.kill(pid, 'SIGTERM');
  }
} catch {
  /* 이미 꺼졌으면 무시 */
}

// 꺼질 때까지 최대 5초 기다린다
const until = Date.now() + 5000;
while (alive(pid) && Date.now() < until) {
  execSync(process.platform === 'win32' ? 'ping -n 2 127.0.0.1 >NUL' : 'sleep 0.3');
}
console.log(alive(pid) ? '끄지 못했어요. 작업 관리자에서 node.exe를 끝내 주세요.' : '껐습니다.');

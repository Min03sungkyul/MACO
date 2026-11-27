'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { getMe, login, signup } from '@/lib/api/common';
import { ApiError } from '@/lib/api/client';
import { setToken } from '@/lib/auth';

/**
 * S1 시작·로그인 (담당: 주승준, 로그인 API는 박민하). 이메일 로그인 + 예시 계정 2개.
 * TODO(주승준): prototype/app/(onboarding)/start/page.tsx 화면 (카카오·네이버 버튼은 P1)
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [signupMode, setSignupMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const go = async (e: string, p: string) => {
    setBusy(true);
    setError(null);
    try {
      const t = signupMode ? await signup(e, p, nickname) : await login(e, p);
      setToken(t.accessToken);
      const me = await getMe();
      router.replace(me.mode ? '/training' : '/mode');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인하지 못했어요');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center gap-6 py-10">
      <div>
        <p className="text-3xl font-black text-accent">MACO</p>
        <h1 className="mt-2 text-2xl font-bold leading-snug">매일 10분,<br />마케팅 트레이닝</h1>
        <p className="mt-2 text-sm text-sub">대신 해 주지 않고, 혼자서도 하게 도와드려요</p>
      </div>
      <form className="flex flex-col gap-3" onSubmit={(ev) => { ev.preventDefault(); go(email, password); }}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" aria-label="이메일"
          className="rounded-option border border-line px-4 py-3 outline-none focus:border-accent" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 (8자 이상)" aria-label="비밀번호"
          className="rounded-option border border-line px-4 py-3 outline-none focus:border-accent" />
        {signupMode && (
          <input required value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="랭킹에 보일 이름 (가게 이름)" aria-label="이름"
            className="rounded-option border border-line px-4 py-3 outline-none focus:border-accent" />
        )}
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        <Button type="submit" variant="accent" disabled={busy}>{signupMode ? '가입하고 시작하기' : '로그인'}</Button>
        <button type="button" className="text-sm text-sub" onClick={() => setSignupMode(!signupMode)}>{signupMode ? '이미 계정이 있어요' : '처음이에요 (가입하기)'}</button>
      </form>
      <div className="flex flex-col gap-2 border-t border-line pt-5">
        <p className="text-xs text-sub">시연용 예시 계정으로 둘러보기 (로컬 서버)</p>
        <Button variant="secondary" disabled={busy} onClick={() => go('learner@maco.app', 'maco1234')}>입문자 (가게 없음)</Button>
        <Button variant="secondary" disabled={busy} onClick={() => go('owner@maco.app', 'maco1234')}>사장님 (부평 카페)</Button>
      </div>
    </main>
  );
}

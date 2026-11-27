'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Logo } from '@/components/ui';
import { learnerAccount, ownerAccount } from '@/lib/train/demo';
import { useStore } from '@/lib/store';

type Logins = { kakao: boolean; naver: boolean; test: boolean };

/** S1 시작·로그인 (기획서 A1): 카카오·네이버, 시연용 계정, 예시 계정 2개 */
export default function Start() {
  const router = useRouter();
  const { set, today, toast } = useStore();
  const [logins, setLogins] = useState<Logins | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    fetch('/api/logins').then((r) => r.json()).then(setLogins).catch(() => setLogins({ kakao: false, naver: false, test: true }));
  }, []);

  const social = (id: 'kakao' | 'naver', label: string) => {
    if (!logins?.[id]) return toast(`${label} 로그인은 앱 키를 연결하면 열려요. 지금은 시연용 계정으로 시작해 주세요`);
    setBusy(true);
    signIn(id, { redirectTo: `/mode?via=${id}` });
  };
  const testLogin = () => {
    setBusy(true);
    signIn('test', { name: name.trim() || '마코 사장님', redirectTo: '/mode?via=test' });
  };
  const example = (who: 'learner' | 'owner') => {
    const a = who === 'learner' ? learnerAccount(today) : ownerAccount(today);
    set({ train: a.train, prog: a.prog, signedUp: true, ownerName: a.ownerName, loginWith: 'test', joinedAt: today });
    router.replace('/train');
  };

  return (
    <main className="screen start fade">
      <div className="start-hero">
        <div className="top"><Logo /></div>
        <h1>매일 10분,<br />마케팅 트레이닝.</h1>
        <p className="sub">배우고, 시험 보고, 우리 가게에 적용해요.<br />대신 해 주지 않고, 혼자서도 하게 도와요.</p>
        <div className="start-art" aria-hidden="true">
          <span className="c1">트레이닝</span><span className="c2">시험</span><span className="c3">내 가게</span><span className="c4">랭킹</span>
        </div>
      </div>
      <div className="bottom start-login">
        <p className="start-login-title">시작하기</p>
        <button className="btn kakao" type="button" disabled={busy} onClick={() => social('kakao', '카카오')}>카카오로 시작하기</button>
        <button className="btn naver" type="button" disabled={busy} onClick={() => social('naver', '네이버')}>네이버로 시작하기</button>
        {logins?.test && (
          <div className="test-login">
            <label htmlFor="demo-name">시연용 계정 · 이름</label>
            <div>
              <input id="demo-name" value={name} maxLength={20} placeholder="예: 김마코" onChange={(e) => setName(e.target.value)} />
              <button type="button" disabled={busy} onClick={testLogin}>시작</button>
            </div>
          </div>
        )}
        <button className="link" type="button" onClick={() => setDemo(!demo)} aria-expanded={demo}>예시 계정으로 둘러보기</button>
        {demo && (
          <div className="demo-accounts">
            <button type="button" onClick={() => example('learner')}><b>입문자</b><span>학습 모드 · 연습 카페</span></button>
            <button type="button" onClick={() => example('owner')}><b>사장님</b><span>내 가게 모드 · 리뷰 3개 카페</span></button>
          </div>
        )}
      </div>
    </main>
  );
}

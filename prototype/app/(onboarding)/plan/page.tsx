'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { PlanView } from '@/components/PlanView';
import { WhenReady } from '@/components/ui';
import { useStore } from '@/lib/store';

type Logins = { kakao: boolean; apple: boolean; test: boolean };

/** D 이번 주 루틴 + S 가입 시트 (sign-up comes after the user has a routine). */
export default function Plan() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { plan, dates, data, toast } = useStore();
  const [sheet, setSheet] = useState(false);
  const [logins, setLogins] = useState<Logins | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [y, m, d] = dates[0].split('-').map(Number);

  useEffect(() => {
    fetch('/api/logins').then((r) => r.json()).then(setLogins).catch(() => setLogins({ kakao: false, apple: false, test: true }));
  }, []);

  // Coming back from a failed login (Auth.js sends ?error=...)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error')) {
      setSheet(true);
      toast('로그인을 마치지 못했어요. 다시 시도해 주세요');
    }
  }, [toast]);

  const social = (id: 'kakao' | 'apple', label: string) => {
    if (!logins?.[id]) {
      toast(`${label} 로그인은 앱 키를 연결하면 열려요. 지금은 테스트 계정으로 시작해 주세요`);
      return;
    }
    setBusy(true);
    signIn(id, { redirectTo: `/ready?via=${id}` });
  };

  const testLogin = () => {
    setBusy(true);
    signIn('test', { name: name.trim() || '테스트 사장님', redirectTo: '/ready?via=test' });
  };

  return (
    <>
      <PlanView eyebrow="처방 · 1주차" lead="이번 주는" tasks={plan} firstDay={new Date(y, m - 1, d)}
        cta="이 루틴으로 시작하기"
        onCta={() => (data.signedUp ? router.push('/routine') : setSheet(true))} />
      {sheet && (
        <div className="dim" onClick={(e) => e.target === e.currentTarget && !busy && setSheet(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="signup-title">
            <div className="grab" />
            <h2 className="title" id="signup-title">루틴을 저장할게요</h2>
            <p className="body-text">가입하면 알림과 주간 리포트를 받을 수 있어요. 진단 결과도 함께 저장돼요.</p>
            <button className="btn kakao" type="button" disabled={busy} onClick={() => social('kakao', '카카오')}>카카오로 계속하기</button>
            <button className="btn" type="button" disabled={busy} onClick={() => social('apple', 'Apple')}>Apple로 계속하기</button>
            {logins?.test && (
              <div className="test-login">
                <label htmlFor="shop-name">테스트 계정 · 가게 이름</label>
                <div>
                  <input id="shop-name" value={name} maxLength={20} placeholder="예: 마코 베이커리" onChange={(e) => setName(e.target.value)} />
                  <button type="button" disabled={busy} onClick={testLogin}>시작</button>
                </div>
              </div>
            )}
            <button className="link" type="button" disabled={busy} onClick={() => setSheet(false)}>나중에 할게요</button>
          </div>
        </div>
      )}
    </>
  );
}

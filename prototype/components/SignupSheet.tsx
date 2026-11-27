'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useStore } from '@/lib/store';

type Logins = { kakao: boolean; apple: boolean; test: boolean };

/** "기록을 저장할까요?" — sign-up after the first stage. Kakao/Apple when keys are set, else the test account. */
export function SignupSheet({ onLater, title = '기록을 저장할까요?', desc = '가입하면 경험치, 코인, 연속 기록이 저장되고 리그에 참여할 수 있어요.', later = '나중에 할게요' }: { onLater: () => void; title?: string; desc?: string; later?: string }) {
  const { toast } = useStore();
  const [logins, setLogins] = useState<Logins | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/logins').then((r) => r.json()).then(setLogins).catch(() => setLogins({ kakao: false, apple: false, test: true }));
  }, []);

  const social = (id: 'kakao' | 'apple', label: string) => {
    if (!logins?.[id]) { toast(`${label} 로그인은 앱 키를 연결하면 열려요. 지금은 테스트 계정으로 시작해 주세요`); return; }
    setBusy(true);
    signIn(id, { redirectTo: `/ready?via=${id}` });
  };
  const testLogin = () => {
    setBusy(true);
    signIn('test', { name: name.trim() || '마코 베이커리', redirectTo: '/ready?via=test' });
  };

  return (
    <div className="dim" onClick={(e) => e.target === e.currentTarget && !busy && onLater()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="save-title">
        <div className="grab" />
        <h2 className="title" id="save-title">{title}</h2>
        <p className="body-text">{desc}</p>
        <button className="btn kakao" type="button" disabled={busy} onClick={() => social('kakao', '카카오')}>카카오로 계속하기</button>
        <button className="btn" type="button" disabled={busy} onClick={() => social('apple', 'Apple')}>Apple로 계속하기</button>
        {logins?.test && (
          <div className="test-login">
            <label htmlFor="shop-name">테스트 계정 · 가게 이름</label>
            <div>
              <input id="shop-name" value={name} maxLength={20} placeholder="예: 망원동 무화과 카페" onChange={(e) => setName(e.target.value)} />
              <button type="button" disabled={busy} onClick={testLogin}>시작</button>
            </div>
          </div>
        )}
        <button className="link" type="button" disabled={busy} onClick={onLater}>{later}</button>
      </div>
    </div>
  );
}

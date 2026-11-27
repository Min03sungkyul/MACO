'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Option, TopBar } from '@/components/ui';
import { useStore } from '@/lib/store';

const REASONS = ['시간이 없었어요', '사진이 마음에 안 들었어요', '올리는 방법이 헷갈렸어요', '깜빡했어요'];

/** H2 못 한 이유: no blame, the reason feeds next week's re-prescription. */
export default function Reason() {
  const router = useRouter();
  const { session, today, set, setSession } = useStore();
  const [r, setR] = useState<number | null>(null);
  const save = () => {
    if (r === null) return;
    const target = session.target ?? today;
    set((d) => ({ records: { ...d.records, [target]: { status: 'rest', reason: REASONS[r] } } }));
    setSession({ busy: false, caption: null, target: null });
    router.replace('/today');
  };
  return (
    <main className="screen fade">
      <TopBar title="기록" step="3/3" backHref="/record" />
      <h1 className="title">괜찮아요.{'\n'}무엇 때문이었나요?</h1>
      <div className="hint" style={{ marginTop: 10 }}><Avatar size={22} /><span>다음 주 루틴을 짤 때 참고할게요.</span></div>
      <div className="opts">
        {REASONS.map((t, i) => <Option key={t} pressed={r === i} onClick={() => setR(i)} label={t} />)}
      </div>
      <div className="bottom"><button className="btn" type="button" disabled={r === null} onClick={save}>기록 저장</button></div>
    </main>
  );
}

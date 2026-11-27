'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui';
import { useStore } from '@/lib/store';

const STEPS = ['업종과 주력 채널 확인', '쓸 수 있는 시간에 맞춰 양 조절', '막히는 부분 대응 방법 찾기', '첫 주 루틴 만들기'];

/** Shows what the analysis is doing, then moves to the result (about 3 s). */
export default function Analyzing() {
  const router = useRouter();
  const { set } = useStore();
  const [on, setOn] = useState(0);
  useEffect(() => {
    const ts = STEPS.map((_, k) => setTimeout(() => setOn(k + 1), 550 + k * 600));
    ts.push(setTimeout(() => { set({ diagnosed: true, tasksPerWeek: null, easeDay: null }); router.replace('/result'); }, 550 + STEPS.length * 600 + 500));
    return () => ts.forEach(clearTimeout);
  }, [router, set]);
  return (
    <main className="screen analyze fade">
      <div className="ring"><Avatar size={76} alt="마코 캐릭터" /></div>
      <h1 className="title" style={{ marginTop: 28 }}>마코가 사장님 가게를{'\n'}분석하고 있어요</h1>
      <ul className="checks" aria-live="polite">
        {STEPS.map((s, k) => <li key={s} className={k < on ? 'on' : ''}><i className="ck" />{s}</li>)}
      </ul>
    </main>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { ROLEPLAY, gradeRoleplay, guestReply, type Turn } from '@/lib/ai/adapter';
import { addXp } from '@/lib/train/engine';

const TURNS = 3;

/** S14 상황극 (T3·F7): AI 손님과 3턴 대화 → 루브릭 점수와 고칠 문장. 시연은 저장된 대본으로 답해요. */
export default function Roleplay() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { setTrain, setProg, today } = useTrain();
  const [turns, setTurns] = useState<Turn[]>([{ from: 'guest', text: ROLEPLAY.opening }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [report, setReport] = useState<ReturnType<typeof gradeRoleplay> | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns, typing]);

  const owner = turns.filter((x) => x.from === 'owner');
  const send = () => {
    const v = text.trim();
    if (v.length < 4 || typing) return;
    const idx = owner.length;
    setTurns((ts) => [...ts, { from: 'owner', text: v }]);
    setText('');
    if (idx + 1 >= TURNS) {
      const g = gradeRoleplay([...owner.map((o) => o.text), v]);
      setTimeout(() => {
        setReport(g);
        setTrain((s) => addXp(s, today, g.xp));
        setProg((p) => ({ roleplays: [...p.roleplays, { date: today, score: g.score }] }));
      }, 500);
      return;
    }
    setTyping(true);
    setTimeout(() => { setTurns((ts) => [...ts, { from: 'guest', text: guestReply(idx, v) ?? '' }]); setTyping(false); }, 900);
  };

  if (report) {
    return (
      <main className="t-center fade">
        <div className="hero">
          <div className="t-score">{report.score}<small>점</small></div>
          <h1>상황극 리포트</h1>
          <ul className="t-rubric big">{report.checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : ''}>{c.ok ? TI.check : TI.cross}{c.label}</li>)}</ul>
          <div className="t-report">
            <p><b>잘한 점</b> {report.good}</p>
            {report.lines.length > 0 && <p><b>고칠 문장</b></p>}
            {report.lines.map((l) => <div key={l.turn} className="t-fixline"><span>{l.turn}번째 답: &ldquo;{l.text}&rdquo;</span><em>→ {l.fix}</em></div>)}
          </div>
          <div className="t-tiles"><div className="t-tile xp"><span className="k">얻은 XP</span><b>+{report.xp}</b></div></div>
        </div>
        <div className="t-actions">
          <button type="button" className="btn ghost" onClick={() => { setTurns([{ from: 'guest', text: ROLEPLAY.opening }]); setReport(null); }}>다시 하기</button>
          <button type="button" className="btn" onClick={() => router.replace('/test')}>확인</button>
        </div>
      </main>
    );
  }

  return (
    <main className="t-lesson">
      <div className="t-ltop">
        <button type="button" onClick={() => router.push('/test')} aria-label="그만하기">{TI.close}</button>
        <div className="t-bar"><i style={{ width: `${(owner.length / TURNS) * 100}%` }} /></div>
        <span className="t-where">상황극 {Math.min(owner.length + 1, TURNS)}/{TURNS}</span>
      </div>
      <div className="t-chat" aria-live="polite">
        <p className="t-virtual">연습용 가상 상황이에요 · {ROLEPLAY.title}</p>
        {turns.map((m, k) => (
          <div key={k} className={`t-msg ${m.from}`}>
            {m.from === 'guest' && <span className="who">{ROLEPLAY.guest}</span>}
            <p>{m.text}</p>
          </div>
        ))}
        {typing && <div className="t-msg guest"><span className="who">{ROLEPLAY.guest}</span><p className="dots">입력 중…</p></div>}
        <div ref={end} />
      </div>
      <div className="t-coach"><Avatar size={28} /><span>공감 → 사과 → 개선 → 다시 오기 순서를 떠올려 보세요.</span></div>
      <form className="t-send" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea id="rp-input" value={text} rows={2} maxLength={200} placeholder="사장님 답을 써 보세요" onChange={(e) => setText(e.target.value)} aria-label="사장님 답" disabled={typing} />
        <button type="submit" className="btn accent" disabled={text.trim().length < 4 || typing}>보내기</button>
      </form>
    </main>
  );
}

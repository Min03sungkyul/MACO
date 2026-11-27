'use client';

import { useEffect, useRef, useState } from 'react';
import { explainWrong, gradeText, type Graded } from '@/lib/ai/adapter';
import { conceptOf } from '@/lib/train/bank';
import type { Item } from '@/lib/train/types';
import { PhotoMock } from './PhotoMock';
import { TI } from './icons';

export type Answer = { ok: boolean; ms: number; graded?: Graded };

const TYPE: Record<Item['t'], string> = { pick2: '둘 중 고르기', judge: '상황 판단', spot: '틀린 곳 찾기', rewrite: '고쳐 쓰기' };

/**
 * 한 문제를 보여 주고 채점해요. 고르기·찾기·판단은 문제 은행 정답으로, 고쳐 쓰기는 AI 어댑터(시연: 규칙)로.
 * feedback=false면 배치 테스트처럼 정답을 바로 알려 주지 않아요.
 */
export function ItemPlayer({ item, feedback = true, onAnswer, onNext, nextLabel = '계속' }: {
  item: Item; feedback?: boolean; onAnswer: (a: Answer) => void; onNext: () => void; nextLabel?: string;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const [marks, setMarks] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [result, setResult] = useState<Answer | null>(null);
  const [more, setMore] = useState<'none' | 'card' | 'why'>('none');
  const started = useRef(Date.now());

  const ready = item.t === 'spot' ? marks.length > 0 : item.t === 'rewrite' ? text.trim().length >= 8 : pick !== null;

  const check = () => {
    const ms = Date.now() - started.current;
    let a: Answer;
    if (item.t === 'pick2' || item.t === 'judge') a = { ok: pick === item.ans, ms };
    else if (item.t === 'spot') {
      const bad = item.parts.filter((p) => p.bad).map((p) => p.id).sort().join();
      a = { ok: [...marks].sort().join() === bad, ms };
    } else {
      const g = gradeText(item.rubric, text);
      a = { ok: g.pass, ms, graded: g };
    }
    setResult(a);
    onAnswer(a);
    if (!feedback) onNext();
  };

  const locked = !!result;
  return (
    <>
      <div className="t-body" key={item.id}>
        <div className="t-type">{TYPE[item.t]}</div>
        <h1 className="t-q">{item.q}</h1>
        {item.t === 'pick2' && (
          <div className="t-pick2" role="group">
            {item.a.map((c, k) => (
              <button key={k} type="button" disabled={locked} aria-pressed={pick === k}
                className={`t-card ${locked && feedback ? (k === item.ans ? 'right' : pick === k ? 'wrong' : '') : ''}`} onClick={() => setPick(k)}>
                <span className="t-ab">{k ? 'B' : 'A'}</span>
                {c.photo ? <PhotoMock p={c.photo} /> : <span className="t-cardtext">{c.text}</span>}
              </button>
            ))}
          </div>
        )}
        {item.t === 'judge' && (
          <div className="t-opts" role="group">
            {item.o.map((o, k) => (
              <button key={k} type="button" disabled={locked} aria-pressed={pick === k}
                className={`t-opt ${locked && feedback ? (k === item.ans ? 'right' : pick === k ? 'wrong' : '') : ''}`} onClick={() => setPick(k)}>
                <span className="key">{k + 1}</span><span>{o}</span>
              </button>
            ))}
          </div>
        )}
        {item.t === 'spot' && (
          <div className={`t-spot ${item.view}`} role="group">
            {item.parts.map((p) => {
              const on = marks.includes(p.id);
              const state = locked && feedback ? (p.bad ? (on ? 'right' : 'missed') : on ? 'wrong' : '') : '';
              return (
                <button key={p.id} type="button" disabled={locked} aria-pressed={on} className={`t-part ${state}`}
                  onClick={() => setMarks((m) => (on ? m.filter((x) => x !== p.id) : [...m, p.id]))}>
                  {p.photo && <PhotoMock p={p.photo} />}
                  {p.stars !== undefined && <span className="t-stars">{'★'.repeat(p.stars)}<i>{'★'.repeat(5 - p.stars)}</i></span>}
                  {p.text && <span className="t-parttext">{p.text}</span>}
                  {on && !locked && <span className="t-mark">{TI.check}</span>}
                  {locked && feedback && (p.bad || on) && <span className="t-note">{p.note}</span>}
                </button>
              );
            })}
          </div>
        )}
        {item.t === 'rewrite' && (
          <div className="t-rewrite">
            <div className="t-context">{item.context}</div>
            <textarea id={`rw-${item.id}`} value={text} disabled={locked} rows={5} maxLength={300} placeholder="사장님 답글을 직접 써 보세요"
              onChange={(e) => setText(e.target.value)} aria-label="답글 쓰기" />
            <div className="t-count">{text.length}/300 · 마코는 대신 써 주지 않고 채점만 해요</div>
            {result?.graded && feedback && (
              <ul className="t-rubric">{result.graded.checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : ''}>{c.ok ? TI.check : TI.cross}{c.label}</li>)}</ul>
            )}
          </div>
        )}
      </div>
      {!result || !feedback ? (
        <div className="t-foot"><button type="button" className="btn" disabled={!ready || locked} onClick={check}>확인</button></div>
      ) : (
        <Feedback item={item} r={result} more={more} setMore={setMore} onNext={onNext} nextLabel={nextLabel} />
      )}
    </>
  );
}

function Feedback({ item, r, more, setMore, onNext, nextLabel }: {
  item: Item; r: Answer; more: 'none' | 'card' | 'why'; setMore: (m: 'none' | 'card' | 'why') => void; onNext: () => void; nextLabel: string;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  const card = conceptOf(item.skill, item.level);
  return (
    <div className={`t-feedback ${r.ok ? 'good' : 'bad'}`} role="status">
      <h4>{r.ok ? TI.check : TI.cross}{r.ok ? '정답이에요' : item.t === 'rewrite' ? '조금만 고쳐 봐요' : '아쉬워요'}</h4>
      {r.graded ? (
        <p><b>잘한 점</b> {r.graded.good}{r.graded.fix ? <><br /><b>고칠 점</b> {r.graded.fix}</> : null}</p>
      ) : <p>{item.why}</p>}
      {item.t === 'rewrite' && !r.ok && <p className="t-sample">예시: {item.sample}</p>}
      <div className="t-fb-links">
        {card && <button type="button" onClick={() => setMore(more === 'card' ? 'none' : 'card')}>30초 원리 카드</button>}
        {!r.ok && <button type="button" onClick={() => setMore(more === 'why' ? 'none' : 'why')}>왜 틀렸어요?</button>}
      </div>
      {more === 'card' && card && <div className="t-mini"><b>{card.title}</b><span>{card.body}</span><small>근거: {card.source}</small></div>}
      {more === 'why' && <div className="t-mini"><b>마코 코치</b><span>{explainWrong(item)}</span></div>}
      <button ref={btn} type="button" className={`btn ${r.ok ? 'accent' : 'bad'}`} onClick={onNext}>{nextLabel}</button>
    </div>
  );
}

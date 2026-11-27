'use client';

import { useRef, useState } from 'react';
import type { Item } from '@/lib/types/common';
import { Button } from './Button';
import { parsePhoto, PhotoMock } from './PhotoMock';

const TYPE_LABEL: Record<Item['type'], string> = { CHOICE2: '둘 중 고르기', JUDGE: '상황 판단', SPOT: '틀린 곳 찾기', REWRITE: '고쳐 쓰기' };

export type QuestionAnswer = { answer?: string; answerText?: string; elapsedMs: number };

/**
 * 문제 한 개 (4유형). 트레이닝·시험·오답 노트·배치 테스트가 같이 쓴다 (docs/01 5-5).
 * 출처: prototype/components/train/ItemPlayer.tsx
 *
 * - 고르기·판단: answer = 보기 키(A~D), 틀린 곳 찾기: answer = "b|d|f", 고쳐 쓰기: answerText
 * - 채점은 서버(/attempts, /rewrite/grade)가 한다. 결과가 오면 graded로 넘겨 정답·오답 표시
 */
export function QuestionCard({ item, graded, submitting, onSubmit, submitLabel = '확인' }: {
  item: Item;
  /** 채점 결과 (정답 키). 넘기면 잠기고 정답·오답 색을 보여 준다 */
  graded?: { correct: boolean; answer: string | null } | null;
  submitting?: boolean;
  onSubmit: (a: QuestionAnswer) => void;
  submitLabel?: string;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const [marks, setMarks] = useState<string[]>([]);
  const [text, setText] = useState('');
  const started = useRef<number | null>(null);
  const locked = !!graded || !!submitting;
  const right = graded?.answer ?? null;
  const rightSet = new Set((right ?? '').split('|'));

  const ready = item.type === 'SPOT' ? marks.length > 0 : item.type === 'REWRITE' ? text.trim().length >= 8 : pick !== null;
  const submit = () => {
    // 첫 상호작용부터 잰다 (렌더 중 Date.now 호출 금지)
    const elapsedMs = started.current ? performance.now() - started.current : 0;
    if (item.type === 'SPOT') onSubmit({ answer: marks.join('|'), elapsedMs });
    else if (item.type === 'REWRITE') onSubmit({ answerText: text.trim(), elapsedMs });
    else onSubmit({ answer: pick ?? '', elapsedMs });
  };
  const touch = () => { if (started.current === null) started.current = performance.now(); };

  const tone = (key: string, chosen: boolean) => {
    if (!graded) return chosen ? 'border-accent bg-accent-soft' : 'border-line';
    if (item.type === 'SPOT') return rightSet.has(key) ? (chosen ? 'border-good bg-good-soft' : 'border-bad border-dashed') : chosen ? 'border-bad bg-bad-soft' : 'border-line';
    return key === right ? 'border-good bg-good-soft' : chosen ? 'border-bad bg-bad-soft' : 'border-line';
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-1 text-xs font-semibold text-accent">{TYPE_LABEL[item.type]}</p>
        <h2 className="whitespace-pre-line text-xl font-bold leading-snug">{item.prompt}</h2>
      </div>

      {item.type === 'CHOICE2' && (
        <div className="grid grid-cols-2 gap-3" role="group">
          {item.choices.map((c) => {
            const photo = parsePhoto(c.image);
            return (
              <button key={c.key} type="button" disabled={locked} aria-pressed={pick === c.key} onClick={() => { touch(); setPick(c.key); }}
                className={`flex flex-col gap-2 rounded-card border-2 p-2 text-left ${tone(c.key, pick === c.key)}`}>
                <span className="text-xs font-bold text-sub">{c.key}</span>
                {photo ? <PhotoMock p={photo} /> : <span className="p-2 text-[15px]">{c.text}</span>}
              </button>
            );
          })}
        </div>
      )}

      {item.type === 'JUDGE' && (
        <div className="flex flex-col gap-2" role="group">
          {item.choices.map((c, i) => (
            <button key={c.key} type="button" disabled={locked} aria-pressed={pick === c.key} onClick={() => { touch(); setPick(c.key); }}
              className={`flex items-start gap-3 rounded-option border-2 px-4 py-3 text-left text-[15px] ${tone(c.key, pick === c.key)}`}>
              <span className="font-bold text-sub">{i + 1}</span><span>{c.text}</span>
            </button>
          ))}
        </div>
      )}

      {item.type === 'SPOT' && (
        <div className={item.media === 'view:grid' ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-2'} role="group">
          {item.hotspots.map((h) => {
            const on = marks.includes(h.partKey);
            const photo = parsePhoto(h.label);
            return (
              <button key={h.partKey} type="button" disabled={locked} aria-pressed={on}
                onClick={() => { touch(); setMarks((m) => (on ? m.filter((x) => x !== h.partKey) : [...m, h.partKey])); }}
                className={`rounded-option border-2 p-2 text-left text-[15px] ${tone(h.partKey, on)}`}>
                {photo ? <PhotoMock p={photo} /> : (
                  <>
                    {h.stars !== null && <span className="mr-2 text-achieve">{'★'.repeat(h.stars)}</span>}
                    <span>{h.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

      {item.type === 'REWRITE' && (
        <div className="flex flex-col gap-2">
          {item.context && <p className="rounded-option bg-soft p-3 text-[15px]">{item.context}</p>}
          <textarea value={text} disabled={locked} rows={5} maxLength={300} placeholder="사장님 답글을 직접 써 보세요" aria-label="답글 쓰기"
            onChange={(e) => { touch(); setText(e.target.value); }}
            className="rounded-option border border-line p-3 outline-none focus:border-accent" />
          <p className="text-xs text-sub">{text.length}/300 · 마코는 대신 써 주지 않고 채점만 해요</p>
        </div>
      )}

      {!graded && <Button onClick={submit} disabled={!ready || locked}>{submitting ? '채점 중…' : submitLabel}</Button>}
    </div>
  );
}

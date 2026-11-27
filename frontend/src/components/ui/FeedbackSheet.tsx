'use client';

import { useState } from 'react';
import type { ConceptCard, GradeOutput } from '@/lib/types/common';
import { Button } from './Button';

/**
 * 정답·이유·원리 카드 + "왜 틀렸어요?" (S9). 트레이닝·시험이 같이 쓴다.
 * onExplain은 누를 때만 AI를 부른다 (/items/{id}/explain). AI가 FALLBACK이어도 문장은 온다.
 */
export function FeedbackSheet({ correct, explanation, rubric, sampleAnswer, conceptCard, onExplain, onNext, nextLabel = '계속' }: {
  correct: boolean;
  explanation: string;
  rubric?: GradeOutput | null;
  sampleAnswer?: string | null;
  conceptCard?: ConceptCard | null;
  onExplain?: () => Promise<string>;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [more, setMore] = useState<'none' | 'card' | 'why'>('none');
  const [why, setWhy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askWhy = async () => {
    setMore('why');
    if (why || !onExplain) return;
    setLoading(true);
    try {
      setWhy(await onExplain());
    } catch {
      setWhy(explanation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="status" className={`flex flex-col gap-3 rounded-card p-4 ${correct ? 'bg-good-soft' : 'bg-bad-soft'}`}>
      <h3 className={`text-lg font-bold ${correct ? 'text-good' : 'text-bad'}`}>{correct ? '정답이에요' : rubric ? '조금만 고쳐 봐요' : '아쉬워요'}</h3>
      {rubric ? (
        <div className="text-[15px]">
          <ul className="mb-2 flex flex-wrap gap-2">
            {rubric.checks.map((c) => (
              <li key={c.key} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.ok ? 'bg-good text-bg' : 'bg-bg text-sub'}`}>{c.ok ? '✓' : '·'} {c.label}</li>
            ))}
          </ul>
          <p><b>잘한 점</b> {rubric.good}</p>
          {rubric.fix && <p><b>고칠 점</b> {rubric.fix}</p>}
        </div>
      ) : (
        <p className="text-[15px]">{explanation}</p>
      )}
      {rubric && !correct && sampleAnswer && <p className="rounded-option bg-bg p-3 text-sm text-body">예시: {sampleAnswer}</p>}
      <div className="flex gap-3 text-sm font-semibold text-accent">
        {conceptCard && <button type="button" onClick={() => setMore(more === 'card' ? 'none' : 'card')}>30초 원리 카드</button>}
        {!correct && onExplain && <button type="button" onClick={askWhy}>왜 틀렸어요?</button>}
      </div>
      {more === 'card' && conceptCard && (
        <div className="rounded-option bg-bg p-3 text-sm">
          <b>{conceptCard.title}</b>
          <p className="mt-1">{conceptCard.body}</p>
          {conceptCard.evidence && <p className="mt-1 text-xs text-sub">근거: {conceptCard.evidence}</p>}
        </div>
      )}
      {more === 'why' && (
        <div className="rounded-option bg-bg p-3 text-sm"><b>마코 코치</b><p className="mt-1">{loading ? '설명을 준비하고 있어요…' : why}</p></div>
      )}
      <Button variant={correct ? 'accent' : 'primary'} onClick={onNext}>{nextLabel}</Button>
    </div>
  );
}

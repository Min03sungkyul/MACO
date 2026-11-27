'use client';

import { useState } from 'react';
import { FeedbackSheet, QuestionCard, useXpToast } from '@/components/ui';
import { explainWrong, recordAttempt } from '@/lib/api/common';
import { gradeRewrite } from '@/lib/api/training';
import type { AttemptContext, AttemptResult, ConceptCard, GradeOutput, Item } from '@/lib/types/common';

/**
 * 문제 하나 풀기 → 서버 채점 → 피드백 (레슨·오답 노트·바쁜 날 복습이 같이 쓴다, 담당: 주승준).
 * 고쳐 쓰기는 /rewrite/grade(AI 채점) 점수로 /attempts 에 기록한다.
 * 이동성(시험)도 쓰므로 안정되면 components/ui로 옮길 후보.
 */
export function ItemStep({ item, context, sessionId, conceptCard, onDone, nextLabel }: {
  item: Item;
  context: AttemptContext;
  sessionId?: number | null;
  conceptCard?: ConceptCard | null;
  onDone: (r: AttemptResult) => void;
  nextLabel?: string;
}) {
  const { showXp } = useXpToast();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [rubric, setRubric] = useState<{ g: GradeOutput; sample: string | null } | null>(null);
  const [lastAnswer, setLastAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <QuestionCard item={item} graded={result ? { correct: result.correct, answer: result.answer } : null} submitting={busy}
        onSubmit={async (a) => {
          setBusy(true);
          setError(null);
          try {
            let score: number | undefined;
            if (item.type === 'REWRITE') {
              const g = await gradeRewrite(item.id, a.answerText ?? '');
              setRubric({ g: g.feedback, sample: g.sampleAnswer });
              score = g.feedback.score;
            }
            const r = await recordAttempt({ itemId: item.id, answer: a.answer, answerText: a.answerText, context, sessionId, elapsedMs: Math.round(a.elapsedMs), score });
            setLastAnswer(a.answer ?? '');
            setResult(r);
            showXp(r.xp);
          } catch (e) {
            setError(e instanceof Error ? e.message : '채점하지 못했어요');
          } finally {
            setBusy(false);
          }
        }} />
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      {result && (
        <FeedbackSheet correct={result.correct} explanation={result.explanation} rubric={rubric?.g} sampleAnswer={rubric?.sample}
          conceptCard={conceptCard} nextLabel={nextLabel}
          onExplain={item.type === 'REWRITE' ? undefined : async () => (await explainWrong(item.id, lastAnswer)).text}
          onNext={() => onDone(result)} />
      )}
      {result?.weakNote && <p className="rounded-option bg-accent-soft p-3 text-sm text-accent">{result.weakNote}</p>}
    </div>
  );
}

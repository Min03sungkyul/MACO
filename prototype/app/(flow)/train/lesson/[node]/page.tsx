'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { GoalRing, useTrain } from '@/components/train/common';
import { ItemPlayer } from '@/components/train/ItemPlayer';
import { TI } from '@/components/train/icons';
import { conceptOf, unitOf } from '@/lib/train/bank';
import {
  LESSON_SIZE, finishNode, nodeOpen, pickNext, record, skillLevel, streak, streakBonus, thetaOf,
} from '@/lib/train/engine';
import type { Item, Level, SkillId } from '@/lib/train/types';

/** S7 개념 카드 → S8 연습 문제 → S9 피드백 → S10 레슨 완료. 유닛 시험은 10문제, 80점 이상 통과. */
export default function Lesson() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { node } = useParams<{ node: string }>();
  const router = useRouter();
  const { t, setTrain, today } = useTrain();
  const [skill, lv] = node.split('-') as [SkillId, string];
  const level = (lv === 'test' ? 'test' : (Number(lv) as Level));
  const isTest = level === 'test';
  const size = isTest ? 10 : LESSON_SIZE;
  const unit = unitOf(skill);
  const concept = isTest ? null : conceptOf(skill, level as Level);

  const start = useRef({ theta: thetaOf(t, skill), streak: streak(t, today) });
  const [phase, setPhase] = useState<'card' | 'items' | 'done'>(concept ? 'card' : 'items');
  const [used, setUsed] = useState<string[]>([]);
  const [item, setItem] = useState<Item | null>(() => pickNext(t, skill, isTest ? 5 : (level as Level), [], today, isTest ? undefined : (level as Level)));
  const tally = useRef({ ok: 0, n: 0, xp: 0, notes: [] as string[] });
  const [result, setResult] = useState<{ acc: number; xp: number; before: number; after: number; notes: string[]; passed: boolean } | null>(null);

  if (!unit?.ready || !nodeOpen(t, skill, level)) {
    if (typeof window !== 'undefined') router.replace('/train');
    return null;
  }

  // State updates are computed from the latest store value (no side effects inside updaters).
  const answer = (ok: boolean, ms: number) => {
    if (!item) return;
    const r = record(t, item, ok, isTest ? 'unit' : 'lesson', today, ms);
    tally.current.n++; if (ok) tally.current.ok++; tally.current.xp += r.xp;
    if (r.weakNote) tally.current.notes.push(r.weakNote);
    setTrain(() => r.state);
  };
  const next = () => {
    const u = item ? [...used, item.id] : used;
    setUsed(u);
    const n = u.length >= size ? null : pickNext(t, skill, isTest ? 5 : (level as Level), u, today, isTest ? undefined : (level as Level));
    if (!n) return finish();
    setItem(n);
  };
  const finish = () => {
    const acc = tally.current.n ? Math.round((tally.current.ok / tally.current.n) * 100) : 0;
    const before = t.days[today]?.xp ?? 0;
    const n2 = streakBonus(finishNode(t, skill, level, acc, today), today);
    const bonus = (n2.days[today]?.xp ?? 0) - before;
    setTrain(() => n2);
    setResult({
      acc, xp: tally.current.xp + bonus, before: skillLevel(start.current.theta), after: skillLevel(thetaOf(n2, skill)),
      notes: tally.current.notes, passed: !isTest || acc >= 80,
    });
    setPhase('done');
  };

  if (phase === 'card' && concept) {
    return (
      <main className="t-lesson">
        <div className="t-ltop"><button type="button" onClick={() => router.push('/train')} aria-label="그만하기">{TI.close}</button><span className="t-where">{unit.title} · Lv.{level}</span></div>
        <div className="t-body t-concept">
          <div className="t-type">개념 카드</div>
          <h1 className="t-q">{concept.title}</h1>
          <p className="t-concept-body">{concept.body}</p>
          <p className="t-source">근거 · {concept.source}</p>
          <p className="t-can">이 레슨을 마치면: {unit.can[level as Level]}</p>
        </div>
        <div className="t-foot"><button type="button" className="btn accent" onClick={() => setPhase('items')}>연습 문제 {size}개 풀기</button></div>
      </main>
    );
  }

  if (phase === 'done' && result) {
    return (
      <main className="t-center fade">
        <div className="hero">
          <div className="t-done-ring"><GoalRing xp={t.days[today]?.xp ?? 0} goal={t.goal} size={96} /></div>
          <h1>{isTest ? (result.passed ? '유닛 시험 통과!' : '조금만 더 연습해요') : '레슨 완료!'}</h1>
          <p className="lead">{isTest ? `${result.acc}점 · 80점 이상이면 통과예요.` : `${unit.title} Lv.${level} 레슨을 마쳤어요.`}</p>
          <div className="t-tiles">
            <div className="t-tile xp"><span className="k">얻은 XP</span><b>+{result.xp}</b></div>
            <div className="t-tile acc"><span className="k">정답률</span><b>{result.acc}%</b></div>
            <div className="t-tile lv"><span className="k">{skill === 'photo' ? '사진' : '리뷰'} 레벨</span><b>Lv.{result.before}{result.after !== result.before ? ` → ${result.after}` : ''}</b></div>
          </div>
          {result.after > result.before && <p className="t-lvup">레벨이 올랐어요! {unit.can[(result.after >= 5 ? 5 : result.after >= 3 ? 3 : 1) as Level]}</p>}
          {result.notes.map((n) => <p key={n} className="t-weak">약점 리포트 · {n}</p>)}
        </div>
        <button type="button" className="btn" onClick={() => router.replace(streak(t, today) > start.current.streak ? '/streak?from=lesson' : '/train')}>계속</button>
      </main>
    );
  }

  if (!item) return null;
  const progress = used.length / size;
  return (
    <main className="t-lesson">
      <div className="t-ltop">
        <button type="button" onClick={() => router.push('/train')} aria-label="그만하기">{TI.close}</button>
        <div className="t-bar" role="progressbar" aria-valuenow={used.length} aria-valuemax={size}><i style={{ width: `${progress * 100}%` }} /></div>
        <span className="t-where">{isTest ? '유닛 시험' : `Lv.${level}`} {used.length + 1}/{size}</span>
      </div>
      <ItemPlayer key={item.id} item={item} onAnswer={(a) => answer(a.ok, a.ms)} onNext={next} />
    </main>
  );
}


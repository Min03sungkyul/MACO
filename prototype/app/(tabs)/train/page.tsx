'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { GoalRing, TopBar, useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { ERRORS, LEVELS, UNITS } from '@/lib/train/bank';
import { needsRestart, nodeId, nodeOpen, skillLevel, thetaOf, weakErrors } from '@/lib/train/engine';
import type { Level, SkillId } from '@/lib/train/types';

const OFFSET = [0, 44, 60, 44, 0, -44, -60, -44];
const COLORS: Record<string, [string, string]> = { 찾게: ['#6e4fe0', '#5236b8'], 믿게: ['#ff8a1f', '#cf6a0c'], 알리게: ['#13a58c', '#0c7d69'] };

/** S6 트레이닝 홈: 일일 목표 링 · 스트릭 · 오늘의 추천 레슨 · 유닛 경로 (3관문 순서) */
export default function Train() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, p, today, xpToday, streakNow, data } = useTrain();
  useEffect(() => { if (!data.signedUp || !p.onboarded) router.replace('/'); }, [data.signedUp, p.onboarded, router]);

  const weak = weakErrors(t).find((e) => (t.errs[e]?.streak ?? 0) >= 3);
  const rec = recommend(t);
  const min = Math.round((t.days[today]?.sec ?? 0) / 60);

  return (
    <main className="screen has-tabs t-screen">
      <TopBar />
      <section className="t-today">
        <GoalRing xp={xpToday} goal={t.goal} size={64} />
        <div>
          <b>{xpToday >= t.goal ? '오늘 목표를 채웠어요!' : `오늘 목표까지 ${t.goal - xpToday} XP`}</b>
          <span>오늘 {min}분 · {t.days[today]?.solved ?? 0}문제 · 연속 {streakNow}일</span>
        </div>
      </section>
      {needsRestart(t, today) && (
        <Link className="t-banner" href="/train/review"><b>오늘은 2분만 해 볼까요?</b><span>며칠 쉬었어도 괜찮아요. 한 문제로 다시 시작해요.</span></Link>
      )}
      {weak && (
        <div className="t-banner warn"><b>약점 리포트</b><span>&ldquo;{ERRORS[weak].name}&rdquo;을(를) 3번 연속 틀렸어요. 다음 레슨에 집중해서 넣을게요.</span></div>
      )}
      {rec && (
        <Link className="t-rec" href={`/train/lesson/${rec.id}`}>
          <span className="k">오늘의 추천 레슨</span><b>{rec.title}</b><span>{rec.sub}</span><em>시작하기</em>
        </Link>
      )}
      <Link className="t-busy" href="/train/review">{TI.flame}<span>바쁜 날엔 <b>2분 복습</b>만 해도 연속 기록이 이어져요</span></Link>

      {UNITS.map((u) => {
        const [c, cd] = COLORS[u.gate];
        const lv = u.ready ? skillLevel(thetaOf(t, u.skill)) : null;
        return (
          <section key={u.skill} className="t-unit" style={{ '--uc': c, '--ucd': cd } as React.CSSProperties} aria-label={`유닛 ${u.no} ${u.title}`}>
            <div className={`t-banner-unit ${u.ready ? '' : 'off'}`}>
              <div><span className="k">유닛 {u.no} · {u.gate} 관문</span><h2>{u.title}</h2><p>{u.ready ? `지금 Lv.${lv} · ${u.can[1]}` : '준비 중이에요. 문제 은행에 곧 추가돼요.'}</p></div>
            </div>
            {u.ready && <div className="t-path">
              {[...LEVELS, 'test' as const].map((lvl, i) => {
                const id = nodeId(u.skill, lvl);
                const done = t.nodes[id] !== undefined;
                const open = nodeOpen(t, u.skill, lvl);
                const cls = done ? 'done' : open ? 'now' : 'lock';
                const label = lvl === 'test' ? '유닛 시험' : `Lv.${lvl}`;
                const inner = (
                  <>
                    <span className={`t-node ${cls} ${lvl === 'test' ? 'test' : ''}`}>{lvl === 'test' ? TI.trophy : done ? TI.check : open ? TI.star : TI.lock}</span>
                    <span className="t-node-label"><b>{label}</b></span>
                  </>
                );
                return open || done ? (
                  <Link key={id} href={`/train/lesson/${id}`} className="t-node-row" style={{ marginLeft: `calc(50% - 36px + ${OFFSET[i % 8]}px)` }}>{inner}</Link>
                ) : (
                  <div key={id} className="t-node-row" style={{ marginLeft: `calc(50% - 36px + ${OFFSET[i % 8]}px)` }}>{inner}</div>
                );
              })}
            </div>}
          </section>
        );
      })}
    </main>
  );
}

/** 오늘의 추천: 약한 스킬의 다음 열린 레슨 */
function recommend(t: ReturnType<typeof useTrain>['t']) {
  const skills = (['photo', 'review'] as SkillId[]).sort((a, b) => thetaOf(t, a) - thetaOf(t, b));
  for (const s of skills) {
    for (const lvl of [...LEVELS, 'test' as const]) {
      if (nodeOpen(t, s, lvl) && t.nodes[nodeId(s, lvl)] === undefined) {
        const u = UNITS.find((x) => x.skill === s)!;
        return { id: nodeId(s, lvl), title: `${u.title} · ${lvl === 'test' ? '유닛 시험' : `Lv.${lvl}`}`, sub: lvl === 'test' ? '10문제 · 80점 이상이면 통과' : `${u.can[lvl]} · 약 6분` };
      }
    }
  }
  return null;
}

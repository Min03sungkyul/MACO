'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Avatar, WhenReady } from '@/components/ui';
import { TopBar, useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { UNITS } from '@/lib/train/bank';
import { GOALS, accuracy, bestStreak, skillLevel, thetaOf } from '@/lib/train/engine';
import { GATES } from '@/lib/train/gates';
import { learnerAccount, ownerAccount, skipFourWeeks } from '@/lib/train/demo';
import { shopName } from '@/lib/train/progress';

/** S25 성장 리포트·학습 기록 · S26 설정 (모드 전환, 공개 범위, 목표, 숨김 시연 도구) */
export default function Me() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { t, p, data, set, setTrain, setProg, reset, today, dates, total, streakNow, toast } = useTrain();
  const names = ['월', '화', '수', '목', '금', '토', '일'];
  const max = Math.max(t.goal, ...dates.map((d) => t.days[d]?.xp ?? 0));
  const minutes = Math.round(Object.values(t.days).reduce((a, d) => a + d.sec, 0) / 60);
  const badges = [
    { name: '첫 만점', ok: p.quizzes.some((q) => q.score === 100) },
    { name: '7일 연속', ok: bestStreak(t) >= 7 },
    { name: '첫 실전 미션', ok: Object.keys(p.missions).length > 0 },
    { name: '첫 상황극', ok: p.roleplays.length > 0 },
  ];
  const example = (who: 'learner' | 'owner') => {
    const a = who === 'learner' ? learnerAccount(today) : ownerAccount(today);
    set({ train: a.train, prog: { ...a.prog, dayOffset: p.dayOffset }, ownerName: a.ownerName });
    toast(`${who === 'learner' ? '입문자' : '사장님'} 예시 계정을 불러왔어요`);
  };
  const fourWeeks = () => {
    const r = skipFourWeeks(t, p, today);
    set({ train: r.train, prog: r.prog });
    toast('4주를 넘겼어요');
    router.push('/me');
  };

  return (
    <main className="screen has-tabs t-screen">
      <TopBar />
      <div className="t-prof"><Avatar size={56} /><div><b>{data.ownerName ?? shopName(p)}</b><span>{p.mode === 'shop' ? `내 가게 모드 · ${shopName(p)}` : `학습 모드 · ${shopName(p)}`}</span></div></div>

      <section className="t-card">
        <div className="t-row"><b>학습 기록</b><span className="t-muted">이번 주</span></div>
        <div className="t-bars" role="img" aria-label="요일별 XP">
          {dates.map((d, i) => { const v = t.days[d]?.xp ?? 0; return <div key={d}><b>{v || ''}</b><i className={v >= t.goal ? 'on' : v ? 'part' : ''} style={{ height: `${(v / max) * 100}%` }} /><span className={d === today ? 'today' : ''}>{names[i]}</span></div>; })}
        </div>
        <div className="t-stat3">
          <div><span className="k">총 XP</span><b>{total}</b></div>
          <div><span className="k">트레이닝</span><b>{minutes}<small>분</small></b></div>
          <div><span className="k">정답률</span><b>{accuracy(t)}<small>%</small></b></div>
        </div>
      </section>

      <section className="t-card">
        <div className="t-row"><b>스킬 맵</b><span className="t-muted">연속 {streakNow}일 · 최고 {bestStreak(t)}일</span></div>
        <ul className="t-skills">
          {UNITS.map((u) => {
            const lv = u.ready ? skillLevel(thetaOf(t, u.skill)) : 0;
            return <li key={u.skill} className={u.ready ? '' : 'off'}><span>{u.title}</span><div className="lv">{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= lv ? 'on' : ''} />)}</div><b>{u.ready ? `Lv.${lv}` : '준비 중'}</b></li>;
          })}
        </ul>
      </section>

      {p.gateChecks.length > 0 && (
        <section className="t-card">
          <div className="t-row"><b>관문 점수 변화</b><span className="t-muted">비포 → 애프터</span></div>
          <ul className="t-gatehist">
            {GATES.map((g) => {
              const first = p.gateChecks[0].scores[g], last = p.gateChecks[p.gateChecks.length - 1].scores[g];
              return <li key={g}><span>{g}</span><b>{first}{p.gateChecks.length > 1 ? ` → ${last}` : ''}</b>{last > first && <em>+{last - first}</em>}</li>;
            })}
          </ul>
        </section>
      )}

      <section className="t-card">
        <div className="t-row"><b>배지</b></div>
        <div className="t-badges">{badges.map((b) => <span key={b.name} className={b.ok ? 'on' : ''}>{b.ok ? TI.star : TI.lock}{b.name}</span>)}</div>
      </section>

      <div className="grp"><h4>설정</h4>
        <button className="row" type="button" onClick={() => setProg({ mode: p.mode === 'shop' ? 'learn' : 'shop', practice: p.practice ?? 'cafe' })}>모드 전환<em>{p.mode === 'shop' ? '내 가게 → 학습' : '학습 → 내 가게'}</em></button>
        <button className="row" type="button" onClick={() => { const i = GOALS.findIndex((g) => g.xp === t.goal); setTrain((s) => ({ ...s, goal: GOALS[(i + 1) % GOALS.length].xp })); }}>하루 목표<em>{GOALS.find((g) => g.xp === t.goal)?.label} · {t.goal} XP</em></button>
        <button className="row" type="button" onClick={() => setProg({ privacy: p.privacy === 'all' ? 'friends' : p.privacy === 'friends' ? 'none' : 'all' })}>랭킹 공개 범위<em>{{ all: '전체', friends: '친구만', none: '비공개' }[p.privacy]}</em></button>
        <button className="row" type="button" onClick={() => setProg({ leagueOn: !p.leagueOn })}>리그 참여<em>{p.leagueOn ? '켜짐' : '꺼짐'}</em></button>
        <Link className="row" href="/report">게시 루틴 주간 리포트<em>BCT 실전 루프</em></Link>
        <button className="row quiet" type="button" onClick={() => { reset(); signOut({ redirectTo: '/' }); }}>로그아웃 · 이 기기의 기록 지우기<em /></button>
      </div>

      <details className="t-demo-tools">
        <summary>시연 도구</summary>
        <div className="grp">
          <button className="row" type="button" onClick={() => setProg({ dayOffset: p.dayOffset + 1 })}>날짜 하루 넘기기<em>{today}</em></button>
          <button className="row" type="button" onClick={fourWeeks}>4주 넘기기<em>스트릭 28일 · 다시 캡처</em></button>
          <button className="row" type="button" onClick={() => example('learner')}>예시 계정 · 입문자<em>학습 모드</em></button>
          <button className="row" type="button" onClick={() => example('owner')}>예시 계정 · 사장님<em>내 가게 모드</em></button>
          <button className="row quiet" type="button" onClick={() => setProg({ dayOffset: 0 })}>오늘 날짜로 되돌리기<em /></button>
        </div>
      </details>
    </main>
  );
}

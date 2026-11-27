'use client';

import { useState } from 'react';
import { Avatar, WhenReady } from '@/components/ui';
import { TopBar, useTrain } from '@/components/train/common';
import { DEMOTE, GROUP, PROMOTE, TIERS, leagueTable, regionRank } from '@/lib/train/league';
import { goalMet, weekXp } from '@/lib/train/engine';
import { shopName } from '@/lib/train/progress';

/** S22 주간 리그 · S23 지역 랭킹 (G1·G2). 다른 사용자는 시연용 예시 데이터예요. */
export default function Rank() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { t, p, dates, todayIndex } = useTrain();
  const [tab, setTab] = useState<'league' | 'region'>('league');
  const me = p.privacy === 'none' ? '나' : shopName(p);
  const mine = weekXp(t, dates);
  const joined = dates.some((d) => goalMet(t, d));
  const daysLeft = 7 - todayIndex;

  return (
    <main className="screen has-tabs t-screen">
      <TopBar />
      <div className="t-seg" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'league'} onClick={() => setTab('league')}>주간 리그</button>
        <button type="button" role="tab" aria-selected={tab === 'region'} onClick={() => setTab('region')}>지역 랭킹</button>
      </div>
      {!p.leagueOn ? (
        <p className="t-empty">랭킹을 꺼 두셨어요. 내 정보 → 설정에서 다시 켤 수 있어요.</p>
      ) : tab === 'league' ? (
        joined ? <League rows={leagueTable(dates[0], todayIndex, mine, me)} daysLeft={daysLeft} /> : (
          <p className="t-empty">이번 주 일일 목표를 한 번 채우면 리그에 참가해요. 비슷한 XP 수준의 {GROUP}명과 겨뤄요.</p>
        )
      ) : (
        <Region data={regionRank(p.region, dates[0], todayIndex, mine, me)} region={p.region} />
      )}
      <p className="t-note">다른 가게 순위는 시연용 예시예요. 하위권 전체는 공개하지 않고, 랭킹은 끌 수 있어요.</p>
    </main>
  );
}

function League({ rows, daysLeft }: { rows: ReturnType<typeof leagueTable>; daysLeft: number }) {
  return (
    <>
      <div className="t-league-head"><span className="tier">{TIERS[0]} 리그</span><p>상위 {PROMOTE}곳 승급 · 하위 {DEMOTE}곳 강등 · {daysLeft}일 남음 (매주 월요일 초기화)</p></div>
      <ol className="t-rank">
        {rows.map((r, i) => (
          <li key={r.name}>
            {i === PROMOTE && <div className="t-zone up">↑ 승급</div>}
            {i === rows.length - DEMOTE && <div className="t-zone down">↓ 강등</div>}
            <Row rank={i + 1} name={r.name} xp={r.xp} me={r.me} />
          </li>
        ))}
      </ol>
    </>
  );
}

function Region({ data, region }: { data: ReturnType<typeof regionRank>; region: string }) {
  return (
    <>
      <div className="t-region"><b>{region} {data.rank}위</b><span>/ {data.total}명 · 상위 {data.top}%</span></div>
      <h2 className="t-h2">상위 10명</h2>
      <ol className="t-rank">{data.top10.map((r) => <li key={r.name + r.rank}><Row rank={r.rank} name={r.name} xp={r.xp} me={r.me} /></li>)}</ol>
      {data.rank > 10 && (
        <>
          <h2 className="t-h2">내 앞뒤</h2>
          <ol className="t-rank">{data.around.map((r) => <li key={r.name + r.rank}><Row rank={r.rank} name={r.name} xp={r.xp} me={r.me} /></li>)}</ol>
        </>
      )}
    </>
  );
}

function Row({ rank, name, xp, me }: { rank: number; name: string; xp: number; me: boolean }) {
  return (
    <div className={`t-rrow ${me ? 'me' : ''} ${rank <= 3 ? 'podium' : ''}`}>
      <span className="rk">{rank}</span>
      <span className="av">{me ? <Avatar size={36} /> : name[0]}</span>
      <b>{name}{me ? ' (나)' : ''}</b>
      <span className="xp">{xp} XP</span>
    </div>
  );
}

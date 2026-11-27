'use client';

import Link from 'next/link';
import { WeekStrip, WhenReady } from '@/components/ui';
import { useStore, formatDate } from '@/lib/store';

/** R 루틴 탭: the whole week with each task's state. */
export default function Routine() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { rows, dates, todayIndex, data, todayRow } = useStore();
  const doneCount = rows.filter((r) => r.record?.status === 'done').length;
  return (
    <main className="screen has-tabs fade">
      <div className="eyebrow" style={{ marginTop: 6 }}>루틴 · {data.week}주차</div>
      <h1 className="title">이번 주 할 일 {rows.length}개</h1>
      <p className="body-text">{formatDate(dates[0])} – {formatDate(dates[6])} · {doneCount}개 완료</p>
      {todayRow && (
        <Link className="lx-today" href="/today">
          <div><strong>오늘 할 일 · {todayRow.title}</strong><span>{todayRow.record ? '오늘 기록을 남겼어요' : `${todayRow.slot} · ${todayRow.minutes}분`}</span></div>
          <em>{todayRow.record ? '보기' : '지금 하기'}</em>
        </Link>
      )}
      <WeekStrip rows={rows} dates={dates} todayIndex={todayIndex} />
      <ul className="rl">
        {rows.map((r) => {
          const st = r.record?.status;
          const pill = st === 'done' ? <span className="pill ok">완료 · {r.record?.minutes}분</span>
            : st === 'rest' ? <span className="pill">쉬어 감</span>
            : r.isToday ? <span className="pill now">오늘</span>
            : r.past ? <span className="pill">기록 없음</span>
            : <span className="pill">예정</span>;
          return (
            <li key={r.day}>
              <div className="d">{r.day}<small>{r.slot}</small></div>
              <div><strong>{r.title}</strong><span className="m">{r.minutes}분</span></div>
              {pill}
            </li>
          );
        })}
      </ul>
      <div className="h4">바쁜 날 대체 과제<small>할 일 대신 이것만 해도 이번 주 기록이 이어져요</small></div>
      <ul className="alt">
        <li>예전 사진 다시 올리기<span>3분</span></li>
        <li>오늘 영업 시간 한 줄 공지<span>2분</span></li>
      </ul>
      <div className="h4">지난 기록</div>
      <div className="empty">{data.week === 1 ? '첫 주예요. 이번 주가 끝나면 여기에 쌓여요.' : '지난 주 기록 보기는 다음 버전에서 열려요.'}</div>
    </main>
  );
}

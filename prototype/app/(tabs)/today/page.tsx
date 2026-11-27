'use client';

import { useRouter } from 'next/navigation';
import { CoachLine, Logo, WeekStrip, WhenReady } from '@/components/ui';
import { useStore, formatDate } from '@/lib/store';
import type { WeekRow } from '@/lib/maco';

/** E 오늘: the one task for today, with busy-day, done and rest states. */
export default function Today() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { rows, dates, todayIndex, today, todayRow, nextRow, analysis: a, session, setSession } = useStore();
  const rec = todayRow?.record;
  const done = rec?.status === 'done', rest = rec?.status === 'rest';
  const doneCount = rows.filter((r) => r.record?.status === 'done').length;
  const weekday = ['월', '화', '수', '목', '금', '토', '일'][todayIndex];

  const start = (row: WeekRow, busy: boolean) => {
    setSession({ target: row.date, busy, photo: null, caption: null, fromAlbum: busy, startedAt: Date.now() });
    router.push(busy ? '/post' : '/shoot');
  };

  let title = '사장님, 오늘은\n이것 하나만 해요';
  let card: React.ReactNode;
  let coach = '첫 게시물은 완벽하지 않아도 돼요. 올리는 것 자체가 목표예요.';

  if (todayRow && done) {
    title = '오늘 할 일,\n끝냈어요';
    coach = '잘했어요! 다음 알림 때 또 같이 해요.';
    card = (
      <div className="card done">
        <div className="okmark" />
        <h3>오늘 할 일 끝!</h3>
        <p>{rec?.minutes}분 걸렸어요{nextRow ? ` · ${nextRow.day}요일에 또 만나요` : ''}</p>
      </div>
    );
  } else if (todayRow && rest) {
    title = '오늘은\n쉬어 갔어요';
    coach = '한 번 쉬어도 괜찮아요. 다시 시작하는 게 진짜 습관이에요.';
    card = (
      <div className="card rest">
        <h3>오늘은 쉬어 갔어요</h3>
        <p>{nextRow ? `${nextRow.day}요일에 다시 해 봐요.` : '다음 주에 다시 해 봐요.'}<br />고른 이유는 다음 주 루틴에 반영할게요.</p>
      </div>
    );
  } else if (todayRow && session.busy) {
    coach = '괜찮아요. 바쁜 날도 끊기지 않는 게 더 중요해요.';
    card = (
      <div className="card">
        <div className="meta"><span className="tag">바쁜 날 버전</span><span>3분</span></div>
        <h3>예전 사진 다시 올리기</h3>
        <ol><li>앨범에서 반응 좋았던 사진 하나 고르기</li><li>{a.channel}에 다시 올리고 문구 한 줄만 바꾸기</li></ol>
        <button className="btn" type="button" onClick={() => start(todayRow, true)}>지금 하기</button>
        <button className="link swap" type="button" onClick={() => setSession({ busy: false })}>원래 할 일로 돌아가기</button>
      </div>
    );
  } else if (todayRow) {
    card = (
      <div className="card">
        <div className="meta"><span>오늘 할 일</span><span>·</span><span>{todayRow.slot} · {todayRow.minutes}분</span></div>
        <h3>{todayRow.title}</h3>
        <p className="purpose">목적: {todayRow.purpose}</p>
        <ol><li>밝은 창가에 두고 위에서 한 장 찍기</li><li>{a.channel}에 사진 올리기</li><li>가게 이름과 한 줄 소개 쓰기</li></ol>
        <button className="btn" type="button" onClick={() => start(todayRow, false)}>지금 하기</button>
        <button className="link swap" type="button" onClick={() => setSession({ busy: true })}>바쁜 날이에요 · <b>3분짜리로 바꾸기</b></button>
      </div>
    );
  } else {
    title = '오늘은\n루틴이 없는 날이에요';
    coach = nextRow ? `${nextRow.day}요일 ${nextRow.slot}에 알려 드릴게요.` : '이번 주 루틴을 모두 지나왔어요. 일요일에 리포트를 확인해 보세요.';
    card = nextRow ? (
      <div className="card off">
        <h3>다음 할 일 · {nextRow.day}요일</h3>
        <p>{nextRow.title}</p>
        <button className="link" type="button" onClick={() => start(nextRow, false)}><b>미리 해 두기</b></button>
      </div>
    ) : (
      <div className="card off"><h3>이번 주 할 일을 모두 지나왔어요</h3><p>리포트 탭에서 한 주를 돌아봐요.</p></div>
    );
  }

  return (
    <main className="screen has-tabs fade">
      <div className="top-row">
        <Logo />
        <svg className="bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
      </div>
      <div className="eyebrow" style={{ marginTop: 26 }}>{formatDate(today)} {weekday}요일</div>
      <h1 className="title">{title}</h1>
      <p className="body-text" style={{ marginTop: 6 }}>이번 주 {doneCount}/{rows.length}</p>
      <WeekStrip rows={rows} dates={dates} todayIndex={todayIndex} />
      {card}
      <CoachLine>{coach}</CoachLine>
      {todayRow && nextRow && (
        <div className="next"><b>다음</b><span>{nextRow.day} {nextRow.slot} · {nextRow.title}</span></div>
      )}
    </main>
  );
}

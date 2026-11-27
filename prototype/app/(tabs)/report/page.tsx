'use client';

import Link from 'next/link';
import { CoachLine, WhenReady } from '@/components/ui';
import { useStore } from '@/lib/store';

/** I 주간 리포트: behaviour first (rate, done/rest), customer reactions only as a reference trend. */
export default function Report() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const { rows, rec, data } = useStore();
  const done = rows.filter((r) => r.record?.status === 'done');
  const total = done.reduce((s, r) => s + (r.record?.minutes ?? 0), 0);
  const rested = rows.filter((r) => r.record?.status === 'rest');
  const likes = rows.reduce((s, r) => s + (r.record?.likes ?? 0), 0);
  const inq = rows.reduce((s, r) => s + (r.record?.inquiries ?? 0), 0);
  const miss = rested[0];
  const wk = data.week;

  return (
    <main className="screen has-tabs fade">
      <div className="eyebrow" style={{ marginTop: 6 }}>주간 리포트 · {wk}주차</div>
      <h1 className="title">이번 주,{'\n'}{rows.length}번 중 {done.length}번 해냈어요</h1>
      <div className="big"><b>{rec.rate}</b><span>%</span><small>지금까지 달성률</small></div>
      <div className="seg">{rows.map((r) => <i key={r.day} className={r.record?.status === 'done' ? 'on' : ''} />)}</div>
      <ul className="wl">
        {rows.map((r) => (
          <li key={r.day}>
            <span className="d">{r.day}</span>
            <div><strong>{r.title}</strong>{r.record?.status === 'rest' && <small>{r.record.reason}</small>}</div>
            {r.record?.status === 'done' ? <span className="st"><i />{r.record.minutes}분</span>
              : r.record?.status === 'rest' ? <span className="st off">쉬어 감</span>
              : <span className="st off">{r.past ? '기록 없음' : r.isToday ? '오늘' : '예정'}</span>}
          </li>
        ))}
      </ul>
      <div className="trio">
        <div><b>{done.length}<small>건</small></b><span>게시</span></div>
        <div><b>{total}<small>분</small></b><span>걸린 시간</span></div>
        <div><b>{rested.length}<small>번</small></b><span>쉬어 간 날</span></div>
      </div>
      <div className="trend">
        <div className="k">손님 반응 <span className="tag">참고용</span></div>
        <svg viewBox="0 0 342 96" role="img" aria-label={`${wk}주차 좋아요 ${likes}, 문의 ${inq}`}>
          <line x1="14" y1="56" x2="328" y2="56" stroke="#EBEBEB" strokeDasharray="3 4" />
          {[1, 2, 3, 4].map((w, i) => (
            <text key={w} x={30 + i * 94} y="90" textAnchor="middle" fontSize="12" fill="#767676" fontFamily="var(--font-num)">{w}주</text>
          ))}
          <circle cx={30 + ((wk - 1) % 4) * 94} cy="56" r="6" fill="#6E4FE0" />
          <text x={Math.min(44 + ((wk - 1) % 4) * 94, 230)} y="38" fontSize="13" fill="#111" fontWeight="600">좋아요 {likes} · 문의 {inq}</text>
        </svg>
        <p>4주가 쌓이면 흐름을 보여 드려요. 다음 주 난이도는 반응이 아니라 사장님이 해낸 횟수로만 정해요.</p>
      </div>
      <CoachLine>
        {miss ? `${miss.day}요일엔 "${miss.record?.reason}" 때문에 쉬어 갔어요. 다음 주엔 그날 과제를 5분짜리로 줄여 볼까요?`
          : done.length ? '아직 한 번도 안 빠졌어요! 이대로 이어 가요.' : '이번 주 첫 기록이 쌓이면 여기에 정리해 드려요.'}
      </CoachLine>
      <Link className="btn" href="/next-week" style={{ marginTop: 22 }}>다음 주 루틴 정하기</Link>
    </main>
  );
}

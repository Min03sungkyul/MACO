'use client';

import { Chips } from '@/components/ui';
import { DAY_NAMES, type Task } from '@/lib/maco';
import { useStore } from '@/lib/store';

export const ALARMS = ['문 연 직후', '점심 장사 후', '마감 후'];

/** ② 처방 screen body, used for week 1 (D) and for the re-prescribed next week (D2). */
export function PlanView({ eyebrow, lead, tasks, firstDay, cta, onCta }: {
  eyebrow: string; lead: string; tasks: Task[]; firstDay: Date; cta: string; onCta: () => void;
}) {
  const { analysis: a, data, set } = useStore();
  return (
    <main className="screen fade">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="title">{lead}{'\n'}{tasks.length}번만 올리면 돼요</h1>
      <p className="body-text">{a.channel}에 {a.kind} · 한 번에 15분 안쪽</p>
      <div className="week">
        {DAY_NAMES.map((d, i) => {
          const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + i).getDate();
          return <span key={d} className={tasks.some((t) => t.day === d) ? 'on' : ''}><i>{date}</i>{d}</span>;
        })}
      </div>
      <ul className="tasks">
        {tasks.map((t) => (
          <li key={t.day}>
            <div className="d">{t.day}<small>{t.slot}</small></div>
            <div><strong>{t.title}</strong><span>{t.minutes}분</span></div>
          </li>
        ))}
      </ul>
      <div className="busy"><span>바쁜 날엔</span><span><b>예전 사진 다시 올리기</b>로 바꿔도 돼요. 3분이면 끝나요.</span></div>
      <div className="alarm">
        <div className="k">알림은 언제 드릴까요?</div>
        <Chips label="알림 시간" items={ALARMS} value={data.alarm} onChange={(i) => set({ alarm: i as 0 | 1 | 2 })} />
      </div>
      <div className="bottom"><button className="btn" type="button" onClick={onCta}>{cta}</button></div>
    </main>
  );
}

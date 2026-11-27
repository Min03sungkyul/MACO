'use client';

import { DAY_NAMES, SLOT_NAMES, busyCellOf } from '@/lib/maco';

/** 7 days × 3 times. Tap a cell to mark it hard; tap the day name to mark the whole day. */
export function BusyPicker({ value, onChange }: { value: number[]; onChange: (cells: number[]) => void }) {
  const has = (c: number) => value.includes(c);
  const toggle = (c: number) => onChange(has(c) ? value.filter((x) => x !== c) : [...value, c].sort((a, b) => a - b));
  const toggleDay = (d: number) => {
    const cells = SLOT_NAMES.map((_, s) => busyCellOf(d, s));
    const all = cells.every(has);
    onChange(all ? value.filter((x) => !cells.includes(x)) : [...new Set([...value, ...cells])].sort((a, b) => a - b));
  };

  return (
    <div className="busy-grid" role="group" aria-label="할 일 하기 어려운 시간">
      <span />
      {SLOT_NAMES.map((s) => <span key={s} className="bh">{s}</span>)}
      {DAY_NAMES.map((d, di) => (
        <div key={d} className="br">
          <button type="button" className="bd" onClick={() => toggleDay(di)} aria-label={`${d}요일 전체`}>{d}</button>
          {SLOT_NAMES.map((s, si) => {
            const c = busyCellOf(di, si);
            return (
              <button key={s} type="button" className="bc" aria-pressed={has(c)} aria-label={`${d}요일 ${s}`} onClick={() => toggle(c)}>
                {has(c) ? '바빠요' : ''}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

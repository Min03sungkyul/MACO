import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'good' | 'bad' | 'achieve';
const TONE: Record<Tone, string> = {
  neutral: 'bg-soft text-body',
  accent: 'bg-accent-soft text-accent',
  good: 'bg-good-soft text-good',
  bad: 'bg-bad-soft text-bad',
  achieve: 'bg-achieve text-bg',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]}`}>{children}</span>;
}

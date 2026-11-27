import type { ReactNode } from 'react';

export function Card({ children, className = '', as: Tag = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'li' }) {
  return <Tag className={`rounded-card border border-line bg-bg p-4 ${className}`}>{children}</Tag>;
}

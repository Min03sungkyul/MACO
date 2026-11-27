import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

const STYLE: Record<Variant, string> = {
  primary: 'bg-ink text-bg disabled:bg-off',
  accent: 'bg-accent text-bg disabled:bg-off',
  secondary: 'border border-line bg-bg text-ink disabled:text-off',
  ghost: 'bg-transparent text-sub',
  danger: 'bg-bad text-bg',
};

export function buttonClass(variant: Variant = 'primary', full = true) {
  return `${full ? 'w-full' : ''} inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-button px-5 text-base font-semibold transition active:scale-[.98] ${STYLE[variant]}`;
}

/** 기본 버튼. 한 화면에 accent는 한 곳만 (디자인 원칙) */
export function Button({ variant = 'primary', full = true, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  return <button type="button" className={`${buttonClass(variant, full)} ${className}`} {...props} />;
}

export function LinkButton({ href, variant = 'primary', full = true, children }: { href: string; variant?: Variant; full?: boolean; children: ReactNode }) {
  return <Link href={href} className={buttonClass(variant, full)}>{children}</Link>;
}

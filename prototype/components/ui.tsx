'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export const AVATAR = '/maco-avatar.jpg';

/** MACO wordmark, drawn with currentColor so it works on black and white. */
export function Logo({ className = 'logo' }: { className?: string }) {
  return (
    <svg className={className} viewBox="185 205 1580 390" fill="none" stroke="currentColor" role="img" aria-label="MACO">
      <defs><clipPath id="maco-clip"><rect x="180" y="200" width="830" height="373" /></clipPath></defs>
      <g clipPath="url(#maco-clip)" strokeWidth="80" strokeLinejoin="round">
        <path d="M230 600V258L398 438L567 258V600" />
        <path d="M648 600L820 255L992 600" />
      </g>
      <path d="M1308 295A149 149 0 1 0 1308 505" strokeWidth="82" />
      <ellipse cx="1557" cy="400" rx="159" ry="149" strokeWidth="82" />
    </svg>
  );
}

export function Avatar({ size, alt = '' }: { size: number; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="avatar" src={AVATAR} alt={alt} width={size} height={size} />;
}

export function BackButton({ onClick, href, label = '뒤로', icon = 'back' }: { onClick?: () => void; href?: string; label?: string; icon?: 'back' | 'close' }) {
  const router = useRouter();
  const path = icon === 'close' ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M15 5l-7 7 7 7" />;
  return (
    <button className="back" type="button" aria-label={label} onClick={onClick ?? (() => (href ? router.push(href) : router.back()))}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
    </button>
  );
}

export function TopBar({ title, step, onBack, backHref, close }: { title: string; step?: string; onBack?: () => void; backHref?: string; close?: boolean }) {
  return (
    <div className="bar3">
      <BackButton onClick={onBack} href={backHref} icon={close ? 'close' : 'back'} label={close ? '닫기' : '뒤로'} />
      <span>{title}</span>
      <span className="n">{step}</span>
    </div>
  );
}

export function Option({ pressed, onClick, label, sub, check = true }: { pressed: boolean; onClick: () => void; label: React.ReactNode; sub?: string; check?: boolean }) {
  return (
    <button className="opt" type="button" aria-pressed={pressed} onClick={onClick}>
      <div><strong>{label}</strong>{sub && <span>{sub}</span>}</div>
      {check && <i className="ck" />}
    </button>
  );
}

export function Chips({ items, value, onChange, label }: { items: string[]; value: number; onChange: (i: number) => void; label: string }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {items.map((t, i) => (
        <button key={t} className="chip" type="button" aria-pressed={i === value} onClick={() => onChange(i)}>{t}</button>
      ))}
    </div>
  );
}

export function CoachLine({ children }: { children: React.ReactNode }) {
  return <div className="coachline"><Avatar size={32} /><p>{children}</p></div>;
}

export const TABS = [
  { href: '/train', label: '트레이닝', icon: <><path d="M4 19V6.5A1.5 1.5 0 0 1 5.5 5H11v14" /><path d="M20 19V6.5A1.5 1.5 0 0 0 18.5 5H13v14" /></> },
  { href: '/test', label: '시험', also: ['/test/quiz', '/test/notes', '/test/roleplay'], icon: <><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" /></> },
  { href: '/shop', label: '내 가게', icon: <><path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M5.5 9.5V20h13V9.5M10 20v-5h4v5" strokeLinejoin="round" /></> },
  { href: '/rank', label: '랭킹', icon: <><path d="M8 20V11M12 20V5M16 20v-6" /></> },
  { href: '/me', label: '내 정보', icon: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5" /></> },
];

export function TabBar() {
  const pathname = usePathname();
  const { data } = useStore();
  return (
    <nav className="tabbar" aria-label="하단 탭">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={pathname === t.href || ('also' in t && t.also?.includes(pathname)) ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">{t.icon}</svg>
          {t.href === '/shop' && data.prog.mode === 'learn' ? '연습 가게' : t.label}
        </Link>
      ))}
    </nav>
  );
}

export function Toast() {
  const { toastMsg } = useStore();
  return toastMsg ? <div className="toast" role="status">{toastMsg}</div> : null;
}

/** Renders nothing until saved data has loaded, so screens never flash empty values. */
export function WhenReady({ children }: { children: React.ReactNode }) {
  const { ready } = useStore();
  return ready ? <>{children}</> : null;
}

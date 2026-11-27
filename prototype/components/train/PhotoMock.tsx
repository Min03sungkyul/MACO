import type { Photo } from '@/lib/train/types';

/**
 * 연습용 가짜 사진. 같은 그림에 밝기·흔들림·크기·배경만 바꿔서
 * "어느 쪽이 나은가"를 눈으로 비교하게 해요. (실제 사진은 내 가게 미션에서 올려요)
 */
export function PhotoMock({ p, className = '' }: { p: Photo; className?: string }) {
  const filters = [
    p.light === 'dark' ? 'brightness(.42) contrast(.9)' : p.light === 'over' ? 'brightness(1.65) saturate(.45) contrast(.8)' : '',
    p.blur ? 'blur(2.6px)' : '',
    p.filter ? 'hue-rotate(110deg) saturate(2.6)' : '',
  ].filter(Boolean).join(' ');
  const scale = p.size === 'small' ? 0.42 : p.size === 'big' ? 1.18 : 1;
  const dx = p.crop ? 30 : 0;
  return (
    <div className={`t-photo ${className}`} style={{ filter: filters || undefined }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <rect width="100" height="100" fill={p.s === 'shop' ? '#cfe3f2' : '#ead9c4'} />
        {p.s !== 'shop' && <rect y="62" width="100" height="38" fill="#dcc6ab" />}
        {p.clutter && (
          <g opacity=".95">
            <rect x="4" y="10" width="16" height="22" rx="3" fill="#9aa7b4" />
            <rect x="78" y="8" width="18" height="12" rx="2" fill="#f4f1ea" />
            <path d="M70 70q10-8 24 0v10H70Z" fill="#fff" />
            <circle cx="14" cy="82" r="8" fill="#c95b4a" />
            <path d="M84 30c-8 10 6 18-4 30" stroke="#333" strokeWidth="1.2" fill="none" />
          </g>
        )}
        <g transform={`translate(${50 + dx} 55) rotate(${p.tilt ?? 0}) scale(${scale}) translate(-50 -55)`}>
          <Subject s={p.s} />
        </g>
      </svg>
      {p.label && <span className="t-photo-label">{p.label}</span>}
    </div>
  );
}

function Subject({ s }: { s: Photo['s'] }) {
  switch (s) {
    case 'latte':
      return (
        <g>
          <ellipse cx="50" cy="70" rx="32" ry="9" fill="#f6f2ec" />
          <path d="M28 44h44l-4 26H32Z" fill="#fbfaf7" />
          <path d="M72 50q10 2 8 10t-10 6" stroke="#fbfaf7" strokeWidth="4" fill="none" />
          <ellipse cx="50" cy="44" rx="22" ry="6.5" fill="#b07a4a" />
          <path d="M50 47c-4-5-10-2-6 2l6 4 6-4c4-4-2-7-6-2Z" fill="#f4e6d2" />
        </g>
      );
    case 'cake':
      return (
        <g>
          <ellipse cx="50" cy="72" rx="34" ry="9" fill="#f6f2ec" />
          <path d="M26 66 50 36l26 30Z" fill="#f7e4c8" />
          <path d="M26 66h50v6H26Z" fill="#e9c99e" />
          <path d="M33 58h36" stroke="#f08aa0" strokeWidth="4" />
          <circle cx="51" cy="35" r="6" fill="#e2384f" />
          <path d="M51 29l2-4" stroke="#3c8c3c" strokeWidth="2" />
        </g>
      );
    case 'bread':
      return (
        <g>
          <ellipse cx="50" cy="72" rx="34" ry="8" fill="#f6f2ec" />
          <path d="M24 64c6-22 46-22 52 0-8-6-14-4-18 0-4-6-12-6-16 0-6-4-12-6-18 0Z" fill="#d99a4e" />
          <path d="M36 52c4 4 4 10 2 14M50 48c2 6 2 12 0 18M64 52c-4 4-4 10-2 14" stroke="#b5732e" strokeWidth="2" fill="none" />
        </g>
      );
    case 'shop':
      return (
        <g>
          <rect x="14" y="30" width="72" height="56" fill="#fff" stroke="#222" strokeWidth="1.5" />
          <path d="M12 22h76v12H12Z" fill="#222" />
          <path d="M12 34h76" stroke="#fff" strokeDasharray="6 6" strokeWidth="12" opacity=".9" />
          <rect x="22" y="48" width="22" height="20" fill="#ffd17a" stroke="#222" />
          <rect x="54" y="46" width="22" height="40" fill="#e4dcf7" stroke="#222" />
          <rect x="34" y="38" width="32" height="7" rx="2" fill="#fff" stroke="#222" />
        </g>
      );
    case 'menu':
      return (
        <g>
          <rect x="22" y="18" width="56" height="64" rx="3" fill="#2f3a34" />
          {[28, 38, 48, 58, 68].map((y) => <path key={y} d={`M30 ${y}h28M64 ${y}h8`} stroke="#f4f1ea" strokeWidth="2.4" />)}
        </g>
      );
    case 'receipt':
      return (
        <g>
          <path d="M34 16h32v66l-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3Z" fill="#fff" stroke="#ccc" />
          {[26, 32, 38, 44, 50, 60].map((y) => <path key={y} d={`M38 ${y}h24`} stroke="#bbb" strokeWidth="1.6" />)}
        </g>
      );
  }
}

/** 리그·지역 랭킹 한 줄. 내 줄은 강조 */
export function RankRow({ rank, name, xp, me, mark }: { rank: number; name: string; xp: number; me?: boolean; mark?: 'promote' | 'demote' }) {
  return (
    <li className={`flex items-center gap-3 rounded-option px-3 py-2.5 ${me ? 'bg-accent-soft font-bold' : ''}`}>
      <span className={`w-8 text-right text-sm ${mark === 'promote' ? 'text-good' : mark === 'demote' ? 'text-bad' : 'text-sub'}`}>{rank}</span>
      <span className="flex-1 truncate text-[15px]">{name}{me && ' (나)'}</span>
      <span className="text-sm text-body">{xp} XP</span>
    </li>
  );
}

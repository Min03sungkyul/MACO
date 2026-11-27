import { Gauge } from '@/components/ui';
import type { GateScores } from '@/lib/types/store';

/** 찾게 → 믿게 → 알리게 3관문 점수 (prototype components/train/shop.tsx GateBars) */
export function GateBars({ scores }: { scores: GateScores }) {
  return (
    <div className="flex flex-col gap-3">
      <Gauge label="찾게" score={scores.findScore} />
      <Gauge label="믿게" score={scores.trustScore} />
      <Gauge label="알리게" score={scores.notifyScore} />
    </div>
  );
}

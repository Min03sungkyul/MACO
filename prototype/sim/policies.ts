// 비교할 재처방 정책들. 오라클만 숨은 확률을 보고, 나머지는 진단 답변과 기록만 봐요.

import { analyze, buildPlan, DAY_NAMES } from '../lib/maco.ts';
import {
  DEFAULT_CONFIG, MODEL_CONFIG, cellOf, chooseWithModel, choosePlan, flatBelief, learn, makeBelief, makeModel, update,
  type Belief, type EngineConfig, type Model, type ModelConfig,
} from '../lib/engine.ts';
import { hash32, mulberry32 } from './rng.ts';
import type { Policy } from './world.ts';

const SLOT_INDEX: Record<string, number> = { '오전': 0, '오후': 1, '저녁': 2, '마감 후': 2 };

/** 지금 앱의 규칙: 진단으로 개수를 정하고, 고정 요일에, 실행률 80%↑ 늘리기 / 50% 미만 줄이기. */
export const fixedRule: Policy = {
  id: 1,
  name: 'fixed',
  label: '현재 고정 규칙',
  start(p) {
    const a = analyze(p.answers);
    let n = a.tasksPerWeek;
    return {
      plan: () => buildPlan(a, n).map((t) => cellOf(DAY_NAMES.indexOf(t.day), SLOT_INDEX[t.slot])),
      observe(cells, outcomes) {
        const rate = outcomes.filter(Boolean).length / cells.length;
        n = rate >= 0.8 ? Math.min(4, n + 1) : rate >= 0.5 ? n : Math.max(2, n - 1);
      },
    };
  },
};

/**
 * 공정한 비교용: 고정 규칙도 "바쁜 시간" 답을 써요. 앱과 같은 코드(buildPlan → avoidBusy)로
 * 같은 요일의 다른 시간, 안 되면 가까운 빈 요일로 옮겨요.
 * 엔진의 효과가 "질문 덕분"인지 "모델 덕분"인지 나눠 보려는 기준선이에요.
 */
export const fixedAsk: Policy = {
  id: 10,
  name: 'fixed-ask',
  label: '고정 규칙 + 바쁜 시간 질문',
  start(p) {
    const a = analyze(p.answers);
    const busy = p.reportedBusy.flatMap((b, c) => (b ? [c] : []));
    let n = a.tasksPerWeek;
    return {
      plan: () => buildPlan(a, n, null, busy).map((t) => cellOf(DAY_NAMES.indexOf(t.day), SLOT_INDEX[t.slot])),
      observe(cells, outcomes) {
        const rate = outcomes.filter(Boolean).length / cells.length;
        n = rate >= 0.8 ? Math.min(4, n + 1) : rate >= 0.5 ? n : Math.max(2, n - 1);
      },
    };
  },
};

/** 파일럿용: 요일·시간을 무작위로 골라 칸별 데이터를 고르게 모아요 (사전분포 학습용). */
export const randomPilot: Policy = {
  id: 2,
  name: 'pilot',
  label: '무작위 파일럿',
  start(p) {
    const rng = mulberry32(hash32(p.seed, 2));
    return {
      plan() {
        const n = 2 + Math.floor(rng() * 3);
        const days = [...Array(7).keys()];
        for (let i = days.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [days[i], days[j]] = [days[j], days[i]]; }
        days.length = n;
        return days.map((d) => cellOf(d, Math.floor(rng() * 3))).sort((x, y) => x - y);
      },
      observe() {},
    };
  },
};

/** 마코 엔진. `prior` = 진단 그룹별 칸 실행률 표 (없으면 평평한 사전분포). */
export function enginePolicy(opts: {
  id: number; name: string; label: string;
  prior?: Record<string, number[]>; strength?: number; config?: Partial<EngineConfig>;
}): Policy {
  const cfg = { ...DEFAULT_CONFIG, ...opts.config };
  return {
    id: opts.id,
    name: opts.name,
    label: opts.label,
    start(p) {
      const rng = mulberry32(hash32(p.seed, opts.id));
      let bel: Belief = opts.prior
        ? makeBelief(opts.prior[p.group] ?? opts.prior['*'], opts.strength ?? 4)
        : flatBelief();
      let prev: number[] | null = null;
      return {
        plan() {
          prev = choosePlan(bel, prev, rng, cfg).cells;
          return prev;
        },
        observe(cells, outcomes) { bel = update(bel, cells, outcomes, cfg.discount); },
      };
    },
  };
}

/**
 * 상한선: 숨은 확률을 알고 매주 기대 실행 수가 가장 큰 루틴을 골라요
 * (단, 예상 실행률 60% 이상일 때만 늘려요). 정책이 얼마나 "정답"에 가까운지 재는 기준이에요.
 */
export const oracle: Policy = {
  id: 9,
  name: 'oracle',
  label: '정답을 아는 기준선',
  start() {
    return {
      plan(_w, truth) {
        let bestCells: number[] = [], bestScore = -1;
        for (let n = DEFAULT_CONFIG.nMin; n <= DEFAULT_CONFIG.nMax; n++) {
          const perDay = DAY_NAMES.map((_, d) => {
            let c = cellOf(d, 0);
            for (let s = 1; s < 3; s++) if (truth(cellOf(d, s), n) > truth(c, n)) c = cellOf(d, s);
            return c;
          }).sort((x, y) => truth(y, n) - truth(x, n)).slice(0, n);
          const sum = perDay.reduce((s, c) => s + truth(c, n), 0);
          const ok = n === DEFAULT_CONFIG.nMin || sum / n >= 0.6;
          if (ok && sum > bestScore) { bestScore = sum; bestCells = perDay; }
        }
        return bestCells.sort((x, y) => x - y);
      },
      observe() {},
    };
  },
};

/** 마코 엔진 v2 (구조화 모델). `groups` = 파일럿으로 배운 진단 그룹별 가중치 평균. */
export function modelPolicy(opts: {
  id: number; name: string; label: string;
  groups?: Record<string, number[]>; config?: Partial<ModelConfig>;
  /** Use the owner's "바쁜 시간" answer. */
  ask?: boolean;
}): Policy {
  const cfg = { ...MODEL_CONFIG, ...opts.config };
  return {
    id: opts.id,
    name: opts.name,
    label: opts.label,
    start(p) {
      const rng = mulberry32(hash32(p.seed, opts.id));
      let m: Model = makeModel(opts.groups ? opts.groups[p.group] ?? opts.groups['*'] : undefined, undefined, opts.ask ? p.reportedBusy : []);
      let prev: number[] | null = null;
      return {
        plan() {
          prev = chooseWithModel(m, prev, rng, cfg).cells;
          return prev;
        },
        observe(cells, outcomes) { m = learn(m, cells, outcomes, cfg); },
      };
    },
  };
}

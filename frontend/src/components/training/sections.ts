import type { PathNode, PathUnit } from '@/lib/types/training';

/**
 * 트레이닝 경로 구조 (담당: 주승준)
 * - 섹션 = 관문 3개 (찾게 → 믿게 → 알리게, 기획서 ① 순서)
 * - 유닛 = 섹션 안의 1~6단계 = 스킬 2개 × 단계 목표 3개 (기획서 스킬 표의 Lv1·Lv3·Lv5)
 * - 돌 = 레슨 (서버 /training/path 의 node, 레슨 level로 단계에 넣는다)
 * TODO(주승준): 섹션·단계 문장은 content CSV로 옮기기 (이동성과 협의)
 */

export type GateCode = 'FIND' | 'TRUST' | 'NOTIFY';

export const SECTION_INFO: { gate: GateCode; no: number; name: string; goal: string }[] = [
  { gate: 'FIND', no: 1, name: '찾게', goal: '손님이 검색했을 때 우리 가게를 찾고 들어오게 할 수 있어요.' },
  { gate: 'TRUST', no: 2, name: '믿게', goal: '리뷰와 소개 문구로 손님이 믿고 방문하게 할 수 있어요.' },
  { gate: 'NOTIFY', no: 3, name: '알리게', goal: '소식·쿠폰·광고로 손님에게 우리 가게를 알릴 수 있어요.' },
];

/** 단계 목표에 쓰는 레벨 (기획서 스킬 표의 세 칸) */
const STAGE_LEVELS = [1, 3, 5] as const;

/** 스킬별 단계 목표 (기획서 "스킬 6개" 표의 Lv1·Lv3·Lv5 문장) */
const STAGE_GOALS: Record<string, [string, string, string]> = {
  INFO: ['플레이스 필수 항목을 빠짐없이 채워요', '휴무·변경 공지를 제때 올려요', '손님이 검색할 키워드를 골라요'],
  PHOTO: ['밝기·흔들림으로 나쁜 사진을 골라내요', '구도와 주인공이 살아 있는 사진을 골라요', '대표 사진 순서를 손님 입장에서 짜요'],
  REVIEW: ['답글이 필요한 리뷰를 골라요', '칭찬 리뷰에 따뜻하게 답해요', '불만 리뷰에 공감·사과·개선으로 답해요'],
  COPY: ['가격·위치가 빠진 문구를 찾아요', '혜택과 행동 유도를 넣어요', '손님 상황에 맞는 문구를 써요'],
  PROMO: ['소식·쿠폰의 쓰임을 알아요', '손님이 가게를 떠올리는 순간을 찾아요', '우리 가게에 맞는 채널을 골라요'],
  ADS: ['조회·저장·길찾기의 차이를 알아요', '광고를 켜도 되는지 판단해요', '예산·중지 기준을 정하고 결과를 읽어요'],
};

export type TrainingUnit = {
  key: string;
  sectionNo: number;
  no: number;
  gate: GateCode;
  skillName: string;
  level: number;
  title: string;
  ready: boolean;
  nodes: PathNode[];
};

export type TrainingSection = {
  gate: GateCode;
  no: number;
  name: string;
  goal: string;
  units: TrainingUnit[];
  doneCount: number;
  lessonCount: number;
};

/** 레슨 레벨(1~5)을 단계(1·3·5)에 넣는다: Lv1~2 → 1단계, Lv3~4 → 3단계, Lv5 → 5단계 */
const stageOf = (level: number) => (level <= 2 ? 1 : level <= 4 ? 3 : 5);

/** 서버의 스킬 경로를 섹션 → 유닛 → 레슨 구조로 묶는다 */
export function buildSections(skills: PathUnit[]): TrainingSection[] {
  return SECTION_INFO.map((s) => {
    const units: TrainingUnit[] = [];
    for (const skill of skills.filter((u) => u.gate === s.gate)) {
      STAGE_LEVELS.forEach((level, i) => {
        const nodes = skill.nodes.filter((n) => stageOf(n.level) === level);
        units.push({
          key: `${skill.skillCode}-${level}`,
          sectionNo: s.no,
          no: units.length + 1,
          gate: s.gate,
          skillName: skill.name,
          level,
          title: STAGE_GOALS[skill.skillCode]?.[i] ?? `${skill.name} ${level}단계`,
          ready: skill.ready && nodes.length > 0,
          nodes,
        });
      });
    }
    const lessons = units.flatMap((u) => u.nodes);
    return { ...s, units, doneCount: lessons.filter((n) => n.status === 'DONE').length, lessonCount: lessons.length };
  });
}

/** 지금 할 레슨(OPEN)이 있는 첫 유닛, 없으면 첫 유닛 */
export function currentUnit(sections: TrainingSection[]): TrainingUnit | null {
  const units = sections.flatMap((s) => s.units);
  return units.find((u) => u.nodes.some((n) => n.status === 'OPEN')) ?? units[0] ?? null;
}

export type GateStyle = { bg: string; banner: string; stone: string; text: string; ring: string };

/** 관문별 색 (tokens.css의 gate 색). Tailwind가 찾을 수 있게 클래스 이름을 통째로 적는다 */
export const GATE_STYLE: Record<GateCode, GateStyle> = {
  FIND: {
    bg: 'bg-gate-find',
    banner: 'bg-gate-find shadow-[0_4px_0_var(--color-gate-find-deep)]',
    stone: 'bg-gate-find shadow-[0_6px_0_var(--color-gate-find-deep)]',
    text: 'text-gate-find',
    ring: 'stroke-gate-find',
  },
  TRUST: {
    bg: 'bg-gate-trust',
    banner: 'bg-gate-trust shadow-[0_4px_0_var(--color-gate-trust-deep)]',
    stone: 'bg-gate-trust shadow-[0_6px_0_var(--color-gate-trust-deep)]',
    text: 'text-gate-trust',
    ring: 'stroke-gate-trust',
  },
  NOTIFY: {
    bg: 'bg-gate-notify',
    banner: 'bg-gate-notify shadow-[0_4px_0_var(--color-gate-notify-deep)]',
    stone: 'bg-gate-notify shadow-[0_6px_0_var(--color-gate-notify-deep)]',
    text: 'text-gate-notify',
    ring: 'stroke-gate-notify',
  },
};

/** 👤 내 정보·시연 도구 (담당: 박민하). 서버: com.maco.report.dto.ReportDtos, demo */
export type Stats = {
  todayXp: number;
  weekXp: number;
  totalXp: number;
  trainingMinutesWeek: number;
  solvedWeek: number;
  accuracy: number;
  streakDays: number;
  bestStreak: number;
};

export type WeekPoint = { weekStart: string; avgTheta: number; findScore: number | null; trustScore: number | null; notifyScore: number | null; xp: number };
export type Report = { weeks: WeekPoint[] };

export type SkillLevel = { skillCode: string; name: string; level: number; theta: number; ready: boolean };
export type Badge = { code: string; name: string; earned: boolean };

export type DayResult = { dayOffset: number; today: string };

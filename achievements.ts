import type { TestResult } from "./store";
import { computeStreaks } from "./engine";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  /** returns progress 0..1 */
  progress: (ctx: AchievementCtx) => number;
}

export interface AchievementCtx {
  results: TestResult[];
  dailyCompleted: number;
}

const maxWpm = (r: TestResult[]) => r.reduce((m, x) => Math.max(m, x.wpm), 0);
const wpmGoal = (goal: number) => (c: AchievementCtx) => Math.min(1, maxWpm(c.results) / goal);

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-test", name: "First Test", description: "Complete your first typing test.", icon: "Rocket", xp: 50, progress: (c) => Math.min(1, c.results.length) },
  { id: "speed-starter", name: "Speed Starter", description: "Reach 30 WPM.", icon: "Gauge", xp: 75, progress: wpmGoal(30) },
  { id: "fast-fingers", name: "Fast Fingers", description: "Reach 50 WPM.", icon: "Zap", xp: 150, progress: wpmGoal(50) },
  { id: "speed-master", name: "Speed Master", description: "Reach 80 WPM.", icon: "Flame", xp: 300, progress: wpmGoal(80) },
  { id: "typing-legend", name: "Typing Legend", description: "Reach 100 WPM.", icon: "Crown", xp: 500, progress: wpmGoal(100) },
  {
    id: "accuracy-king",
    name: "Accuracy King",
    description: "Achieve 98% accuracy (at least 50 characters).",
    icon: "Target",
    xp: 150,
    progress: (c) => (c.results.some((r) => r.accuracy >= 98 && r.correctChars >= 50) ? 1 : Math.min(0.99, Math.max(0, ...c.results.filter((r) => r.correctChars >= 50).map((r) => r.accuracy / 98), 0))),
  },
  { id: "consistency", name: "Consistency Champion", description: "Practice 7 consecutive days.", icon: "CalendarCheck", xp: 300, progress: (c) => Math.min(1, computeStreaks(c.results.map((r) => r.date)).longest / 7) },
  { id: "marathon", name: "Marathon Typist", description: "Complete 100 tests.", icon: "Trophy", xp: 500, progress: (c) => Math.min(1, c.results.length / 100) },
  { id: "daily-hero", name: "Daily Hero", description: "Complete a daily challenge.", icon: "Star", xp: 100, progress: (c) => Math.min(1, c.dailyCompleted) },
  { id: "explorer", name: "Mode Explorer", description: "Try 5 different game modes.", icon: "Compass", xp: 120, progress: (c) => Math.min(1, new Set(c.results.map((r) => r.mode)).size / 5) },
];

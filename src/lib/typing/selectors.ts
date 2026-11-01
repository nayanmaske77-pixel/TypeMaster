import type { AppState, TestResult } from "./store";
import { computeStreaks, dayKey, levelFromXp } from "./engine";

export function summarize(state: AppState) {
  const r = state.results;
  const best = r.reduce((m, x) => Math.max(m, x.wpm), 0);
  const avg = (f: (x: TestResult) => number) => (r.length ? r.reduce((s, x) => s + f(x), 0) / r.length : 0);
  const streaks = computeStreaks(r.map((x) => x.date));
  const today = dayKey(new Date());
  return {
    count: r.length,
    latest: r[r.length - 1],
    bestWpm: best,
    avgWpm: Math.round(avg((x) => x.wpm)),
    avgAccuracy: Math.round(avg((x) => x.accuracy) * 10) / 10,
    totalSeconds: r.reduce((s, x) => s + x.duration, 0),
    streak: streaks.current,
    longestStreak: streaks.longest,
    practicedToday: r.some((x) => dayKey(x.date) === today),
    level: levelFromXp(state.xp),
  };
}

export function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

export function dailyActivity(results: TestResult[], days = 14) {
  const out: { day: string; label: string; tests: number; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const items = results.filter((r) => dayKey(r.date) === key);
    out.push({
      day: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      tests: items.length,
      minutes: Math.round((items.reduce((s, r) => s + r.duration, 0) / 60) * 10) / 10,
    });
  }
  return out;
}

function groupAvg(results: TestResult[], keyOf: (d: Date) => string, buckets: { key: string; label: string }[]) {
  return buckets.map((b) => {
    const items = results.filter((r) => keyOf(new Date(r.date)) === b.key);
    return {
      label: b.label,
      wpm: items.length ? Math.round(items.reduce((s, r) => s + r.wpm, 0) / items.length) : 0,
      accuracy: items.length ? Math.round(items.reduce((s, r) => s + r.accuracy, 0) / items.length) : 0,
      tests: items.length,
    };
  });
}

const weekStart = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return dayKey(x);
};

export function weekly(results: TestResult[], weeks = 8) {
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    const key = weekStart(d);
    return { key, label: new Date(key + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
  });
  return groupAvg(results, weekStart, buckets);
}

export function monthly(results: TestResult[], months = 6) {
  const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (months - 1 - i));
    return { key: keyOf(d), label: d.toLocaleDateString(undefined, { month: "short" }) };
  });
  return groupAvg(results, keyOf, buckets);
}

export function motivation(count: number, practicedToday: boolean, streak: number) {
  if (count === 0) return "Your typing journey starts now. Take your first test!";
  if (!practicedToday && streak > 0) return `Don't break your ${streak}-day streak — practice today!`;
  if (!practicedToday) return "A quick 30-second test today keeps your fingers sharp.";
  if (streak >= 7) return "Incredible consistency! You're on fire. 🔥";
  return "Great work today! One more round to beat your best?";
}

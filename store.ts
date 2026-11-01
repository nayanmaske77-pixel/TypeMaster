// Local persistence layer. Shape mirrors future DB tables (results, settings, achievements, daily).
import { useSyncExternalStore } from "react";
import type { Difficulty, GameMode } from "./content";
import { dailyChallenge } from "./content";
import { ACHIEVEMENTS } from "./achievements";
import { dayKey, levelFromXp, xpForResult } from "./engine";

export interface TestResult {
  id: string;
  date: string; // ISO
  wpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
  duration: number; // seconds
  mistakes: number;
  correctChars: number;
  incorrectChars: number;
  mode: GameMode;
  difficulty: Difficulty;
  xp: number;
}

export type CursorStyle = "line" | "block" | "underline";

export interface Settings {
  theme: "dark" | "light";
  sound: boolean;
  duration: number; // 0 = unlimited
  difficulty: Difficulty;
  cursor: CursorStyle;
  customText: string;
}

export interface AppState {
  version: 1;
  results: TestResult[];
  xp: number;
  unlocked: Record<string, string>; // achievementId -> ISO date
  daily: Record<string, { completed: boolean; bestWpm: number; bestAccuracy: number }>;
  settings: Settings;
}

const KEY = "typemaster:v1";

export const defaultState: AppState = {
  version: 1,
  results: [],
  xp: 0,
  unlocked: {},
  daily: {},
  settings: { theme: "dark", sound: true, duration: 60, difficulty: "medium", cursor: "line", customText: "" },
};

let state: AppState = defaultState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings } };
    }
  } catch {
    state = defaultState;
  }
}

export function getState() {
  load();
  return state;
}

function setState(next: AppState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or disabled */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAppState() {
  return useSyncExternalStore(subscribe, getState, () => defaultState);
}

export function updateSettings(patch: Partial<Settings>) {
  const s = getState();
  setState({ ...s, settings: { ...s.settings, ...patch } });
}

export function clearHistory() {
  const s = getState();
  setState({ ...s, results: [], daily: {} });
}

export function resetAll() {
  const s = getState();
  setState({ ...defaultState, settings: s.settings });
}

export interface SaveOutcome {
  result: TestResult;
  isPersonalBest: boolean;
  previousBest: number;
  newAchievements: typeof ACHIEVEMENTS;
  dailyCompletedNow: boolean;
  dailyBonus: number;
  levelUp: number | null;
}

export function saveResult(input: Omit<TestResult, "id" | "date" | "xp">): SaveOutcome {
  const s = getState();
  const now = new Date();
  const previousBest = s.results.reduce((m, r) => Math.max(m, r.wpm), 0);
  const result: TestResult = {
    ...input,
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    date: now.toISOString(),
    xp: xpForResult(input.wpm, input.accuracy, input.duration),
  };
  const results = [...s.results, result];
  let xp = s.xp + result.xp;

  // Daily challenge
  const daily = { ...s.daily };
  let dailyCompletedNow = false;
  let dailyBonus = 0;
  if (input.mode === "daily") {
    const key = dayKey(now);
    const ch = dailyChallenge(now);
    const prev = daily[key] ?? { completed: false, bestWpm: 0, bestAccuracy: 0 };
    const meets = input.wpm >= ch.targetWpm && input.accuracy >= ch.targetAccuracy;
    if (meets && !prev.completed) {
      dailyCompletedNow = true;
      dailyBonus = ch.bonusXp;
      xp += dailyBonus;
    }
    daily[key] = {
      completed: prev.completed || meets,
      bestWpm: Math.max(prev.bestWpm, input.wpm),
      bestAccuracy: Math.max(prev.bestAccuracy, input.accuracy),
    };
  }

  // Achievements
  const unlocked = { ...s.unlocked };
  const ctx = { results, dailyCompleted: Object.values(daily).filter((d) => d.completed).length };
  const newAchievements = ACHIEVEMENTS.filter((a) => !unlocked[a.id] && a.progress(ctx) >= 1);
  newAchievements.forEach((a) => {
    unlocked[a.id] = now.toISOString();
    xp += a.xp;
  });

  const beforeLevel = levelFromXp(s.xp).level;
  const afterLevel = levelFromXp(xp).level;
  setState({ ...s, results, xp, daily, unlocked });

  return {
    result,
    isPersonalBest: s.results.length > 0 && result.wpm > previousBest,
    previousBest,
    newAchievements,
    dailyCompletedNow,
    dailyBonus,
    levelUp: afterLevel > beforeLevel ? afterLevel : null,
  };
}

// Pure typing calculations — no React, no storage. Unit-tested.

export interface LiveStats {
  correctChars: number;
  incorrectChars: number;
  typedChars: number;
  wpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
  correctWords: number;
  wordsTyped: number;
}

/** Count correct/incorrect characters by comparing typed text to the target position-by-position. */
export function compareChars(target: string, typed: string) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++;
  return { correct, incorrect: typed.length - correct };
}

/** Words whose full span has been typed (followed by a space or end of text) and match exactly. */
export function countCorrectWords(target: string, typed: string) {
  let correct = 0;
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(target))) {
    const start = m.index;
    const end = start + m[0].length;
    const completed = typed.length > end || (typed.length === end && end === target.length);
    if (!completed) break;
    if (typed.slice(start, end) === m[0]) correct++;
  }
  return correct;
}

/**
 * WPM = (correct characters / 5) / minutes. CPM = correct characters / minutes.
 * Accuracy = correct keystrokes / total keystrokes (mistakes stay counted even if fixed).
 */
export function computeStats(
  target: string,
  typed: string,
  elapsedMs: number,
  totalKeystrokes: number,
  errorKeystrokes: number,
): LiveStats {
  const { correct, incorrect } = compareChars(target, typed);
  const minutes = Math.max(elapsedMs, 1) / 60000;
  const started = elapsedMs >= 500;
  const wpm = started ? Math.round(correct / 5 / minutes) : 0;
  const rawWpm = started ? Math.round(typed.length / 5 / minutes) : 0;
  const cpm = started ? Math.round(correct / minutes) : 0;
  const accuracy =
    totalKeystrokes > 0
      ? Math.round(((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 1000) / 10
      : 100;
  return {
    correctChars: correct,
    incorrectChars: incorrect,
    typedChars: typed.length,
    wpm,
    rawWpm,
    cpm,
    accuracy: Math.max(0, accuracy),
    correctWords: countCorrectWords(target, typed),
    wordsTyped: typed.trim() ? typed.trim().split(/\s+/).length : 0,
  };
}

export function performanceRating(wpm: number, accuracy: number) {
  const score = wpm * (accuracy / 100);
  if (score >= 90) return { label: "Typing Legend", emoji: "👑" };
  if (score >= 70) return { label: "Expert", emoji: "🚀" };
  if (score >= 50) return { label: "Fast", emoji: "⚡" };
  if (score >= 35) return { label: "Skilled", emoji: "🔥" };
  if (score >= 20) return { label: "Improving", emoji: "🌱" };
  return { label: "Beginner", emoji: "🐣" };
}

export function xpForResult(wpm: number, accuracy: number, durationSec: number) {
  return Math.max(5, Math.round(wpm * (accuracy / 100) * 0.6 + durationSec / 6 + 10));
}

/** Level n needs 100 * (n-1)^2 total XP. */
export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
  const current = 100 * (level - 1) ** 2;
  const next = 100 * level ** 2;
  return { level, current, next, progress: (xp - current) / (next - current) };
}

export function dayKey(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Current streak (ending today or yesterday) and longest streak of consecutive practice days. */
export function computeStreaks(dates: string[], now = new Date()) {
  const days = Array.from(new Set(dates.map(dayKey))).sort();
  if (!days.length) return { current: 0, longest: 0 };
  const toNum = (k: string) => Math.round(new Date(k + "T00:00:00").getTime() / 86400000);
  const nums: number[] = days.map(toNum);
  const n = (i: number) => nums[i] ?? 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i++) {
    run = n(i) - n(i - 1) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const today = toNum(dayKey(now));
  const last = n(nums.length - 1);
  let current = 0;
  if (today - last <= 1) {
    current = 1;
    for (let i = nums.length - 1; i > 0 && n(i) - n(i - 1) === 1; i--) current++;
  }
  return { current, longest };
}

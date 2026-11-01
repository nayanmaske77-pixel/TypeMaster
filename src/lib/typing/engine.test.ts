import { describe, expect, it } from "vitest";
import { computeStats, computeStreaks, countCorrectWords, levelFromXp } from "./engine";

describe("typing engine", () => {
  it("WPM is correct characters / 5 per minute", () => {
    const target = "a".repeat(300);
    const s = computeStats(target, "a".repeat(250), 60000, 250, 0);
    expect(s.wpm).toBe(50);
    expect(s.cpm).toBe(250);
  });

  it("accuracy counts corrected mistakes", () => {
    const s = computeStats("hello", "hello", 10000, 10, 2);
    expect(s.accuracy).toBe(80);
  });

  it("counts incorrect characters", () => {
    const s = computeStats("hello", "hxllo", 10000, 5, 1);
    expect(s.correctChars).toBe(4);
    expect(s.incorrectChars).toBe(1);
  });

  it("counts only completed correct words", () => {
    expect(countCorrectWords("the cat sat", "the cxt sa")).toBe(1);
    expect(countCorrectWords("the cat sat", "the cat sat")).toBe(3);
  });

  it("streaks count consecutive days", () => {
    const now = new Date("2026-03-10T12:00:00");
    const d = ["2026-03-08T10:00:00", "2026-03-09T10:00:00", "2026-03-10T10:00:00", "2026-03-01T10:00:00"];
    expect(computeStreaks(d, now)).toEqual({ current: 3, longest: 3 });
  });

  it("level 2 starts at 100 XP", () => {
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
  });
});

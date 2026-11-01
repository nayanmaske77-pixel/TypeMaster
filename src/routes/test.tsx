import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Chip } from "@/components/tm/ui-bits";
import { TypingTest } from "@/components/tm/TypingTest";
import { LIBRARY, MODE_INFO, type Difficulty, type GameMode } from "@/lib/typing/content";
import { updateSettings, useAppState } from "@/lib/typing/store";
import { Textarea } from "@/components/ui/textarea";

const MODES = Object.keys(MODE_INFO) as GameMode[];
const DIFFS: Difficulty[] = ["easy", "medium", "hard"];
const DURATIONS = [15, 30, 60, 120, 0];
const NEXT: GameMode[] = ["classic", "time", "rush", "accuracy", "quote", "beginner", "advanced"];

interface TestSearch {
  mode?: GameMode | undefined;
  difficulty?: Difficulty | undefined;
  duration?: number | undefined;
  category?: string | undefined;
}

export const Route = createFileRoute("/test")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): TestSearch => ({
    mode: MODES.includes(s["mode"] as GameMode) ? (s["mode"] as GameMode) : undefined,
    difficulty: DIFFS.includes(s["difficulty"] as Difficulty) ? (s["difficulty"] as Difficulty) : undefined,
    duration: DURATIONS.includes(Number(s["duration"])) && s["duration"] !== undefined ? Number(s["duration"]) : undefined,
    category: typeof s["category"] === "string" ? s["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Typing Test – TypeMaster" },
      { name: "description", content: "Take a live typing speed test with real-time WPM, CPM and accuracy." },
      { property: "og:title", content: "Typing Test – TypeMaster" },
      { property: "og:description", content: "Take a live typing speed test with real-time WPM, CPM and accuracy." },
    ],
  }),
  component: TestPage,
});

function TestPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/test" });
  const { settings } = useAppState();
  const mode = search.mode ?? "classic";
  const fixedDuration = mode === "daily" || mode === "quote" || mode === "custom" || mode === "accuracy";
  const isEndlessNoTimer = (mode === "time" || mode === "rush");
  const modeDefault = fixedDuration ? 0 : ["time", "rush", "beginner", "advanced"].includes(mode) ? MODE_INFO[mode].defaultDuration : settings["duration"];
  const duration = search.duration ?? modeDefault;
  const difficulty = search.difficulty ?? (mode === "beginner" ? "easy" : mode === "advanced" ? "hard" : settings["difficulty"]);
  const [round, setRound] = useState(0);
  const [customDraft, setCustomDraft] = useState(settings.customText);

  const set = (patch: Partial<TestSearch>) => {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
    setRound((r) => r + 1);
  };

  const next = () => {
    const i = NEXT.indexOf(mode);
    const m = NEXT[(i + 1) % NEXT.length];
    navigate({ search: { mode: m } });
    setRound((r) => r + 1);
  };

  const category = mode === "library" ? LIBRARY.find((c) => c.id === search.category) : undefined;
  const info = MODE_INFO[mode];

  return (
    <div>
      <PageHeader title={category ? category.name : info.name} subtitle={category ? category.description : info.description} />

      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          {NEXT.concat(["custom"]).map((m) => (
            <Chip key={m} active={m === mode} onClick={() => set({ mode: m, duration: undefined, category: undefined, difficulty: undefined })}>
              {MODE_INFO[m].name}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">Time</span>
          {DURATIONS.map((d) => (
            <Chip key={d} active={duration === d} onClick={() => set({ duration: d })}>
              {d === 0 ? "∞ Unlimited" : `${d}s`}
            </Chip>
          ))}
          <span className="ml-3 mr-1 text-xs uppercase tracking-wider text-muted-foreground">Level</span>
          {DIFFS.map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => set({ difficulty: d })}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Chip>
          ))}
        </div>
        {isEndlessNoTimer && duration === 0 && (
          <p className="text-xs text-muted-foreground">Endless words in unlimited mode — press Finish when you're done.</p>
        )}
      </div>

      {mode === "custom" && (
        <div className="glass-card mb-5 space-y-3 p-4">
          <Textarea
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            placeholder="Paste or write the text you want to practice…"
            rows={3}
            maxLength={3000}
          />
          <button
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            onClick={() => {
              updateSettings({ customText: customDraft });
              setRound((r) => r + 1);
            }}
          >
            Use this text
          </button>
        </div>
      )}

      <TypingTest
        key={`${mode}-${difficulty}-${duration}-${search.category}-${round}`}
        config={{ mode, difficulty, category: search.category, customText: settings.customText }}
        duration={duration}
        onRestart={() => setRound((r) => r + 1)}
        onNext={next}
      />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/tm/ui-bits";
import { useAppState } from "@/lib/typing/store";
import { MODE_INFO } from "@/lib/typing/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard – TypeMaster" },
      { name: "description", content: "See how your best typing speed ranks against sample players and your own personal records." },
      { property: "og:title", content: "Leaderboard – TypeMaster" },
      { property: "og:description", content: "Rankings of top typing speeds." },
    ],
  }),
  component: LeaderboardPage,
});

// Sample players for demonstration only — not real users.
const DEMO = [
  { name: "NeonKeys", wpm: 132, accuracy: 98.4, country: "🇯🇵" },
  { name: "SwiftQuill", wpm: 118, accuracy: 97.1, country: "🇺🇸" },
  { name: "ByteRider", wpm: 104, accuracy: 96.8, country: "🇩🇪" },
  { name: "PixelPaws", wpm: 92, accuracy: 97.9, country: "🇮🇳" },
  { name: "TurboTyper", wpm: 85, accuracy: 95.2, country: "🇧🇷" },
  { name: "QuietStorm", wpm: 76, accuracy: 98.9, country: "🇬🇧" },
  { name: "KeyNinja", wpm: 68, accuracy: 94.5, country: "🇰🇷" },
  { name: "Lumen", wpm: 57, accuracy: 96.0, country: "🇫🇷" },
  { name: "SlowAndSteady", wpm: 44, accuracy: 99.1, country: "🇨🇦" },
  { name: "NewbieNova", wpm: 31, accuracy: 92.3, country: "🇦🇺" },
];

function LeaderboardPage() {
  const { results } = useAppState();
  const best = [...results].sort((a, b) => b.wpm - a.wpm)[0];
  const rows = [...DEMO.map((d) => ({ ...d, you: false })), ...(best ? [{ name: "You", wpm: best.wpm, accuracy: best.accuracy, country: "⭐", you: true }] : [])].sort((a, b) => b.wpm - a.wpm);
  const myRank = rows.findIndex((r) => r.you) + 1;
  const personal = [...results].sort((a, b) => b.wpm - a.wpm).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" subtitle={best ? `Your rank: #${myRank} of ${rows.length}` : "Complete a test to join the board."} />
      <div className="flex items-start gap-3 rounded-2xl border border-cyan/40 bg-cyan/10 p-4 text-sm">
        <Info className="mt-0.5 size-5 shrink-0 text-cyan" />
        <span>
          <b>Demo leaderboard.</b> Other players shown here are sample data. Your scores are stored only on this device — a real global leaderboard needs online accounts, which aren't connected yet.
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="glass-card p-5 lg:col-span-3">
          <h2 className="mb-3 font-semibold">Top typing speeds (demo)</h2>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={r.name} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5", r.you ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-background/40")}>
                <span className="w-8 text-center text-lg font-bold">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                <div className={cn("grid size-9 place-items-center rounded-full text-sm font-bold", r.you ? "bg-background/20" : "bg-muted")}>{r.name[0]}</div>
                <div className="flex-1">
                  <div className="font-semibold">{r.name} <span>{r.country}</span></div>
                  <div className={cn("text-xs", r.you ? "opacity-80" : "text-muted-foreground")}>{r.accuracy}% accuracy</div>
                </div>
                <div className="text-right text-lg font-bold tabular-nums">{r.wpm} <span className="text-xs font-normal">WPM</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Your personal bests (local)</h2>
          {personal.length ? (
            <ol className="space-y-2">
              {personal.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">#{i + 1} · {MODE_INFO[p.mode]?.name}</span>
                  <span className="font-bold">{p.wpm} WPM · {p.accuracy}%</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">No scores yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

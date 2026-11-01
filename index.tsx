import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedNumber, DynIcon, ProgressBar, StatCard } from "@/components/tm/ui-bits";
import { WpmLine } from "@/components/tm/charts";
import { useAppState } from "@/lib/typing/store";
import { formatDuration, motivation, summarize } from "@/lib/typing/selectors";
import { dailyChallenge, MODE_INFO, type GameMode } from "@/lib/typing/content";
import { dayKey } from "@/lib/typing/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TypeMaster – Typing Speed Challenge Dashboard" },
      { name: "description", content: "Track your WPM, accuracy, streaks and level up your typing with games and daily challenges." },
      { property: "og:title", content: "TypeMaster – Typing Speed Challenge" },
      { property: "og:description", content: "Track your WPM, accuracy, streaks and level up your typing with games and daily challenges." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const state = useAppState();
  const s = summarize(state);
  const chart = state.results.slice(-20).map((r, i) => ({ label: `#${state.results.length - Math.min(20, state.results.length) + i + 1}`, wpm: r.wpm }));
  const daily = dailyChallenge();
  const dailyDone = state.daily[dayKey(new Date())]?.completed;
  const quick: GameMode[] = ["time", "rush", "accuracy", "quote"];

  return (
    <div className="space-y-6">
      <section className="glass-card relative overflow-hidden p-6 sm:p-10">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-gradient-primary opacity-25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-gradient-hot opacity-20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Welcome back, typist 👋</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Type faster. <span className="text-gradient">Level up.</span>
            </h1>
            <p className="mt-3 max-w-lg text-muted-foreground">{motivation(s.count, s.practicedToday, s.streak)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/test">
                  <Play /> Start Typing Test
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/modes">Explore game modes</Link>
              </Button>
            </div>
          </div>
          <div className="min-w-56 rounded-2xl border border-border bg-background/40 p-5">
            <div className="text-sm text-muted-foreground">Level</div>
            <div className="text-5xl font-bold text-gradient">{s.level.level}</div>
            <ProgressBar value={s.level.progress} className="mt-3" />
            <div className="mt-2 text-xs text-muted-foreground">
              {state.xp} XP · {s.level.next - state.xp} XP to next level
            </div>
          </div>
        </div>
      </section>

      {!s.practicedToday && s.count > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <Bell className="size-5 text-warning" />
          <span>Practice reminder: you haven't typed today yet. A 15-second test is enough to keep your streak alive!</span>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon="Gauge" label="Current speed" value={<><AnimatedNumber value={s.latest?.wpm ?? 0} /> <span className="text-base text-muted-foreground">WPM</span></>} tone="primary" />
        <StatCard icon="Trophy" label="Best speed" value={<><AnimatedNumber value={s.bestWpm} /> <span className="text-base text-muted-foreground">WPM</span></>} tone="warning" />
        <StatCard icon="Target" label="Avg accuracy" value={<AnimatedNumber value={s.avgAccuracy} decimals={1} suffix="%" />} tone="success" />
        <StatCard icon="ListChecks" label="Tests completed" value={<AnimatedNumber value={s.count} />} tone="cyan" />
        <StatCard icon="Clock" label="Practice time" value={formatDuration(s.totalSeconds)} tone="blue" />
        <StatCard icon="Flame" label="Daily streak" value={`${s.streak} 🔥`} hint={`Longest: ${s.longestStreak} days`} tone="pink" />
        <StatCard icon="TrendingUp" label="Average WPM" value={<AnimatedNumber value={s.avgWpm} />} tone="primary" />
        <StatCard icon="Award" label="Achievements" value={`${Object.keys(state.unlocked).length}`} hint="badges unlocked" tone="warning" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Performance over time</h2>
            <Link to="/stats" className="text-sm text-primary hover:underline">Full statistics</Link>
          </div>
          {chart.length >= 2 ? (
            <WpmLine data={chart} />
          ) : (
            <div className="grid h-64 place-items-center text-center text-muted-foreground">
              <div>
                <DynIcon name="LineChart" className="mx-auto mb-2 size-10 opacity-50" />
                Complete at least 2 tests to see your improvement graph.
              </div>
            </div>
          )}
        </div>
        <div className="glass-card relative overflow-hidden p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Daily challenge</div>
          <h3 className="mt-1 text-xl font-bold">{daily.title}</h3>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <div>🎯 Target: {daily.targetWpm} WPM</div>
            <div>✅ Accuracy: {daily.targetAccuracy}%+</div>
            <div>⭐ Bonus: +{daily.bonusXp} XP</div>
          </div>
          <Button variant={dailyDone ? "outline" : "hero"} className="mt-5 w-full" asChild>
            <Link to="/daily">{dailyDone ? "Completed ✓ — view" : "Take today's challenge"} <ArrowRight /></Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick play</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quick.map((m) => (
            <Link key={m} to="/test" search={{ mode: m }} className="glass-card card-hover p-4">
              <DynIcon name={MODE_INFO[m].icon} className="size-6 text-primary" />
              <div className="mt-2 font-semibold">{MODE_INFO[m].name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{MODE_INFO[m].description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

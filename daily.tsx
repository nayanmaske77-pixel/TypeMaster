import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, ProgressBar } from "@/components/tm/ui-bits";
import { dailyChallenge } from "@/lib/typing/content";
import { dayKey } from "@/lib/typing/engine";
import { useAppState } from "@/lib/typing/store";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Daily Challenge – TypeMaster" },
      { name: "description", content: "A new typing challenge every day with WPM and accuracy targets and bonus XP." },
      { property: "og:title", content: "Daily Challenge – TypeMaster" },
      { property: "og:description", content: "A new typing challenge every day with bonus XP rewards." },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const state = useAppState();
  const today = new Date();
  const ch = dailyChallenge(today);
  const prog = state.daily[dayKey(today)];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { d, done: !!state.daily[dayKey(d)]?.completed };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Challenge" subtitle={today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} />
      <div className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 size-60 rounded-full bg-gradient-hot opacity-25 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm">
            {prog?.completed ? (
              <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 font-semibold text-success"><CheckCircle2 className="size-4" /> Completed</span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 font-semibold text-warning"><Circle className="size-4" /> Not completed</span>
            )}
          </div>
          <h2 className="mt-3 text-3xl font-bold">{ch.title}</h2>
          <p className="mt-4 rounded-xl border border-border bg-background/40 p-4 font-mono text-sm leading-relaxed text-muted-foreground">{ch.text}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Target label="Target WPM" value={ch.targetWpm} best={prog?.bestWpm ?? 0} />
            <Target label="Accuracy target" value={ch.targetAccuracy} best={prog?.bestAccuracy ?? 0} suffix="%" />
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Bonus reward</div>
              <div className="text-2xl font-bold text-gradient">+{ch.bonusXp} XP</div>
              <div className="text-xs text-muted-foreground">Hit both targets in one run</div>
            </div>
          </div>
          <Button variant="hero" size="lg" className="mt-6" asChild>
            <Link to="/test" search={{ mode: "daily", duration: 0 }}><Play /> {prog ? "Try again" : "Start challenge"}</Link>
          </Button>
        </div>
      </div>
      <div className="glass-card p-5">
        <h3 className="mb-4 font-semibold">Last 7 days</h3>
        <div className="grid grid-cols-7 gap-2">
          {week.map(({ d, done }) => (
            <div key={d.toISOString()} className="text-center">
              <div className={`mx-auto grid size-10 place-items-center rounded-xl text-sm font-bold ${done ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                {done ? "✓" : d.getDate()}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Target({ label, value, best, suffix = "" }: { label: string; value: number; best: number; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}{suffix}</div>
      <ProgressBar value={best / value} className="mt-2" />
      <div className="mt-1 text-xs text-muted-foreground">Your best today: {best}{suffix}</div>
    </div>
  );
}

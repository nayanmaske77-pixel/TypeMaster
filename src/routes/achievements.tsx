import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { DynIcon, PageHeader, ProgressBar } from "@/components/tm/ui-bits";
import { ACHIEVEMENTS } from "@/lib/typing/achievements";
import { useAppState } from "@/lib/typing/store";
import { summarize } from "@/lib/typing/selectors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements – TypeMaster" },
      { name: "description", content: "Unlock badges, earn XP and level up as your typing improves." },
      { property: "og:title", content: "Achievements – TypeMaster" },
      { property: "og:description", content: "Unlock badges, earn XP and level up." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const state = useAppState();
  const s = summarize(state);
  const ctx = { results: state.results, dailyCompleted: Object.values(state.daily).filter((d) => d.completed).length };
  const unlockedCount = Object.keys(state.unlocked).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" subtitle={`${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`} />
      <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
          {s.level.level}
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Level {s.level.level}</span>
            <span className="text-muted-foreground">{state.xp} XP total</span>
          </div>
          <ProgressBar value={s.level.progress} className="mt-2 h-3" />
          <div className="mt-1 text-xs text-muted-foreground">{s.level.next - state.xp} XP until level {s.level.level + 1} · 🔥 {s.streak}-day streak</div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const at = state.unlocked[a.id];
          const p = at ? 1 : a.progress(ctx);
          return (
            <div key={a.id} className={cn("glass-card card-hover p-5", at ? "border-warning/50" : "opacity-80")}>
              <div className="flex items-start gap-4">
                <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", at ? "bg-gradient-hot shadow-glow" : "bg-muted")}>
                  {at ? <DynIcon name={a.icon} className="size-7 text-primary-foreground" /> : <Lock className="size-6 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <div className="mt-1 text-xs font-semibold text-warning">+{a.xp} XP</div>
                </div>
              </div>
              <ProgressBar value={p} className="mt-4" />
              <div className="mt-1 text-xs text-muted-foreground">
                {at ? `Unlocked ${new Date(at).toLocaleDateString()}` : `${Math.floor(p * 100)}% complete`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

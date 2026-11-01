import { createFileRoute, Link } from "@tanstack/react-router";
import { DynIcon, PageHeader } from "@/components/tm/ui-bits";
import { MODE_INFO, type GameMode } from "@/lib/typing/content";
import { useAppState } from "@/lib/typing/store";

export const Route = createFileRoute("/modes")({
  head: () => ({
    meta: [
      { title: "Game Modes – TypeMaster" },
      { name: "description", content: "Classic, Time Challenge, Word Rush, Accuracy, Quotes, Custom, Beginner and Advanced typing modes." },
      { property: "og:title", content: "Game Modes – TypeMaster" },
      { property: "og:description", content: "Eight fun typing game modes to sharpen speed and accuracy." },
    ],
  }),
  component: ModesPage,
});

const LIST: GameMode[] = ["classic", "time", "rush", "accuracy", "quote", "custom", "beginner", "advanced"];
const GRADS = ["bg-gradient-primary", "bg-gradient-hot"];

function ModesPage() {
  const { results } = useAppState();
  return (
    <div>
      <PageHeader title="Game Modes" subtitle="Pick your challenge. Every mode earns XP and counts toward achievements." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LIST.map((m, i) => {
          const info = MODE_INFO[m];
          const mine = results.filter((r) => r.mode === m);
          const best = mine.reduce((x, r) => Math.max(x, r.wpm), 0);
          return (
            <Link key={m} to="/test" search={{ mode: m }} className="glass-card card-hover group flex flex-col p-5">
              <div className={`grid size-12 place-items-center rounded-2xl ${GRADS[i % 2]} shadow-glow transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                <DynIcon name={info.icon} className="size-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{info.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{info.description}</p>
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>{mine.length} plays</span>
                <span>Best: {best} WPM</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

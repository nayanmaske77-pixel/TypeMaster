import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, DynIcon, PageHeader } from "@/components/tm/ui-bits";
import { LIBRARY, type Difficulty } from "@/lib/typing/content";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Practice Library – TypeMaster" },
      { name: "description", content: "Practice typing with words, business text, code, numbers, punctuation and quotes." },
      { property: "og:title", content: "Practice Library – TypeMaster" },
      { property: "og:description", content: "Nine practice categories with three difficulty levels." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [diff, setDiff] = useState<Difficulty>("medium");
  return (
    <div>
      <PageHeader title="Practice Library" subtitle="Choose a category. Difficulty controls how much text you'll type.">
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <Chip key={d} active={d === diff} onClick={() => setDiff(d)}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Chip>
          ))}
        </div>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIBRARY.map((c) => (
          <Link key={c.id} to="/test" search={{ mode: "library", category: c.id, difficulty: diff, duration: 0 }} className="glass-card card-hover p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <DynIcon name={c.icon} className="size-5" />
              </div>
              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.items.length} texts</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
            <p className="mt-3 truncate rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">{c.items[0]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

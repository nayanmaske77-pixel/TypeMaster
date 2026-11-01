import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DynIcon, PageHeader } from "@/components/tm/ui-bits";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About – TypeMaster" },
      { name: "description", content: "How TypeMaster measures WPM, CPM and accuracy, and tips to type faster." },
      { property: "og:title", content: "About – TypeMaster" },
      { property: "og:description", content: "How TypeMaster measures your typing and helps you improve." },
    ],
  }),
  component: AboutPage,
});

const FACTS = [
  { icon: "Gauge", title: "WPM", text: "Correct characters ÷ 5, per minute. Only correctly typed characters count." },
  { icon: "Activity", title: "CPM", text: "Correct characters typed per minute." },
  { icon: "Target", title: "Accuracy", text: "Correct keystrokes ÷ all keystrokes. Fixed mistakes still count against you." },
  { icon: "HardDrive", title: "Your data", text: "Everything is saved in your browser on this device. No account needed." },
];
const TIPS = [
  "Keep your fingers on the home row (ASDF JKL;).",
  "Look at the screen, not the keyboard.",
  "Accuracy first — speed follows.",
  "Practice 10 minutes a day rather than an hour once a week.",
  "Relax your shoulders and keep your wrists straight.",
];

function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="About TypeMaster" subtitle="A typing gym that feels like a game." />
      <div className="grid gap-4 sm:grid-cols-2">
        {FACTS.map((f) => (
          <div key={f.title} className="glass-card p-5">
            <DynIcon name={f.icon} className="size-6 text-primary" />
            <h3 className="mt-2 font-bold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold">Tips to type faster</h2>
        <ul className="mt-3 space-y-2">
          {TIPS.map((t) => <li key={t} className="flex gap-2 text-muted-foreground"><span className="text-primary">▸</span>{t}</li>)}
        </ul>
        <Button variant="hero" className="mt-5" asChild><Link to="/test">Start practicing</Link></Button>
      </div>
    </div>
  );
}

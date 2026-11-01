import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/tm/ui-bits";
import { AccuracyLine, Bars, WpmLine } from "@/components/tm/charts";
import { useAppState } from "@/lib/typing/store";
import { dailyActivity, formatDuration, monthly, summarize, weekly } from "@/lib/typing/selectors";
import { MODE_INFO } from "@/lib/typing/content";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics – TypeMaster" },
      { name: "description", content: "Your typing speed history, accuracy trends and daily, weekly and monthly performance." },
      { property: "og:title", content: "Statistics – TypeMaster" },
      { property: "og:description", content: "Charts of your typing speed and accuracy over time." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const state = useAppState();
  const s = summarize(state);
  const r = state.results;
  const hist = r.slice(-30).map((x) => ({
    label: new Date(x.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    wpm: x.wpm,
    accuracy: x.accuracy,
  }));

  if (!r.length) {
    return (
      <div>
        <PageHeader title="Statistics" />
        <div className="glass-card p-10 text-center">
          <p className="text-muted-foreground">No tests yet. Your charts will appear here after your first test.</p>
          <Button variant="hero" className="mt-4" asChild><Link to="/test">Take a test</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Statistics" subtitle="All charts use your saved test history on this device." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="Trophy" label="Best WPM" value={s.bestWpm} tone="warning" />
        <StatCard icon="TrendingUp" label="Average WPM" value={s.avgWpm} tone="primary" />
        <StatCard icon="ListChecks" label="Total sessions" value={s.count} tone="cyan" />
        <StatCard icon="Clock" label="Practice time" value={formatDuration(s.totalSeconds)} tone="pink" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Typing speed history (last 30)"><WpmLine data={hist} height={240} /></Panel>
        <Panel title="Accuracy history"><AccuracyLine data={hist} /></Panel>
        <Panel title="Daily practice activity (tests)"><Bars data={dailyActivity(r)} dataKey="tests" name="Tests" color="var(--chart-2)" /></Panel>
        <Panel title="Daily practice minutes"><Bars data={dailyActivity(r)} dataKey="minutes" name="Minutes" color="var(--chart-4)" /></Panel>
        <Panel title="Weekly performance (avg WPM)"><Bars data={weekly(r)} dataKey="wpm" name="Avg WPM" color="var(--chart-1)" /></Panel>
        <Panel title="Monthly performance (avg WPM)"><Bars data={monthly(r)} dataKey="wpm" name="Avg WPM" color="var(--chart-3)" /></Panel>
      </div>
      <Panel title="Recent tests">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>{["Date", "Mode", "Level", "WPM", "CPM", "Accuracy", "Mistakes", "Time"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {[...r].reverse().slice(0, 25).map((x) => (
                <tr key={x.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-2 py-2">{new Date(x.date).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="whitespace-nowrap px-2 py-2">{MODE_INFO[x.mode]?.name ?? x.mode}</td>
                  <td className="px-2 py-2 capitalize">{x.difficulty}</td>
                  <td className="px-2 py-2 font-bold text-primary">{x.wpm}</td>
                  <td className="px-2 py-2">{x.cpm}</td>
                  <td className="px-2 py-2">{x.accuracy}%</td>
                  <td className="px-2 py-2">{x.mistakes}</td>
                  <td className="px-2 py-2">{x.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </div>
  );
}

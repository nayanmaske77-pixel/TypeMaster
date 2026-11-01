import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Chip, PageHeader } from "@/components/tm/ui-bits";
import { clearHistory, resetAll, updateSettings, useAppState, type CursorStyle } from "@/lib/typing/store";
import { sounds } from "@/lib/typing/sound";
import type { Difficulty } from "@/lib/typing/content";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings – TypeMaster" },
      { name: "description", content: "Customize theme, sounds, default test length, difficulty and cursor style." },
      { property: "og:title", content: "Settings – TypeMaster" },
      { property: "og:description", content: "Customize your TypeMaster experience." },
    ],
  }),
  component: SettingsPage,
});

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Confirm({ label, title, desc, onConfirm }: { label: string; title: string; desc: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{label}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SettingsPage() {
  const { settings } = useAppState();
  return (
    <div>
      <PageHeader title="Settings" subtitle="Saved automatically on this device." />
      <div className="glass-card px-5">
        <Row title="Theme" desc="Dark gaming mode or light mode.">
          {(["dark", "light"] as const).map((t) => (
            <Chip key={t} active={settings.theme === t} onClick={() => updateSettings({ theme: t })}>{t === "dark" ? "🌙 Dark" : "☀️ Light"}</Chip>
          ))}
        </Row>
        <Row title="Sound effects" desc="Key clicks, error buzz, completion and achievement sounds.">
          <Switch
            checked={settings.sound}
            onCheckedChange={(v) => {
              updateSettings({ sound: v });
              if (v) sounds.correct();
            }}
            aria-label="Sound effects"
          />
        </Row>
        <Row title="Default test duration" desc="Used by Classic and Library tests.">
          {[15, 30, 60, 120, 0].map((d) => (
            <Chip key={d} active={settings.duration === d} onClick={() => updateSettings({ duration: d })}>{d === 0 ? "Unlimited" : `${d}s`}</Chip>
          ))}
        </Row>
        <Row title="Default difficulty" desc="Starting difficulty for new tests.">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <Chip key={d} active={settings.difficulty === d} onClick={() => updateSettings({ difficulty: d })}>{d.charAt(0).toUpperCase() + d.slice(1)}</Chip>
          ))}
        </Row>
        <Row title="Typing cursor" desc="How the current letter is highlighted.">
          {(["line", "block", "underline"] as CursorStyle[]).map((c) => (
            <Chip key={c} active={settings.cursor === c} onClick={() => updateSettings({ cursor: c })}>{c.charAt(0).toUpperCase() + c.slice(1)}</Chip>
          ))}
        </Row>
        <Row title="Clear saved history" desc="Deletes all test results and daily progress. Keeps XP and badges.">
          <Confirm label="Clear history" title="Clear all test history?" desc="This permanently deletes every saved test result on this device." onConfirm={() => { clearHistory(); toast.success("History cleared"); }} />
        </Row>
        <Row title="Reset statistics" desc="Deletes everything: history, XP, levels and achievements.">
          <Confirm label="Reset everything" title="Reset all statistics?" desc="Your history, XP, level and achievements will be permanently deleted." onConfirm={() => { resetAll(); toast.success("All statistics reset"); }} />
        </Row>
      </div>
    </div>
  );
}

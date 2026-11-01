import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Menu, Volume2, VolumeX, X } from "lucide-react";
import { DynIcon, ProgressBar } from "./ui-bits";
import { updateSettings, useAppState } from "@/lib/typing/store";
import { summarize } from "@/lib/typing/selectors";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/test", label: "Typing Test", icon: "Keyboard" },
  { to: "/modes", label: "Game Modes", icon: "Gamepad2" },
  { to: "/library", label: "Practice Library", icon: "Library" },
  { to: "/daily", label: "Daily Challenge", icon: "CalendarCheck" },
  { to: "/stats", label: "Statistics", icon: "LineChart" },
  { to: "/achievements", label: "Achievements", icon: "Award" },
  { to: "/leaderboard", label: "Leaderboard", icon: "Trophy" },
  { to: "/settings", label: "Settings", icon: "Settings" },
  { to: "/about", label: "About", icon: "Info" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <DynIcon name={n.icon} className="size-4.5 transition-transform group-hover:scale-110" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
        <Keyboard className="size-5 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-bold tracking-tight">TypeMaster</div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Speed Challenge</div>
      </div>
    </Link>
  );
}

function LevelCard() {
  const state = useAppState();
  const { level, streak } = summarize(state);
  return (
    <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Level {level.level}</span>
        <span className="text-muted-foreground">🔥 {streak} day{streak === 1 ? "" : "s"}</span>
      </div>
      <ProgressBar value={level.progress} className="mt-2" />
      <div className="mt-1.5 text-xs text-muted-foreground">
        {state.xp - level.current} / {level.next - level.current} XP to level {level.level + 1}
      </div>
    </div>
  );
}

function SoundToggle() {
  const { settings } = useAppState();
  return (
    <button
      onClick={() => updateSettings({ sound: !settings.sound })}
      className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
      aria-label={settings.sound ? "Turn sound off" : "Turn sound on"}
    >
      {settings.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useAppState();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar/80 p-5 backdrop-blur lg:flex">
        <div className="flex items-center justify-between">
          <Brand />
          <SoundToggle />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <LevelCard />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <SoundToggle />
          <button
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-border"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col gap-5 overflow-y-auto border-l border-sidebar-border bg-sidebar p-5 animate-in slide-in-from-right">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-9 place-items-center rounded-lg border border-border">
                <X className="size-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <LevelCard />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div key={pathname} className="page-enter mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

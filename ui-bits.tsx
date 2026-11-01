import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DynIcon({ name, className }: { name: string; className?: string }) {
  const I = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;
  return <I className={className} />;
}

export function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 400);
      const v = a + (value - a) * (1 - (1 - p) ** 3);
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value]);
  return (
    <>
      {display.toFixed(decimals)}
      {suffix}
    </>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: string;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "primary" | "cyan" | "pink" | "blue" | "success" | "warning";
}) {
  const toneCls = {
    primary: "bg-primary/15 text-primary",
    cyan: "bg-cyan/15 text-cyan",
    pink: "bg-pink/15 text-pink",
    blue: "bg-blue/15 text-blue",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  }[tone];
  return (
    <div className="glass-card card-hover p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className={cn("grid size-10 place-items-center rounded-xl", toneCls)}>
          <DynIcon name={icon} className="size-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-gradient-primary transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow"
          : "border-border bg-card/60 text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Confetti() {
  const colors = ["bg-primary", "bg-cyan", "bg-pink", "bg-blue", "bg-warning"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className={cn("confetti-piece absolute top-0 block h-3 w-1.5 rounded-sm", colors[i % colors.length])}
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.08}s` }}
        />
      ))}
    </div>
  );
}

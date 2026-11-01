import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Flag, RotateCcw, Share2, SkipForward, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnimatedNumber, Confetti, DynIcon } from "./ui-bits";
import { computeStats, performanceRating } from "@/lib/typing/engine";
import { ACCURACY_LIVES, generateText, isEndless, moreWords, MODE_INFO, type TextConfig } from "@/lib/typing/content";
import { saveResult, useAppState, type SaveOutcome } from "@/lib/typing/store";
import { sounds } from "@/lib/typing/sound";
import { cn } from "@/lib/utils";

interface Props {
  config: TextConfig;
  duration: number; // seconds, 0 = unlimited
  onRestart: () => void;
  onNext: () => void;
}

export function TypingTest({ config, duration, onRestart, onNext }: Props) {
  const { settings } = useAppState();
  const soundOn = settings.sound;
  const [target, setTarget] = useState(() => generateText(config));
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [keys, setKeys] = useState(0);
  const [errors, setErrors] = useState(0);
  const [outcome, setOutcome] = useState<(SaveOutcome & { elapsed: number }) | null>(null);
  const [shake, setShake] = useState(false);

  const outcomeRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const live = useRef({ typed, target, keys, errors, startedAt });
  live.current = { typed, target, keys, errors, startedAt };

  const endless = isEndless(config.mode);
  const rush = config.mode === "rush";
  const isAccuracy = config.mode === "accuracy";

  const finish = useCallback(() => {
    const l = live.current;
    if (!l.startedAt || outcomeRef.current) return;
    const elapsed = Date.now() - l.startedAt;
    const capped = duration > 0 ? Math.min(elapsed, duration * 1000) : elapsed;
    const s = computeStats(l.target, l.typed, capped, l.keys, l.errors);
    const res = saveResult({
      wpm: s.wpm,
      rawWpm: s.rawWpm,
      cpm: s.cpm,
      accuracy: s.accuracy,
      duration: Math.round(capped / 100) / 10,
      mistakes: l.errors,
      correctChars: s.correctChars,
      incorrectChars: s.incorrectChars,
      mode: config.mode,
      difficulty: config.difficulty,
    });
    outcomeRef.current = true;
    setOutcome({ ...res, elapsed: capped });
    if (soundOn) {
      sounds.complete();
      if (res.newAchievements.length) setTimeout(sounds.achievement, 600);
    }
    res.newAchievements.forEach((a) => toast.success(`Achievement unlocked: ${a.name}`, { description: `${a.description} +${a.xp} XP` }));
    if (res.levelUp) toast(`🎉 Level up! You reached level ${res.levelUp}`);
    if (res.dailyCompletedNow) toast.success(`Daily challenge complete! +${res.dailyBonus} bonus XP`);
  }, [config.mode, config.difficulty, duration, soundOn]);

  // Timer
  useEffect(() => {
    if (!startedAt || outcome) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (duration > 0 && t - startedAt >= duration * 1000) finish();
    }, 100);
    return () => clearInterval(id);
  }, [startedAt, outcome, duration, finish]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep caret line visible
  useLayoutEffect(() => {
    const box = boxRef.current;
    const caret = caretRef.current;
    if (!box || !caret || rush) return;
    const lineH = caret.offsetHeight || 40;
    box.scrollTop = Math.max(0, caret.offsetTop - lineH);
  }, [typed.length, rush]);

  const handleChange = (raw: string) => {
    if (outcome) return;
    let v = raw.replace(/\n/g, "");
    if (v.length > target.length) v = v.slice(0, target.length);
    let start = startedAt;
    if (!start && v.length > 0) {
      start = Date.now();
      setStartedAt(start);
      setNow(start);
    }
    let addK = 0;
    let addE = 0;
    let lastWrong = false;
    for (let i = typed.length; i < v.length; i++) {
      addK++;
      if (v[i] !== target[i]) {
        addE++;
        lastWrong = true;
      } else lastWrong = false;
    }
    const newErrors = errors + addE;
    setKeys((k) => k + addK);
    setErrors(newErrors);
    setTyped(v);
    live.current = { typed: v, target, keys: keys + addK, errors: newErrors, startedAt: start };

    if (addK > 0 && soundOn) {
      if (lastWrong) sounds.error();
      else if (v[v.length - 1] === " ") sounds.correct();
      else sounds.key();
    }
    if (addE > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 200);
    }
    if (endless && target.length - v.length < 80) {
      const extra = moreWords(config);
      setTarget((t) => t + extra);
      live.current.target = target + extra;
    }
    if (isAccuracy && newErrors >= ACCURACY_LIVES) {
      setTimeout(finish, 0);
      return;
    }
    if (!endless && v.length === target.length) setTimeout(finish, 0);
  };

  const elapsed = outcome ? outcome.elapsed : startedAt ? Math.max(0, now - startedAt) : 0;
  const stats = useMemo(() => computeStats(target, typed, elapsed, keys, errors), [target, typed, elapsed, keys, errors]);
  const remaining = duration > 0 ? Math.max(0, duration - elapsed / 1000) : null;

  if (outcome) {
    return <ResultScreen outcome={outcome} stats={stats} modeName={MODE_INFO[config.mode].name} onRestart={onRestart} onNext={onNext} />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        <LiveStat label="WPM" value={<AnimatedNumber value={stats.wpm} />} accent />
        <LiveStat label="CPM" value={<AnimatedNumber value={stats.cpm} />} />
        <LiveStat label="Accuracy" value={<AnimatedNumber value={stats.accuracy} decimals={1} suffix="%" />} />
        <LiveStat
          label={remaining !== null ? "Time left" : "Elapsed"}
          value={`${Math.ceil(remaining !== null ? remaining : elapsed / 1000)}s`}
          warn={remaining !== null && remaining <= 5 && !!startedAt}
        />
        <LiveStat
          label={isAccuracy ? "Lives" : "Mistakes"}
          value={isAccuracy ? "❤️".repeat(Math.max(0, ACCURACY_LIVES - errors)) || "💔" : errors}
        />
        <LiveStat label="Correct words" value={stats.correctWords} />
        <LiveStat label="Words typed" value={stats.wordsTyped} />
      </div>

      {remaining !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-primary transition-[width] duration-100" style={{ width: `${(remaining / duration) * 100}%` }} />
        </div>
      )}

      <div
        className={cn(
          "glass-card relative cursor-text p-5 sm:p-8 transition-transform",
          shake && "translate-x-0.5",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {rush ? (
          <RushView target={target} typed={typed} />
        ) : (
          <div
            ref={boxRef}
            className="relative max-h-[7.5rem] overflow-hidden font-mono text-xl leading-10 sm:max-h-[7.5rem] sm:text-2xl"
          >
            {Array.from(target).map((ch, i) => {
              const isTyped = i < typed.length;
              const ok = isTyped && typed[i] === ch;
              const current = i === typed.length;
              return (
                <span
                  key={i}
                  ref={current ? caretRef : undefined}
                  className={cn(
                    "relative transition-colors",
                    !isTyped && "text-muted-foreground/60",
                    ok && "text-success",
                    isTyped && !ok && "rounded-sm bg-destructive/20 text-destructive",
                    current && settings.cursor === "block" && "rounded-sm bg-primary/35 text-foreground",
                  )}
                >
                  {current && settings.cursor === "line" && (
                    <span className="caret-blink absolute -left-px top-1.5 bottom-1.5 w-0.5 rounded bg-primary" />
                  )}
                  {current && settings.cursor === "underline" && (
                    <span className="caret-blink absolute inset-x-0 bottom-1 h-0.5 rounded bg-primary" />
                  )}
                  {isTyped && !ok && ch === " " ? "·" : ch}
                </span>
              );
            })}
            {typed.length === target.length && <span ref={caretRef} />}
          </div>
        )}
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
            if (e.key === "Escape") onRestart();
          }}
          aria-label="Type the text shown here"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className="absolute inset-0 h-full w-full cursor-text resize-none opacity-0"
        />
        {!startedAt && (
          <div className="pointer-events-none mt-4 text-center text-sm text-muted-foreground animate-pulse">
            Start typing to begin — the timer starts with your first key
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border px-1.5 py-0.5">Esc</kbd> to restart
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRestart}>
            <RotateCcw /> Restart
          </Button>
          {startedAt && (
            <Button variant="secondary" onClick={finish}>
              <Flag /> Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveStat({ label, value, accent, warn }: { label: string; value: React.ReactNode; accent?: boolean; warn?: boolean }) {
  return (
    <div className={cn("glass-card px-3 py-2.5 text-center", accent && "border-primary/50 shadow-glow")}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("truncate text-xl font-bold tabular-nums", accent && "text-gradient", warn && "text-destructive animate-pulse")}>
        {value}
      </div>
    </div>
  );
}

function RushView({ target, typed }: { target: string; typed: string }) {
  const words = useMemo(() => {
    const out: { start: number; word: string }[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(target))) out.push({ start: m.index, word: m[0] });
    return out;
  }, [target]);
  let idx = words.findIndex((w) => typed.length <= w.start + w.word.length);
  if (idx < 0) idx = words.length - 1;
  const cur = words[idx] ?? { start: 0, word: "" };
  const typedPart = typed.slice(cur.start);
  const prev = words.slice(Math.max(0, idx - 3), idx);
  return (
    <div className="flex min-h-[9rem] flex-col items-center justify-center gap-4">
      <div className="flex gap-2 font-mono text-sm">
        {prev.map((w) => {
          const ok = typed.slice(w.start, w.start + w.word.length) === w.word;
          return (
            <span key={w.start} className={ok ? "text-success" : "text-destructive line-through"}>
              {w.word}
            </span>
          );
        })}
      </div>
      <div key={cur.start} className="font-mono text-4xl font-bold tracking-wide animate-in zoom-in-75 sm:text-5xl">
        {Array.from(cur.word).map((ch, i) => (
          <span
            key={i}
            className={cn(
              i >= typedPart.length ? "text-foreground" : typedPart[i] === ch ? "text-success" : "text-destructive",
              i === typedPart.length && "underline decoration-primary decoration-4 underline-offset-8",
            )}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="flex gap-3 font-mono text-lg text-muted-foreground/60">
        {words.slice(idx + 1, idx + 5).map((w) => (
          <span key={w.start}>{w.word}</span>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">Press space after each word</div>
    </div>
  );
}

function ResultScreen({
  outcome,
  stats,
  modeName,
  onRestart,
  onNext,
}: {
  outcome: SaveOutcome & { elapsed: number };
  stats: ReturnType<typeof computeStats>;
  modeName: string;
  onRestart: () => void;
  onNext: () => void;
}) {
  const r = outcome.result;
  const rating = performanceRating(r.wpm, r.accuracy);
  const celebrate = outcome.isPersonalBest || outcome.newAchievements.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onRestart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRestart]);

  const share = async () => {
    const text = `I just typed ${r.wpm} WPM with ${r.accuracy}% accuracy on TypeMaster (${modeName})! ⌨️⚡`;
    try {
      if (navigator.share) await navigator.share({ title: "My TypeMaster score", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Score copied to clipboard!");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-10 animate-in fade-in zoom-in-95">
      {celebrate && <Confetti />}
      <div className="relative text-center">
        <div className="text-5xl">{rating.emoji}</div>
        <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{modeName} · {rating.label}</div>
        <div className="mt-3 text-7xl font-bold tabular-nums text-gradient sm:text-8xl">
          <AnimatedNumber value={r.wpm} />
        </div>
        <div className="text-muted-foreground">words per minute</div>
        {outcome.isPersonalBest && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-hot px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Trophy className="size-4" /> New personal best! (previous {outcome.previousBest} WPM)
          </div>
        )}
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Accuracy", `${r.accuracy}%`],
          ["CPM", r.cpm],
          ["Mistakes", r.mistakes],
          ["Duration", `${r.duration}s`],
          ["Correct chars", r.correctChars],
          ["Incorrect chars", r.incorrectChars],
          ["Correct words", stats.correctWords],
          ["XP earned", `+${r.xp + outcome.dailyBonus + outcome.newAchievements.reduce((s, a) => s + a.xp, 0)}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-background/40 p-3 text-center">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="text-xl font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      {outcome.newAchievements.length > 0 && (
        <div className="relative mt-6 flex flex-wrap justify-center gap-2">
          {outcome.newAchievements.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-full border border-warning/50 bg-warning/10 px-3 py-1.5 text-sm animate-in zoom-in">
              <DynIcon name={a.icon} className="size-4 text-warning" /> {a.name}
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-8 flex flex-wrap justify-center gap-2">
        <Button variant="hero" size="lg" onClick={onRestart} autoFocus>
          <RotateCcw /> Try Again
        </Button>
        <Button variant="outline" size="lg" onClick={onNext}>
          <SkipForward /> Next Challenge
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/stats">
            <BarChart3 /> View Statistics
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={share}>
          <Share2 /> Share Score
        </Button>
      </div>
    </div>
  );
}

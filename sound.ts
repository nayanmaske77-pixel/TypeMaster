// Tiny Web Audio synth — no audio files needed.
let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.05, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sounds = {
  key: () => tone(1800 + Math.random() * 300, 0.03, "square", 0.015),
  correct: () => tone(880, 0.05, "triangle", 0.03),
  error: () => tone(160, 0.12, "sawtooth", 0.04),
  complete: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.05, i * 0.1)),
  achievement: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, "sine", 0.06, i * 0.08)),
};

"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";

const REPLIES = {
  short: "Sure, I can check that. Your next EMI of ₹12,450 is due on 5 December, and auto-debit is active. Shall I send you a reminder the day before?",
  long: "Sure, let me quickly pull up your loan account and look at the repayment schedule that is currently on file for you. Your next EMI of ₹12,450 is due on 5 December. Shall I send a reminder?",
};
const TTS_FIRST_CHUNK = 80; // ms for streaming TTS to return its first audio chunk
const fmt = (ms: number) => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`);

function useModel(ttft: number, tps: number, open: "short" | "long") {
  return useMemo(() => {
    const tokens = REPLIES[open].match(/\S+\s*/g) ?? [];
    const at = tokens.map((_, i) => ttft + (i * 1000) / tps);
    const firstEnd = tokens.findIndex((t) => /[.?!]\s*$/.test(t));
    const ttfs = at[firstEnd] + 1000 / tps;
    const full = at[at.length - 1] + 1000 / tps;
    const speakA = ttfs + TTS_FIRST_CHUNK;
    const speakB = full + TTS_FIRST_CHUNK;
    const end = speakB + Math.min((tokens.length / 2.5) * 1000, 900);
    return { tokens, at, firstEnd, ttfs, full, speakA, speakB, end, ttft };
  }, [ttft, tps, open]);
}

export function Playground() {
  const [ttft, setTtft] = useState(50);
  const [tps, setTps] = useState(45);
  const [open, setOpen] = useState<"short" | "long">("short");
  const [slow, setSlow] = useState(true);
  const m = useModel(ttft, tps, open);
  const [t, setT] = useState<number>(Infinity); // Infinity = resting (finished) state
  const raf = useRef(0);

  // Changing a knob resets to the finished (resting) state; adjust during render, not in an effect.
  const [prevModel, setPrevModel] = useState(m);
  if (prevModel !== m) { setPrevModel(m); setT(Infinity); }
  useEffect(() => () => cancelAnimationFrame(raf.current), [m]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const play = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(Infinity); return; }
    const speed = slow ? 1 / 3 : 1;
    const start = performance.now();
    const frame = (now: number) => {
      const tt = (now - start) * speed;
      if (tt >= m.end) { setT(Infinity); return; }
      setT(tt);
      raf.current = requestAnimationFrame(frame);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(frame);
  }, [m, slow]);

  const now = Math.min(t, m.end);
  const playing = Number.isFinite(t);
  const pct = (ms: number) => `${(Math.max(0, Math.min(1, ms / m.end)) * 100).toFixed(2)}%`;
  const seg = (from: number, to: number) => ({ left: pct(from), width: `calc(${pct(Math.max(from, to))} - ${pct(from)})` });
  const ticks: number[] = [];
  const step = m.end > 3000 ? 1000 : m.end > 1400 ? 500 : 250;
  for (let v = 0; v <= m.end * 0.94; v += step) ticks.push(v);

  const lanes = [
    { name: "LLM tokens", info: `TTFT ${fmt(m.ttft)} · TTFS ${fmt(m.ttfs)}`, wait: m.ttft, fill: m.full, kind: "gen" as const },
    { name: "Voice, sentence-chunked", info: `speaks at ${fmt(m.speakA)}`, wait: m.speakA, kind: "talk" as const },
    { name: "Voice, wait for full reply", info: `speaks at ${fmt(m.speakB)}`, wait: m.speakB, kind: "talk" as const },
  ];

  return (
    <div className="grid gap-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h4 className="text-lg font-semibold tracking-tight">Same reply, two ways to speak it.</h4>
          <p className="mt-1 text-sm text-muted">One pipeline speaks at the first full sentence; the other waits for the whole reply. Change the knobs and press play.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={play} disabled={playing} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-transform active:scale-[0.97] disabled:opacity-70">
            <Icon name="play" className="size-3.5" />{playing ? "Playing…" : "Play"}
          </button>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} className="size-4 accent-[var(--accent)]" />
            Slow motion (⅓ speed)
          </label>
        </div>
      </div>

      <div className="grid gap-5 border-y border-line py-5 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium">
          <span className="flex justify-between">Time to first token <output className="font-mono text-xs text-muted">{ttft} ms</output></span>
          <input type="range" min={20} max={800} step={10} value={ttft} onChange={(e) => setTtft(+e.target.value)} className="h-11 w-full accent-[var(--accent)]" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          <span className="flex justify-between">Generation speed <output className="font-mono text-xs text-muted">{tps} tok/s</output></span>
          <input type="range" min={15} max={150} step={5} value={tps} onChange={(e) => setTps(+e.target.value)} className="h-11 w-full accent-[var(--accent)]" />
        </label>
        <fieldset className="grid gap-2 text-sm font-medium">
          <legend className="mb-2">Opening sentence</legend>
          <div className="inline-flex w-max rounded-xl bg-fill p-0.5">
            {(["short", "long"] as const).map((o) => (
              <label key={o} className={`flex min-h-11 cursor-pointer items-center rounded-[10px] px-4 capitalize transition-colors ${open === o ? "bg-surface text-ink shadow-sm" : "text-muted"}`}>
                <input type="radio" name="opening" value={o} checked={open === o} onChange={() => setOpen(o)} className="sr-only" />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="min-h-[3.4em] text-[17px] leading-relaxed">
        {m.tokens.map((tok, i) => (
          <span key={i} className={`transition-colors duration-200 ${i <= m.firstEnd ? "rounded bg-accent-soft underline decoration-accent decoration-2 underline-offset-4" : ""} ${playing && m.at[i] > now ? "text-line" : ""}`}>{tok}</span>
        ))}
      </p>

      <div className="relative grid gap-4">
        {lanes.map((l) => (
          <div key={l.name} className="grid gap-1.5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-5">
            <div className="flex justify-between gap-2 text-sm sm:flex-col sm:gap-0">
              <b className="font-medium">{l.name}</b>
              <span className="font-mono text-xs tabular-nums text-muted">{l.info}</span>
            </div>
            <div className="relative h-6 overflow-hidden rounded-md bg-fill">
              <div className="absolute inset-y-0 bg-[repeating-linear-gradient(-45deg,transparent_0_4px,color-mix(in_srgb,var(--muted)_20%,transparent)_4px_8px)]" style={seg(0, Math.min(now, l.wait))} />
              {l.kind === "gen" ? (
                <>
                  <div className="absolute inset-y-0 bg-accent" style={seg(l.wait, Math.min(now, l.fill!))} />
                  {now >= m.ttfs && <i className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-signal" style={{ left: pct(m.ttfs) }} title="first sentence complete" />}
                </>
              ) : (
                <div className="absolute inset-y-0 bg-[repeating-linear-gradient(90deg,var(--accent)_0_2px,transparent_2px_5px)] opacity-85" style={seg(l.wait, Math.min(now, m.end))} />
              )}
            </div>
          </div>
        ))}
        <div className="relative h-4 font-mono text-xs text-muted sm:ml-[220px]" aria-hidden="true">
          {ticks.map((v) => (
            <span key={v} className={`absolute ${v ? "-translate-x-1/2" : ""}`} style={{ left: pct(v) }}>{v === 0 ? "0" : v < 1000 ? `${v} ms` : `${v / 1000} s`}</span>
          ))}
        </div>
      </div>

      <p className="text-lg font-medium tracking-tight text-balance">
        Chunking by sentence starts the voice <b className="font-semibold text-accent">{fmt(m.speakB - m.speakA)} sooner</b>. TTFT is {fmt(m.ttft)} either way, which is why it&apos;s the wrong number to watch.
      </p>
      <p className="text-xs text-muted">Model: first audio = time to speakable text + ~80 ms for streaming TTS to return its first chunk. Speech plays at ~2.5 words/s.</p>
    </div>
  );
}

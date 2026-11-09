"use client";
import { motion } from "motion/react";
import type { ChapterVisual } from "@/lib/content";
import { Icon } from "./Icon";

const ease = [0.23, 1, 0.32, 1] as const;
const item = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease, delay: 0.08 + i * 0.08 },
});

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

/* 01 · three growing pressures */
function Pressure() {
  const rows = [
    { k: "API bill", v: "grows with every call", bar: [30, 45, 62, 80, 100] },
    { k: "Caller data", v: "leaves our infrastructure", bar: [40, 55, 70, 85, 100] },
    { k: "Outages & rate limits", v: "outside our control", bar: [20, 70, 35, 90, 55] },
  ];
  return (
    <Frame label="Third-party API at millions of calls a day">
      <div className="grid gap-5">
        {rows.map((r, i) => (
          <motion.div key={r.k} {...item(i)} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <b className="font-semibold">{r.k}</b>
              <span className="text-sm text-muted">{r.v}</span>
            </div>
            <div className="flex h-10 items-end gap-1.5">
              {r.bar.map((h, j) => (
                <motion.i
                  key={j}
                  className={`flex-1 rounded-sm ${i === 2 && h > 60 ? "bg-[#e5484d]/70" : "bg-accent/70"}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.08 + j * 0.05 }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

/* 02 · TTFT vs TTFS */
function Measure() {
  const rows = [
    { k: "First token", sub: "what dashboards showed", v: "50 ms", w: 50 / 2000 },
    { k: "First sentence", sub: "what callers feel (p95)", v: "0.3 s", w: 300 / 2000 },
    { k: "First sentence", sub: "slow tail (p99)", v: "0.6 s", w: 600 / 2000 },
  ];
  return (
    <Frame label="Pick the number callers feel">
      <div className="grid gap-5">
        {rows.map((r, i) => (
          <motion.div key={r.sub} {...item(i)} className="grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-2">
            <span><b className="font-semibold">{r.k}</b> <span className="text-sm text-muted">· {r.sub}</span></span>
            <span className="display-md text-2xl tabular-nums">{r.v}</span>
            <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-fill">
              <motion.i className={`block h-full rounded-full ${i ? "bg-accent" : "bg-muted/50"}`} initial={{ width: 0 }} animate={{ width: `${Math.max(r.w * 100, 2)}%` }} transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.1 }} />
            </div>
          </motion.div>
        ))}
        <motion.p {...item(3)} className="text-sm text-muted">Scale: 0–2 s. TTS can only start speaking once a full sentence exists.</motion.p>
      </div>
    </Frame>
  );
}

/* 03 · router → GPU nodes */
function Host() {
  const nodes = ["vLLM · H200", "vLLM · H200", "vLLM · H200"];
  return (
    <Frame label="Inside our infrastructure">
      <div className="relative rounded-2xl border border-dashed border-line p-5">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <motion.div {...item(0)} className="grid justify-items-center gap-1.5 text-center text-sm">
            <span className="grid size-12 place-items-center rounded-xl bg-fill"><Icon name="mic" className="size-6" /></span>
            Calls
          </motion.div>
          <svg viewBox="0 0 100 60" className="h-24 w-full overflow-visible" aria-hidden="true">
            {[10, 30, 50].map((y, i) => (
              <motion.path key={y} d={`M0 30 C 40 30, 60 ${y}, 100 ${y}`} fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="3 3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease, delay: 0.25 + i * 0.1 }} />
            ))}
            <motion.rect x="34" y="20" width="32" height="20" rx="5" fill="var(--surface)" stroke="var(--accent)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
            <text x="50" y="33" textAnchor="middle" fontSize="6.5" fill="var(--ink)" fontWeight="600">HAProxy</text>
          </svg>
          <div className="grid gap-2">
            {nodes.map((n, i) => (
              <motion.div key={i} {...item(i + 1)} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                <Icon name="server" className="size-4 text-accent" />{n}
              </motion.div>
            ))}
          </div>
        </div>
        <span className="absolute -top-3 right-4 bg-[var(--surface)] px-2 font-mono text-xs text-muted">our infra</span>
      </div>
    </Frame>
  );
}

/* 04 · leaking stream → guardrails */
function Leak() {
  const guards = ["Thinking-token suppression", "Repetition control", "PII redaction", "Content filtering", "Prompt adherence"];
  return (
    <Frame label="Illustrative output stream">
      <motion.p {...item(0)} className="rounded-2xl border border-line bg-bg p-4 font-mono text-[13px] leading-relaxed">
        Sure. <span className="rounded bg-[#e5484d]/15 text-[#e5484d] line-through decoration-2">&lt;think&gt;caller wants the EMI date, check the schedule…&lt;/think&gt;</span>{" "}
        Your next EMI is due on 5 December.{" "}
        <span className="rounded bg-[#e5484d]/15 text-[#e5484d] line-through decoration-2">Your next EMI is due on 5 December.</span>
      </motion.p>
      <div className="mt-5 flex flex-wrap gap-2">
        {guards.map((g, i) => (
          <motion.span key={g} {...item(i + 1)} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent">
            <Icon name="shield" className="size-4" />{g}
          </motion.span>
        ))}
      </div>
      <motion.p {...item(6)} className="mt-4 text-sm text-muted">All layers run on the stream, inside the latency budget.</motion.p>
    </Frame>
  );
}

/* 05 · shadow traffic */
function Shadow() {
  return (
    <Frame label="Mirror, compare, then switch">
      <div className="grid gap-3">
        <motion.div {...item(0)} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
          <span className="grid size-9 place-items-center rounded-lg bg-fill"><Icon name="mic" className="size-5" /></span>
          <b className="font-semibold">Live call</b>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          <motion.div {...item(1)} className="grid gap-1 rounded-xl border border-line bg-surface p-3 text-sm">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">Old API</span>
            <b className="font-semibold">Answers the caller</b>
          </motion.div>
          <motion.div {...item(2)} className="grid gap-1 rounded-xl border border-dashed border-accent bg-accent-soft p-3 text-sm">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-accent">Self-hosted · shadow</span>
            <b className="font-semibold">Answer logged, never used</b>
          </motion.div>
        </div>
        <motion.div {...item(3)} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-fill p-3 text-sm">
          <span>Compare <b className="font-semibold">quality</b> and <b className="font-semibold">latency</b></span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-signal"><span className="size-2 rounded-full bg-signal" />Matched or beat → switch</span>
        </motion.div>
      </div>
    </Frame>
  );
}

/* 06 · results */
function Result() {
  const stats = [
    { v: "~40%", k: "lower inference cost" },
    { v: "0", k: "caller data leaving our infra" },
    { v: "0.3 s", k: "p95 time to first sentence" },
    { v: "Millions", k: "of calls a day, self-hosted" },
  ];
  return (
    <Frame label="After the switch">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.k} {...item(i)} className="grid gap-1 rounded-2xl border border-line bg-surface p-4">
            <span className="display-md grad-text w-max max-w-full text-[clamp(1.6rem,3vw,2.4rem)] tabular-nums">{s.v}</span>
            <span className="text-sm text-muted">{s.k}</span>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function StoryVisual({ kind }: { kind: ChapterVisual }) {
  switch (kind) {
    case "pressure": return <Pressure />;
    case "measure": return <Measure />;
    case "host": return <Host />;
    case "leak": return <Leak />;
    case "shadow": return <Shadow />;
    case "result": return <Result />;
  }
}

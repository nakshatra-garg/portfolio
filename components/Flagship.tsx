"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Rich } from "./Rich";
import { flagship } from "@/lib/content";
import { Playground } from "./Playground";

const SCALE = 2000; // ms, the right edge of the chart
const ease = [0.23, 1, 0.32, 1] as const;

export function Flagship() {
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    const onOpen = () => setDemo(true);
    window.addEventListener("open-demo", onOpen);
    return () => window.removeEventListener("open-demo", onOpen);
  }, []);
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease }}
      className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 sm:p-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_22%,transparent),transparent)]" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="display-md text-5xl text-line sm:text-6xl" aria-hidden="true">01</span>
        <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-tint text-white"><Icon name="server" className="size-6" /></span>
        <span className="eyebrow">{flagship.label}</span>
        <span className="ml-auto rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">{flagship.metric}</span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div className="grid content-start gap-4">
          <h3 className="display-md text-[clamp(1.7rem,3.2vw,2.6rem)] text-balance">{flagship.title}</h3>
          <p className="text-muted"><Rich text={flagship.desc} /></p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Tools">
            {flagship.tags.map((t) => <li key={t} className="rounded-md bg-fill px-2 py-0.5 text-xs text-muted">{t}</li>)}
          </ul>
        </div>

        <div className="grid content-start gap-3">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }} className="grid gap-2.5 rounded-2xl bg-bg p-4 sm:p-5" aria-label="Production latency, drawn to scale from 0 to 2 seconds">
            {flagship.latency.map((r, i) => (
              <div key={r.label} className="grid grid-cols-[112px_1fr_56px] items-center gap-3 text-[13px] sm:grid-cols-[136px_1fr_60px]">
                <span className="text-muted">{r.label}</span>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-fill">
                  <motion.i
                    className="absolute inset-y-0 left-0 origin-left rounded-full bg-accent"
                    style={{ width: `${(r.value / SCALE) * 100}%` }}
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease, delay: 0.15 + i * 0.08 } } }}
                  />
                  {r.to && (
                    <motion.i
                      className="absolute inset-y-0 origin-left rounded-r-full bg-accent/35"
                      style={{ left: `${(r.value / SCALE) * 100}%`, width: `${((r.to - r.value) / SCALE) * 100}%` }}
                      variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease, delay: 0.7 } } }}
                    />
                  )}
                </div>
                <b className="text-right font-semibold tabular-nums">{r.shown}</b>
              </div>
            ))}
            <div className="grid grid-cols-[112px_1fr_56px] gap-3 text-xs text-muted sm:grid-cols-[136px_1fr_60px]" aria-hidden="true">
              <span />
              <div className="relative h-4">
                {[0, 0.5, 1, 1.5, 2].map((s) => (
                  <span key={s} className={`absolute whitespace-nowrap ${s === 0 ? "" : s === 2 ? "-translate-x-full" : "-translate-x-1/2"} ${s === 0.5 || s === 1.5 ? "max-sm:hidden" : ""}`} style={{ left: `${(s / 2) * 100}%` }}>{s === 0 ? "0" : `${s} s`}</span>
                ))}
              </div>
              <span />
            </div>
          </motion.div>
          <p className="text-sm text-muted"><Rich text={flagship.note} /></p>
          <button
            type="button"
            onClick={() => setDemo((d) => !d)}
            aria-expanded={demo}
            aria-controls="playground"
            className={`inline-flex min-h-11 w-max items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,color,border-color,transform] active:scale-[0.97] ${demo ? "border-transparent bg-accent-soft text-accent" : "border-line hover:border-muted"}`}
          >
            <Icon name="play" className="size-3.5" />
            {demo ? "Hide the latency demo" : "Try the latency demo"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {demo && (
          <motion.div
            id="playground"
            key="pg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <div className="mt-8 border-t border-line pt-6">
              <Playground />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}


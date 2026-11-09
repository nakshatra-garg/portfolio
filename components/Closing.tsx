"use client";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Icon } from "./Icon";
import { asset, GITHUB, LINKEDIN, MAILTO, RESUME } from "@/lib/site";

function Magnet() {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });
  const ix = useTransform(x, (v) => v * 0.4), iy = useTransform(y, (v) => v * 0.4);

  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const active = fine && !reduce;

  return (
    <div
      className="-m-10 p-10"
      onPointerMove={(e) => {
        if (!active || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
        my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
    >
      <motion.a
        ref={ref}
        href={MAILTO}
        style={active ? { x, y } : undefined}
        whileHover={active ? { scale: 1.05 } : undefined}
        whileTap={{ scale: 0.97 }}
        className="grid size-32 place-items-center rounded-full bg-[#1a66de] font-semibold text-white shadow-[0_16px_40px_rgba(26,102,222,0.45)] sm:size-36"
      >
        <motion.span style={active ? { x: ix, y: iy } : undefined} className="grid justify-items-center gap-1.5 text-sm">
          <Icon name="mail" className="size-6" />
          Email me
        </motion.span>
      </motion.a>
    </div>
  );
}

function LocalTime() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <time suppressHydrationWarning className="tabular-nums">{t ?? "--:--"}</time>;
}

export function Closing() {
  const pill = "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-[#f2f4f7] transition-[background-color,border-color,transform] hover:border-white/40 hover:bg-white/5 active:scale-[0.97]";
  return (
    <footer aria-labelledby="closing-title" className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8">
      <div className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0b0d] p-7 text-[#f2f4f7] sm:p-12 [background-image:radial-gradient(60%_80%_at_100%_0%,rgba(90,162,255,0.24),transparent_60%),radial-gradient(50%_70%_at_0%_100%,rgba(60,212,200,0.15),transparent_60%)]">
        <span aria-hidden="true" className="display pointer-events-none absolute -bottom-[0.18em] -left-[0.04em] -z-10 select-none whitespace-nowrap text-[clamp(4rem,14vw,11rem)] uppercase text-transparent [-webkit-text-stroke:1px_rgba(242,244,247,0.12)]">Nakshatra Garg</span>
        <h2 id="closing-title" className="display-md text-[clamp(2.2rem,6vw,4.75rem)] uppercase">
          Let&apos;s talk<br />
          <span className="bg-gradient-to-r from-[#5aa2ff] to-[#3cd4c8] bg-clip-text text-transparent">LLMs &amp; voice AI.</span>
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-8">
          <div className="flex flex-wrap gap-2">
            <a className={pill} href={LINKEDIN} target="_blank" rel="noopener me"><Icon name="linkedin" className="size-4" />LinkedIn</a>
            <a className={pill} href={GITHUB} target="_blank" rel="noopener me"><Icon name="github" className="size-4" />GitHub</a>
            <a className={pill} href={asset(RESUME)} download="Nakshatra_Garg_Resume.pdf"><Icon name="download" className="size-4" />Résumé</a>
          </div>
          <Magnet />
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 text-sm sm:grid-cols-4">
          <div><dt className="font-mono text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Location</dt><dd className="mt-1">Noida, India</dd></div>
          <div><dt className="font-mono text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Local time</dt><dd className="mt-1"><LocalTime /> IST</dd></div>
          <div><dt className="font-mono text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Edition</dt><dd className="mt-1">2026</dd></div>
          <div className="flex items-end sm:justify-end"><a href="#top" className="inline-flex min-h-11 items-center">Back to top ↑</a></div>
        </dl>
      </div>
      <p className="mt-6 text-center text-xs text-muted">© 2026 Nakshatra Garg · Built with Next.js</p>
    </footer>
  );
}

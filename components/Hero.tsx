"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { AskBox } from "./AskBox";
import { person, stats } from "@/lib/content";
import { asset, MAILTO, RESUME } from "@/lib/site";

const ease = [0.23, 1, 0.32, 1] as const;

function LocalTime() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <time suppressHydrationWarning>{t ?? "--:--"}</time>;
}

/** A line of display type that slides up from behind a mask. */
function MaskLine({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Headline that reveals word by word; **bold** words get the accent gradient. */
function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const tokens = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).flatMap((chunk) => {
    const bold = chunk.startsWith("**");
    return chunk.replace(/\*\*/g, "").split(" ").filter(Boolean).map((w) => ({ w, bold }));
  });
  return (
    <>
      {tokens.map(({ w, bold }, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span
            className={`inline-block ${bold ? "grad-text font-semibold" : ""}`}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.7, ease, delay: delay + i * 0.035 }}
          >
            {w}
          </motion.span>
          {i < tokens.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-name" className="relative mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-36">
      {/* soft colour wash */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[640px] w-screen -translate-x-1/2 bg-[radial-gradient(30%_45%_at_75%_25%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%),radial-gradient(28%_40%_at_15%_60%,color-mix(in_srgb,var(--tint)_12%,transparent),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2"
      >
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-signal" />
          {person.role} — {person.focus}
        </span>
        <span>
          {person.location} · <LocalTime /> IST
        </span>
      </motion.div>

      <h1 id="hero-name" className="display mt-6 text-[clamp(2.4rem,10.4vw,8.4rem)] uppercase">
        <MaskLine delay={0.05}>{person.first}</MaskLine>
        <MaskLine delay={0.15} className="outline-text">{person.last}</MaskLine>
      </h1>

      <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[1.25fr_1fr] md:items-end">
        <p className="text-[clamp(1.4rem,2.6vw,2.1rem)] font-medium leading-[1.2] tracking-[-0.025em] text-balance">
          <WordReveal text={person.headline} delay={0.35} />
        </p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.75 }}
          className="flex flex-wrap gap-2.5 md:justify-end"
        >
          <a href="#work" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-medium text-on-accent transition-transform active:scale-[0.97]">
            See the work
            <Icon name="arrowDown" className="size-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <a href={asset(RESUME)} download="Nakshatra_Garg_Resume.pdf" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-5 font-medium transition-[transform,border-color] hover:border-muted active:scale-[0.97]">
            <Icon name="download" className="size-4" />
            Résumé
          </a>
          <a href={MAILTO} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-5 font-medium transition-[transform,border-color] hover:border-muted active:scale-[0.97]">
            <Icon name="mail" className="size-4" />
            Email me
          </a>
        </motion.div>
      </div>

      <motion.dl
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.9 }}
        className="mt-12 grid grid-cols-2 border-y border-line md:grid-cols-4"
      >
        {stats.map((s, i) => (
          <div key={s.label} className={`flex flex-col-reverse gap-1 py-5 pr-4 ${i % 2 ? "pl-4 md:pl-6" : "md:pl-6"} ${i ? "md:border-l md:border-line" : "md:pl-0"} ${i % 2 ? "border-l border-line md:border-l" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""}`}>
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="display-md text-[clamp(2rem,4.2vw,3.25rem)] tabular-nums">{s.value}</dd>
          </div>
        ))}
      </motion.dl>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 1.0 }}>
        <AskBox />
      </motion.div>
    </section>
  );
}

"use client";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";
import { Rich } from "./Rich";
import { StoryVisual } from "./StoryVisuals";
import { story } from "@/lib/content";

const ease = [0.23, 1, 0.32, 1] as const;

export function Story() {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 60%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // The chapter crossing the middle of the screen is the active one.
  useEffect(() => {
    const els = [...(list.current?.querySelectorAll<HTMLElement>("[data-chapter]") ?? [])];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.chapter))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const ch = story.chapters[active];

  return (
    <section id="approach" aria-labelledby="approach-title" className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <Reveal className="mb-14 grid max-w-3xl gap-4 md:mb-20">
        <span className="eyebrow">{story.eyebrow}</span>
        <h2 id="approach-title" className="display-md text-[clamp(2rem,4.8vw,3.75rem)] text-balance">
          How we moved <span className="grad-text">millions of calls</span> off a third-party LLM API.
        </h2>
        <p className="text-lg text-muted text-pretty">{story.intro}</p>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        {/* Chapters */}
        <div className="relative">
          {/* progress rail */}
          <div aria-hidden="true" className="absolute bottom-0 left-[11px] top-0 hidden w-px bg-line lg:block">
            <motion.i className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-accent to-tint" style={{ scaleY: progress }} />
          </div>
          <ol ref={list} className="grid gap-16 lg:gap-0">
            {story.chapters.map((c, i) => {
              const on = i === active;
              return (
                <li key={c.id} data-chapter={i} className="relative lg:flex lg:min-h-[52vh] lg:items-center lg:pl-12">
                  {/* step dot */}
                  <span aria-hidden="true" className={`absolute left-0 top-1/2 hidden size-[23px] -translate-y-1/2 place-items-center rounded-full border-2 transition-colors duration-300 lg:grid ${on ? "border-accent bg-accent text-on-accent" : "border-line bg-bg text-muted"}`}>
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  </span>
                  <div className={`grid gap-3 transition-opacity duration-500 lg:max-w-md ${on ? "lg:opacity-100" : "lg:opacity-35"}`}>
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
                      {String(i + 1).padStart(2, "0")} · {c.kicker}
                    </span>
                    <h3 className="display-md text-[clamp(1.5rem,2.6vw,2.1rem)] text-balance">{c.title}</h3>
                    <p className="text-[17px] leading-relaxed text-muted text-pretty"><Rich text={c.body} /></p>
                    {/* phones and tablets: the visual sits with its chapter */}
                    <div className="mt-4 rounded-3xl border border-line bg-surface p-5 lg:hidden">
                      <StoryVisual kind={c.visual} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Pinned visual (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-[calc(50vh-230px)] h-[460px] overflow-hidden rounded-[28px] border border-line bg-surface p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_16%,transparent),transparent)]" />
            <div className="absolute right-6 top-6 font-mono text-xs tabular-nums text-muted" aria-hidden="true">
              <b className="text-ink">{String(active + 1).padStart(2, "0")}</b> / {String(story.chapters.length).padStart(2, "0")}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={ch.id}
                className="relative h-full"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.28, ease }}
                aria-live="polite"
              >
                <StoryVisual kind={ch.visual} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

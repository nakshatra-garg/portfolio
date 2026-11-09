"use client";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Icon } from "./Icon";
import { Rich } from "./Rich";
import { projects } from "@/lib/content";

/**
 * Pinned horizontal rail on large screens: the section is as tall as the
 * horizontal distance to travel, and vertical scroll drives the sideways motion.
 * Below 1024px (or with Reduce Motion) the same markup is a plain grid.
 */
export function WorkRail() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // Pinned rail only on wide screens without Reduce Motion.
  const wide = useMediaQuery("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
  const [measured, setDist] = useState(0);
  const dist = wide ? measured : 0;
  const [index, setIndex] = useState(1);

  // 2) Once the horizontal layout is rendered, measure how far it has to travel.
  useLayoutEffect(() => {
    if (!wide) return;
    const measure = () => {
      const el = track.current;
      setDist(el ? Math.max(0, el.scrollWidth - window.innerWidth) : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [wide]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });
  const x = useTransform(smooth, (v) => -v * dist);
  useMotionValueEvent(scrollYProgress, "change", (v) => setIndex(Math.min(projects.length, Math.max(1, Math.round(v * (projects.length - 1)) + 1))));

  const pinned = wide;

  return (
    <section
      ref={section}
      aria-labelledby="rail-title"
      className="relative"
      style={pinned && dist ? { height: `calc(100vh + ${dist}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : ""}>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <span className="eyebrow">More systems I&apos;ve shipped</span>
            <h3 id="rail-title" className="display-md mt-3 text-[clamp(1.8rem,3.6vw,2.75rem)] uppercase">Selected work</h3>
          </div>
          {!pinned && <span className="font-mono text-xs text-muted" aria-hidden="true">Swipe →</span>}
          {pinned && (
            <div className="flex items-center gap-4 font-mono text-sm text-muted" aria-hidden="true">
              <span className="tabular-nums"><b className="text-ink">{String(index).padStart(2, "0")}</b> / {String(projects.length).padStart(2, "0")}</span>
              <span className="relative h-px w-28 bg-line"><motion.i className="absolute inset-0 origin-left bg-accent" style={{ scaleX: smooth }} /></span>
              <span className="flex items-center gap-1">Scroll <Icon name="send" className="size-3.5" /></span>
            </div>
          )}
        </div>

        <div className={pinned ? "mt-10 w-full" : "mx-auto mt-8 max-w-6xl"}>
          <motion.div
            ref={track}
            style={pinned ? { x } : undefined}
            className={pinned
              ? "flex w-max gap-5 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-[max(2rem,calc((100vw-72rem)/2+2rem))]"
              : "flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] sm:scroll-px-8 sm:px-8"}
          >
            {projects.map((p, i) => (
              <motion.article
                key={p.slug}
                id={`project-${p.slug}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px -4% -8% 0px" }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className={`group relative flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--line))] ${pinned ? "min-h-[440px] w-[380px] shrink-0" : "w-[84%] max-w-[380px] shrink-0 snap-start"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="display-md text-3xl text-line transition-colors group-hover:text-accent" aria-hidden="true">{String(i + 2).padStart(2, "0")}</span>
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name={p.icon} className="size-5" /></span>
                  <span className="ml-auto text-xs font-semibold text-accent">{p.label}</span>
                </div>
                <h4 className="mt-2 text-xl font-semibold leading-snug tracking-tight">{p.title}</h4>
                <p className="display-md grad-text w-max max-w-full text-2xl">{p.metric}</p>
                <p className="text-[15px] leading-relaxed text-muted"><Rich text={p.desc} /></p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Tools">
                  {p.tags.map((t) => <li key={t} className="rounded-md bg-fill px-2 py-0.5 text-xs text-muted">{t}</li>)}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

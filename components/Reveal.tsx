"use client";
import { motion } from "motion/react";

/** Fades and lifts content into place the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className = "", as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </M>
  );
}

export function SectionTitle({ eyebrow, title, id, children }: { eyebrow: string; title: React.ReactNode; id: string; children?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 grid gap-4 md:mb-14">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="display-md text-[clamp(2.2rem,5.5vw,4.25rem)] uppercase text-balance">{title}</h2>
      {children}
    </Reveal>
  );
}

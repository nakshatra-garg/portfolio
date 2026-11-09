"use client";
import { motion } from "motion/react";
import { Icon } from "./Icon";
import { Reveal, SectionTitle } from "./Reveal";
import { certFeatured, certMore, education, honors, languages, publication } from "@/lib/content";

const ease = [0.23, 1, 0.32, 1] as const;

function Credential({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <Reveal delay={delay} className={`group relative overflow-hidden rounded-3xl border border-line bg-surface transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--line))] ${className}`}>
      {children}
    </Reveal>
  );
}

export function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <SectionTitle eyebrow="Education & credentials" id="education-title" title={<>Learning that <span className="grad-text">backs the work.</span></>} />

      {/* Degrees */}
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((e, i) => (
          <Credential key={e.level} delay={i * 0.06} className="p-7 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_14%,transparent),transparent)]" />
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name="cap" className="size-6" /></span>
              <span className="font-mono text-sm tabular-nums text-muted">{e.years}</span>
            </div>
            <h3 className="display-md mt-7 text-[clamp(2.4rem,4.6vw,3.5rem)]">{e.level}</h3>
            <p className="mt-2 text-lg font-medium leading-snug tracking-tight">
              {e.field}
              {e.focus && <span className="ml-2 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 align-[2px] text-xs font-semibold text-accent">{e.focus}</span>}
            </p>
            <p className="mt-1 text-muted">{e.school}</p>

            <div className="mt-8 border-t border-line pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow">CGPA</span>
                <span className="display-md text-4xl tabular-nums">
                  {e.cgpa.toFixed(1)}<span className="ml-1 text-lg font-semibold text-muted">/ 10</span>
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fill" role="img" aria-label={`CGPA ${e.cgpa} out of 10`}>
                <motion.i
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-accent to-tint"
                  style={{ width: `${e.cgpa * 10}%` }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease, delay: 0.2 + i * 0.1 }}
                />
              </div>
            </div>
          </Credential>
        ))}
      </div>

      {/* Publication */}
      <Credential delay={0.05} className="mt-4 p-7 sm:p-9">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-tint text-white"><Icon name="book" className="size-6" /></span>
            <span className="eyebrow">Published research</span>
          </div>
          <div>
            <h3 className="display-md text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.15] text-balance">{publication.title}</h3>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics">
              {publication.topics.map((t) => <li key={t} className="rounded-full bg-fill px-3 py-1 text-sm text-muted">{t}</li>)}
            </ul>
          </div>
        </div>
      </Credential>

      {/* Certifications */}
      <Reveal className="mb-6 mt-20 flex flex-wrap items-end justify-between gap-3">
        <h3 className="display-md text-[clamp(1.6rem,3vw,2.4rem)] uppercase">Certifications</h3>
        <span className="eyebrow">Most relevant first</span>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {certFeatured.map((c, i) => (
          <Credential key={c.name} delay={i * 0.06} className="flex flex-col gap-6 p-7">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent"><Icon name="award" className="size-6" /></span>
              <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-accent">{c.topic}</span>
            </div>
            <div>
              <h4 className="display-md text-[clamp(1.35rem,2.2vw,1.75rem)] leading-[1.15] text-balance">{c.name}</h4>
              {c.issuer && <p className="mt-2 font-mono text-sm uppercase tracking-[0.08em] text-muted">{c.issuer}</p>}
            </div>
          </Credential>
        ))}
      </div>

      <Reveal className="mt-4">
        <ul className="grid divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {certMore.map((c) => (
            <li key={c.name} className="grid items-center gap-x-6 gap-y-1 px-6 py-4 sm:grid-cols-[1fr_auto] sm:px-7">
              <span className="flex items-center gap-3">
                <Icon name="award" className="size-[18px] shrink-0 text-muted" />
                <span className="font-medium">{c.name}</span>
                {c.issuer && <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted max-sm:hidden">{c.issuer}</span>}
              </span>
              <span className="text-sm text-muted max-sm:pl-[30px]">{c.topic}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-10 grid gap-6 border-t border-line pt-8 text-[15px] sm:grid-cols-2">
        <div>
          <h3 className="eyebrow mb-2">Honors</h3>
          <p className="font-medium">{honors.join(" · ")}</p>
        </div>
        <div>
          <h3 className="eyebrow mb-2">Languages</h3>
          <p className="font-medium">{languages.join(" · ")}</p>
        </div>
      </Reveal>
    </section>
  );
}

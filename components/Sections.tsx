import Link from "next/link";
import { Reveal, SectionTitle } from "./Reveal";
import { Rich } from "./Rich";
import { earlier, experience, glance, skills } from "@/lib/content";
import { publishedPosts } from "@/lib/posts";

const wrap = "mx-auto max-w-6xl px-5 sm:px-8";

export function Overview() {
  return (
    <section aria-labelledby="overview-title" className={`${wrap} pt-24`}>
      <h2 id="overview-title" className="sr-only">Overview</h2>
      <Reveal className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
        <p className="text-[clamp(1.2rem,2vw,1.5rem)] leading-[1.45] tracking-[-0.015em] text-balance">
          <Rich text="I build **LLM and voice AI systems** that run in **production** for enterprise clients at Rezo.ai: **self-hosted inference**, **guardrails**, **RAG** and **real-time speech**. I optimise for what callers actually feel, like how fast the first sentence is spoken." />
        </p>
        <dl className="grid content-start">
          {glance.map((g) => (
            <div key={g.k} className="flex justify-between gap-6 border-b border-line py-3 text-[15px] first:pt-0">
              <dt className="text-muted">{g.k}</dt>
              <dd className="text-right font-medium">{g.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className={`${wrap} py-28`}>
      <SectionTitle eyebrow="Experience" id="experience-title" title={<>3+ years shipping<br /><span className="grad-text">production AI.</span></>} />
      <ol className="grid gap-12">
        {experience.map((x) => (
          <Reveal as="li" key={x.when} className="grid gap-3 md:grid-cols-[200px_1fr] md:gap-8">
            <span className="font-mono text-sm tabular-nums text-muted md:pt-1.5">{x.when}</span>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{x.role} <span className="text-accent">· {x.org}</span></h3>
              <ul className="mt-3 grid max-w-3xl gap-2 text-muted">
                {x.points.map((pt, i) => (
                  <li key={i} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-accent/60"><Rich text={pt} /></li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
        <Reveal as="li" className="grid gap-3 md:grid-cols-[200px_1fr] md:gap-8">
          <span className="font-mono text-sm tabular-nums text-muted md:pt-1.5">2020 – 2022</span>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Earlier internships</h3>
            <dl className="mt-3 grid">
              {earlier.map((e) => (
                <div key={e.org} className="grid gap-x-6 gap-y-1 border-b border-line py-3 text-[15px] last:border-0 sm:grid-cols-[140px_1fr_auto]">
                  <dt className="font-medium">{e.org}</dt>
                  <dd className="text-muted">{e.what}</dd>
                  <dd className="font-mono text-xs tabular-nums text-muted sm:pt-1">{e.when}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </ol>
    </section>
  );
}

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className={`${wrap} py-28`}>
      <SectionTitle eyebrow="Skills" id="skills-title" title="The toolkit" />
      <Reveal>
        <dl className="grid border-t border-line">
          {skills.map((s) => (
            <div key={s.k} className="grid gap-1 border-b border-line py-4 md:grid-cols-[200px_1fr] md:gap-8">
              <dt className="font-semibold">{s.k}</dt>
              <dd className="text-muted">{s.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

export function Writing() {
  if (!publishedPosts.length) return null;
  return (
    <section id="writing" aria-labelledby="writing-title" className={`${wrap} py-28`}>
      <SectionTitle eyebrow="Writing" id="writing-title" title="Notes from production" />
      <ul className="grid border-t border-line">
        {publishedPosts.map((p) => (
          <Reveal as="li" key={p.slug}>
            <Link href={`/writing/${p.slug}/`} className="group grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_auto] md:items-baseline">
              <span>
                <span className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">{p.title}</span>
                <span className="mt-1 block text-muted">{p.description}</span>
              </span>
              <span className="font-mono text-sm text-muted">{new Date(p.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} · {p.readingTime}</span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { publishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes from building production LLM and voice AI systems: latency, inference, guardrails and retrieval.",
  alternates: { canonical: "./" },
  robots: publishedPosts.length ? undefined : { index: false, follow: true },
};

export default function WritingIndex() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <span className="eyebrow">Writing</span>
      <h1 className="display-md mt-4 text-[clamp(2.4rem,6vw,4.5rem)] uppercase">Notes from production</h1>
      {publishedPosts.length ? (
        <ul className="mt-12 grid border-t border-line">
          {publishedPosts.map((p) => (
            <li key={p.slug}>
              <Link href={`/writing/${p.slug}/`} className="group grid gap-1 border-b border-line py-6">
                <span className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">{p.title}</span>
                <span className="text-muted">{p.description}</span>
                <span className="font-mono text-sm text-muted">{new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {p.readingTime}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-lg text-muted">The first posts are on their way. <Link href="/" className="text-accent underline underline-offset-4">Back to the homepage</Link>.</p>
      )}
    </div>
  );
}

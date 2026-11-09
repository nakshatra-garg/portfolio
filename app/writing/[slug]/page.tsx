import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: "./" },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, authors: ["Nakshatra Garg"] },
  };
}

export default async function PostPage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const { default: Body } = await import(`@/content/writing/${slug}.mdx`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@id": `${SITE_URL}/#person` },
    mainEntityOfPage: `${SITE_URL}/writing/${post.slug}/`,
  };
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      {!post.draft && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {post.draft && (
        <p role="note" className="mb-8 rounded-xl border border-dashed border-accent bg-accent-soft px-4 py-3 text-sm text-accent">
          <b>Draft.</b> This post is unlisted and hidden from search engines until it&apos;s published.
        </p>
      )}
      <Link href="/writing/" className="eyebrow inline-flex min-h-11 items-center hover:text-ink">← Writing</Link>
      <h1 className="display-md mt-4 text-[clamp(2rem,5vw,3.5rem)] text-balance">{post.title}</h1>
      <p className="mt-4 text-lg text-muted">{post.description}</p>
      <p className="mt-6 border-b border-line pb-8 font-mono text-sm text-muted">
        Nakshatra Garg · {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {post.readingTime}
      </p>
      <div className="prose mt-10"><Body /></div>
    </article>
  );
}

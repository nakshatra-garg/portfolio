export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;       // ISO date
  readingTime: string;
  /** Drafts build to their URL (for review) but are unlisted, excluded from the sitemap and marked noindex. */
  draft: boolean;
};

export const posts: Post[] = [
  {
    slug: "time-to-first-sentence",
    title: "Why I measure time to first sentence, not first token",
    description: "For voice bots, first-token latency undersells the wait. What callers feel is how soon the first sentence can be spoken.",
    date: "2026-11-09",
    readingTime: "5 min read",
    draft: true,
  },
];

export const publishedPosts = posts.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));

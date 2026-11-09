import type { MetadataRoute } from "next";
import { publishedPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: "2026-11-09", changeFrequency: "monthly", priority: 1 },
    ...(publishedPosts.length ? [{ url: `${SITE_URL}/writing/`, lastModified: publishedPosts[0].date, changeFrequency: "monthly" as const, priority: 0.7 }] : []),
    ...publishedPosts.map((p) => ({ url: `${SITE_URL}/writing/${p.slug}/`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}

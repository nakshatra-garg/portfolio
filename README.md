# Nakshatra Garg · portfolio

Personal site built with **Next.js 16** (App Router, static export), **Tailwind CSS 4**, **Motion** and **MDX**.
Deployed to **GitHub Pages** by GitHub Actions on every push to `main`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Where things live

| Path | What |
| --- | --- |
| `lib/content.ts` | **All page copy**: headline, stats, projects, experience, skills. Wrap words in `**double asterisks**` to bold them. |
| `lib/posts.ts` | Blog post list. `draft: true` builds the page for review but keeps it unlisted, out of the sitemap and `noindex`. |
| `content/writing/*.mdx` | Blog post bodies (Markdown + JSX). |
| `lib/knowledge.json` | Facts the "Ask my résumé" chat answers from (the Worker reads it too). |
| `components/` | Hero, flagship case study + latency playground, horizontal project rail, chat, ⌘K palette, closing band. |
| `app/` | Pages, metadata/SEO, `sitemap.xml`, `robots.txt`, `llms.txt`. |
| `public/` | Résumé PDF (phone number removed), favicon, social preview image. |
| `worker/` | Optional Cloudflare Worker that powers live chat with Claude. |

## Publishing a blog post

1. Edit `content/writing/<slug>.mdx` (remove the `TODO` notes).
2. In `lib/posts.ts`, set `draft: false`.
3. Push. The post appears on the homepage, `/writing`, the sitemap and `llms.txt`.

## Deploying (GitHub Pages)

One-time: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
After that every push to `main` builds and deploys. The workflow reads your Pages URL from GitHub,
so links and SEO tags are correct both at `https://<user>.github.io/portfolio/` and on a custom domain.

### Custom domain

1. **Settings → Pages → Custom domain**: enter the domain, save, then tick **Enforce HTTPS** when offered.
2. At your registrar:
   - Apex domain: four `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: a `CNAME` record to `<your-github-username>.github.io`
3. Re-run the latest **Deploy to GitHub Pages** workflow (Actions tab) so the site rebuilds with the new URL.

## Live AI chat (optional)

Without a backend the chat runs as offline search over `lib/knowledge.json`. For answers written by Claude:

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Then add your site's address to `ALLOWED_ORIGINS` in `worker/wrangler.toml` (redeploy), and in GitHub:
**Settings → Secrets and variables → Actions → Variables → New variable** `CHAT_ENDPOINT` = the Worker URL. Push or re-run the workflow.

## Social preview image

`node scripts/make_images.js` regenerates `public/og.png` and `public/apple-touch-icon.png` (needs Playwright).

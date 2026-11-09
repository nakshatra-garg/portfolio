# Nakshatra Garg · personal site

Static portfolio site. Plain HTML, CSS and JavaScript, with no build step and no dependencies.

```
index.html              the page
404.html                "Call dropped." error page
assets/css/style.css    all styles (colour tokens at the top, light + dark)
assets/js/main.js       demo call carousel, waveform, filters, copy-email, nav hairline
assets/js/playground.js TTFT vs TTFS latency playground
assets/js/chat.js       "Ask my résumé" chat (live via worker, or offline BM25 search)
assets/js/palette.js    Ctrl/⌘+K command palette

assets/data/knowledge.json  the facts the chat answers from (edit this when your CV changes)
assets/files/           public résumé PDF (phone number removed)
worker/                 Cloudflare Worker that powers live chat with Claude
assets/favicon.svg      icon
assets/og.png           1200x630 link preview for LinkedIn / X / WhatsApp
robots.txt, sitemap.xml SEO
scripts/set_domain.py   points the site at your domain + writes CNAME
scripts/make_images.js  regenerates og.png and apple-touch-icon.png (needs Playwright)
.github/workflows/      auto-deploy to GitHub Pages on every push to main
```

## Preview locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Go live (GitHub Pages + your domain)

1. Set the domain (replaces the `__SITE_URL__` placeholders and writes `CNAME`):
   ```bash
   python scripts/set_domain.py naksh.ai
   ```
2. Push to the `main` branch of your GitHub repo.
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Settings → Pages → Custom domain**: enter the domain, then tick **Enforce HTTPS** once the certificate is issued.
5. At your registrar, add DNS records:
   - Apex domain (`naksh.ai`): four `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (optionally `AAAA` to `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`)
   - `www`: a `CNAME` record to `<your-github-username>.github.io`

DNS can take a few minutes to a few hours to propagate.

## Editing content

All text lives in `index.html`. Projects are the `<article class="card">` blocks in the Work section;
the `data-cat` attribute (`llm`, `voice`, `rag`, `vision`, space-separated) controls which filter shows them.
Colours are tokens at the top of `assets/css/style.css`.

## "Ask my résumé" chat

The chat works in two modes:

- **Offline search (default).** With no backend configured, it searches `assets/data/knowledge.json`
  in the browser (BM25) and replies with the matching passages. Free, nothing to deploy.
- **Live (Claude).** Answers are written by Claude, grounded only in `knowledge.json`, streamed,
  and cite the passages they use. If the backend is down, the chat falls back to offline search.

### Turn on live mode (about 5 minutes)

You need a free Cloudflare account and an Anthropic API key (console.anthropic.com).

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

`wrangler deploy` prints a URL like `https://nakshatra-portfolio-chat.<you>.workers.dev`.

1. Put that URL in `index.html`: `<meta name="chat-endpoint" content="https://...workers.dev">`.
2. In `worker/wrangler.toml`, make sure `ALLOWED_ORIGINS` lists your site's address
   (e.g. `https://naksh.ai,https://www.naksh.ai`), then run `npx wrangler deploy` again.
3. Push the site.

**Cost and abuse controls:** answers are capped at 1,024 tokens, run at low effort, and each visitor
is limited to 8 questions a minute. The ~2.7k-token profile is sent as a cached system prompt.
`MODEL` in `wrangler.toml` defaults to `claude-opus-5-5`; switch to `claude-haiku-5-5` to cut cost
by roughly 40x. Set a monthly spend limit in the Anthropic Console as a backstop.

**Keeping it accurate:** the chat only knows what is in `knowledge.json`. When your CV changes,
update that file (both the site and the worker read it), then redeploy the worker.

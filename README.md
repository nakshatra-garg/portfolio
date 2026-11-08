# Nakshatra Garg · personal site

Static portfolio site. Plain HTML, CSS and JavaScript, with no build step and no dependencies.

```
index.html              the page
404.html                "Call dropped." error page
assets/css/style.css    all styles (colour tokens at the top, light + dark)
assets/js/main.js       demo call carousel, waveform, filters, theme toggle, copy-email
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

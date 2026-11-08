// Regenerates assets/og.png (1200x630 link preview) and assets/apple-touch-icon.png (180x180).
// Run: node scripts/make_images.js   (needs Playwright with Chromium)
const { chromium } = require('playwright');
const path = require('path');
const out = (f) => path.join(__dirname, '..', 'assets', f);

const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=JetBrains+Mono:wght@400;500&display=swap">';
const bars = Array.from({ length: 64 }, (_, i) => {
  const p = i / 64, a = 0.12 + 0.85 * (0.5 + 0.5 * Math.sin(p * 7 - 1)) * Math.abs(Math.sin(p * 46) * Math.sin(p * 13));
  return `<i style="height:${Math.max(6, a * 110)}px;opacity:${0.3 + 0.7 * a}"></i>`;
}).join('');

const og = `<!doctype html><html><head>${fonts}<style>
  body{margin:0;width:1200px;height:630px;background:#0A0B17;color:#ECEDF8;font-family:'Bricolage Grotesque',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;box-sizing:border-box;overflow:hidden}
  .top{font:500 22px 'JetBrains Mono',monospace;color:#9A9EBE;display:flex;align-items:center;gap:14px;letter-spacing:.04em}
  .dot{width:12px;height:12px;border-radius:50%;background:#FFC03A}
  h1{margin:0;font-size:104px;line-height:.95;letter-spacing:-.05em;font-weight:800}
  h1 span{color:#8E86FF}
  .bot{display:flex;justify-content:space-between;align-items:flex-end}
  .name{font-size:34px;font-weight:800;letter-spacing:-.02em}
  .name small{display:block;font:400 20px 'JetBrains Mono',monospace;color:#9A9EBE;letter-spacing:0;margin-top:8px}
  .wave{display:flex;align-items:center;gap:4px;height:110px}
  .wave i{display:block;width:4px;border-radius:2px;background:#8E86FF}
</style></head><body>
  <div class="top"><span class="dot"></span>~2.5M voice-bot calls / day · self-hosted LLM</div>
  <h1>I make LLMs<br><span>pick up the phone.</span></h1>
  <div class="bot"><div class="name">Nakshatra Garg<small>AI Engineer · LLM inference & Voice AI</small></div><div class="wave">${bars}</div></div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(og, { waitUntil: 'networkidle' });
  await p.screenshot({ path: out('og.png') });
  const icon = await b.newPage({ viewport: { width: 180, height: 180 } });
  await icon.setContent(`<body style="margin:0;background:#3A2EF5"><img src="data:image/svg+xml;base64,${require('fs').readFileSync(out('favicon.svg')).toString('base64')}" style="width:180px;height:180px;display:block"></body>`);
  await icon.screenshot({ path: out('apple-touch-icon.png') });
  await b.close();
  console.log('wrote assets/og.png and assets/apple-touch-icon.png');
})();

// Regenerates assets/og.png (1200x630 link preview) and assets/apple-touch-icon.png (180x180).
// Run: node scripts/make_images.js   (needs Playwright with Chromium)
const { chromium } = require('playwright');
const path = require('path');
const out = (f) => path.join(__dirname, '..', 'assets', f);

const fonts = '';
const bars = Array.from({ length: 64 }, (_, i) => {
  const p = i / 64, a = 0.12 + 0.85 * (0.5 + 0.5 * Math.sin(p * 7 - 1)) * Math.abs(Math.sin(p * 46) * Math.sin(p * 13));
  return `<i style="height:${Math.max(6, a * 110)}px;opacity:${0.15 + 0.5 * a}"></i>`;
}).join('');

const og = `<!doctype html><html><head>${fonts}<style>
  body{margin:0;width:1200px;height:630px;background:#0B0B0C;color:#F5F5F7;font-family:-apple-system,'Helvetica Neue',Inter,Arial,sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;box-sizing:border-box;overflow:hidden}
  .top{font:500 24px -apple-system,'Helvetica Neue',Arial,sans-serif;color:#A1A1A6;display:flex;align-items:center;gap:14px;letter-spacing:.04em}
  .dot{width:10px;height:10px;border-radius:50%;background:#4CC38A}
  h1{margin:0;font-size:100px;line-height:1;letter-spacing:-.045em;font-weight:600}
  h1 span{background:linear-gradient(90deg,#5AA2FF,#3CD4C8);-webkit-background-clip:text;background-clip:text;color:transparent}
  .bot{display:flex;justify-content:space-between;align-items:flex-end}
  .name{font-size:32px;font-weight:600;letter-spacing:-.02em}
  .name small{display:block;font-size:22px;font-weight:400;color:#A1A1A6;letter-spacing:-.01em;margin-top:6px}
  .wave{display:flex;align-items:center;gap:4px;height:110px}
  .wave{background:linear-gradient(90deg,#5AA2FF,#3CD4C8);-webkit-mask:linear-gradient(#000,#000)}.wave i{display:block;width:3px;border-radius:2px;background:#5AA2FF}
</style></head><body>
  <div class="top"><span class="dot"></span>AI engineer · LLM inference & voice AI</div>
  <h1>I make LLMs<br><span>pick up the phone.</span></h1>
  <div class="bot"><div class="name">Nakshatra Garg<small>~2.5M voice-bot calls a day on a self-hosted LLM</small></div><div class="wave">${bars}</div></div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(og, { waitUntil: 'networkidle' });
  await p.screenshot({ path: out('og.png') });
  const icon = await b.newPage({ viewport: { width: 180, height: 180 } });
  await icon.setContent(`<body style="margin:0;background:#1A66DE"><img src="data:image/svg+xml;base64,${require('fs').readFileSync(out('favicon.svg')).toString('base64')}" style="width:180px;height:180px;display:block"></body>`);
  await icon.screenshot({ path: out('apple-touch-icon.png') });
  await b.close();
  console.log('wrote assets/og.png and assets/apple-touch-icon.png');
})();

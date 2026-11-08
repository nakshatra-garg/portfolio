(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Demo call carousel ---------- */
  const calls = [
    { caller: 'Mera EMI kab due hai?', inTags: [['acc','lang-id: hi-IN · 98%'],['','ASR → LLM']],
      bot: 'Aapka agla EMI 5 December ko due hai. Kya main reminder set kar doon?', outTags: [['ok','TTFS 0.28 s'],['','guardrails ✓']] },
    { caller: 'Can I change the delivery address on my order?', inTags: [['acc','lang-id: en-IN · 99%'],['','RAG: 3 chunks']],
      bot: 'Yes, I can update it right now. Which address should I use?', outTags: [['ok','TTFS 0.31 s'],['','precision@3 hit']] },
    { caller: 'My card number is <span class="redact">4111 2222 3333</span> 4444', inTags: [['acc','PII redacted'],['','guardrail layer 1']],
      bot: "Thanks. I've masked that for your safety. Let me check the card ending 4444.", outTags: [['ok','TTFS 0.29 s'],['','no data leaves infra']] },
  ];
  const body = document.getElementById('callBody');
  const dotsEl = document.getElementById('dots');
  const timer = document.getElementById('timer');
  let idx = 0, secs = 7, cycle;
  const chipHTML = (tags, end) => `<div class="chips"${end ? ' style="justify-content:flex-end"' : ''}>${tags.map(([c,t]) => `<span class="chip ${c}">${t}</span>`).join('')}</div>`;
  function render(i) {
    const c = calls[i];
    body.innerHTML = `<div class="bubble caller">${c.caller}</div>${chipHTML(c.inTags)}<div class="bubble bot">${c.bot}</div>${chipHTML(c.outTags, true)}`;
    [...dotsEl.children].forEach((d, j) => { d.classList.toggle('on', j === i); d.setAttribute('aria-selected', j === i); });
  }
  calls.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `Example call ${i + 1}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dotsEl.appendChild(b);
  });
  function go(i) {
    idx = i;
    if (reduce) { render(i); return; }
    body.classList.add('fade');
    setTimeout(() => { render(i); body.classList.remove('fade'); }, 350);
  }
  function restart() { clearInterval(cycle); if (!reduce) cycle = setInterval(() => go((idx + 1) % calls.length), 6500); }
  render(0); restart();
  setInterval(() => { secs++; timer.textContent = `${String(Math.floor(secs / 60)).padStart(2,'0')}:${String(secs % 60).padStart(2,'0')}`; }, 1000);

  /* ---------- Voice waveform ---------- */
  const cv = document.getElementById('wave');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, mouseX = -1, t = 0;
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function accent() { return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3A2EF5'; }
  let col = accent();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { col = accent(); });
  new MutationObserver(() => { col = accent(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const gap = 6, bw = 3, n = Math.floor(W / gap);
    ctx.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const x = i * gap + (W - n * gap) / 2;
      const p = i / n;
      // speech-like envelope: syllable bursts riding a slower phrase contour
      const phrase = 0.5 + 0.5 * Math.sin(p * 7.0 - t * 0.6);
      const syll = Math.abs(Math.sin(p * 46 + t * 2.2) * Math.sin(p * 13 - t * 1.3));
      let a = 0.08 + 0.85 * phrase * syll;
      if (mouseX >= 0) a += 0.6 * Math.exp(-Math.pow((x - mouseX) / 70, 2));
      const h = Math.max(3, Math.min(1, a) * H * 0.92);
      ctx.globalAlpha = 0.25 + 0.75 * Math.min(1, a);
      const y = (H - h) / 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, bw, h, 2); else ctx.rect(x, y, bw, h);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function loop() { t += 0.016; draw(); requestAnimationFrame(loop); }
  size(); draw();
  window.addEventListener('resize', () => { size(); draw(); });
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouseX = e.clientX - r.left; if (reduce) draw(); });
  cv.parentElement.addEventListener('pointerleave', () => { mouseX = -1; if (reduce) draw(); });
  if (!reduce) requestAnimationFrame(loop);

  /* ---------- Latency bars replay when scrolled into view ---------- */
  const lat = document.getElementById('latChart');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { lat.classList.add('lat-play'); io.disconnect(); }
    }), { threshold: 0.4 });
    io.observe(lat);
  }

  /* ---------- Work filters ---------- */
  const cards = [...document.querySelectorAll('#workGrid .card')];
  const filters = [...document.querySelectorAll('.filter')];
  filters.forEach(f => {
    const k = f.dataset.f;
    f.querySelector('.n').textContent = k === 'all' ? cards.length : cards.filter(c => c.dataset.cat.split(' ').includes(k)).length;
    f.addEventListener('click', () => {
      filters.forEach(x => x.setAttribute('aria-pressed', x === f));
      cards.forEach(c => { c.hidden = !(k === 'all' || c.dataset.cat.split(' ').includes(k)); });
    });
  });

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const secs2 = links.map(a => document.querySelector(a.getAttribute('href')));
  if ('IntersectionObserver' in window) {
    const nio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    secs2.forEach(s => s && nio.observe(s));
  }

  /* ---------- Copy email ---------- */
  const btn = document.getElementById('copyBtn');
  const email = document.getElementById('email');
  btn.addEventListener('click', () => {
    const done = () => { btn.textContent = 'Copied ✓'; setTimeout(() => btn.textContent = 'Copy email', 1800); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(email); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Selected, press ⌘/Ctrl+C'; setTimeout(() => btn.textContent = 'Copy email', 2600); };
    try { navigator.clipboard.writeText(email.textContent).then(done, fallback); } catch { fallback(); }
  });

  /* ---------- Theme toggle (remembers the visitor's choice) ---------- */
  const root = document.documentElement;
  const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || (darkMQ.matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

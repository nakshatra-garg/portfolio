(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sidebar waveform (small, quiet, reacts to the pointer) ---------- */
  const cv = document.getElementById('wave');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, mouseX = -1, t = 0, col = colours(), running = false;
    function colours() {
      const cs = getComputedStyle(document.documentElement);
      return [cs.getPropertyValue('--accent').trim() || '#1A66DE', cs.getPropertyValue('--tint-2').trim() || '#12A4A0'];
    }
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const gap = 4, bw = 2, n = Math.floor(W / gap);
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, col[0]); grad.addColorStop(1, col[1]);
      ctx.fillStyle = grad;
      for (let i = 0; i < n; i++) {
        const x = i * gap, p = i / n;
        const phrase = 0.5 + 0.5 * Math.sin(p * 6 - t * 0.6);
        const syll = Math.abs(Math.sin(p * 38 + t * 2) * Math.sin(p * 11 - t * 1.2));
        let a = 0.08 + 0.75 * phrase * syll;
        if (mouseX >= 0) a += 0.5 * Math.exp(-Math.pow((x - mouseX) / 40, 2));
        const h = Math.max(2, Math.min(1, a) * H);
        ctx.globalAlpha = 0.25 + 0.75 * Math.min(1, a);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, (H - h) / 2, bw, h, 1); else ctx.rect(x, (H - h) / 2, bw, h);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop() { if (!running) return; t += 0.012; draw(); requestAnimationFrame(loop); }
    size(); draw();
    window.addEventListener('resize', () => { size(); draw(); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { col = colours(); draw(); });
    cv.addEventListener('pointermove', (e) => { mouseX = e.clientX - cv.getBoundingClientRect().left; if (reduce) draw(); });
    cv.addEventListener('pointerleave', () => { mouseX = -1; if (reduce) draw(); });
    // Only animate while visible and the tab is active.
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        const was = running; running = e.isIntersecting && !document.hidden;
        if (running && !was) requestAnimationFrame(loop);
      }).observe(cv);
      document.addEventListener('visibilitychange', () => {
        const was = running; running = !document.hidden && cv.getBoundingClientRect().bottom > 0;
        if (running && !was) requestAnimationFrame(loop);
      });
    }
  }

  /* ---------- Latency bars grow once when first seen ---------- */
  const lat = document.getElementById('latChart');
  if (lat && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { lat.classList.add('lat-play'); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(lat);
  }

  /* ---------- Latency demo (playground) opens on demand ---------- */
  const demoBtn = document.getElementById('demoToggle');
  const demo = document.getElementById('demoWrap');
  if (demoBtn && demo) {
    const label = demoBtn.lastChild;
    demoBtn.addEventListener('click', () => {
      const open = demo.hidden;
      demo.hidden = !open;
      demoBtn.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Hide the latency demo' : 'Try the latency demo';
      if (open) window.dispatchEvent(new Event('resize'));   // playground re-measures now that it is visible
    });
  }

  /* ---------- Project filters ---------- */
  const cards = [...document.querySelectorAll('#workGrid .proj')];
  const filters = [...document.querySelectorAll('.filter')];
  filters.forEach((f) => {
    const k = f.dataset.f;
    const match = (c) => k === 'all' || c.dataset.cat.split(' ').includes(k);
    f.querySelector('.n').textContent = cards.filter(match).length;
    f.addEventListener('click', () => {
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
      cards.forEach((c) => { c.hidden = !match(c); });
      document.getElementById('workGrid').classList.toggle('filtered', k !== 'all');
    });
  });

  /* ---------- Section tracking for the sidebar and the top bar ---------- */
  const links = [...document.querySelectorAll('.toc-links a[href^="#"]')];
  const ids = [...new Set(links.map((a) => a.getAttribute('href').slice(1)))];
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  function setActive() {
    const y = window.innerHeight * 0.3;
    let current = sections[0]?.id;
    for (const s of sections) if (s.getBoundingClientRect().top <= y) current = s.id;
    // At the very bottom, the last section is the one being read.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1]?.id;
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${current}`;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  const bar = document.querySelector('.mbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { ticking = false; setActive(); bar?.classList.toggle('scrolled', window.scrollY > 180); });
  }, { passive: true });
  setActive();

  /* ---------- Copy email ---------- */
  const btn = document.getElementById('copyBtn');
  const email = document.getElementById('email');
  btn?.addEventListener('click', () => {
    const reset = (ms) => setTimeout(() => { btn.textContent = 'Copy email'; }, ms);
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents(email);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = 'Press Ctrl+C'; reset(2400);
    };
    try { navigator.clipboard.writeText(email.textContent).then(() => { btn.textContent = 'Copied'; reset(1600); }, fallback); }
    catch { fallback(); }
  });
})();

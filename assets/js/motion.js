/* Motion layer: scroll reveals, stat count-up, journey progress line.
   Everything is visible without JS; this only adds the entrance. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  /* ---------- Reveal on scroll (only for things below the first screen) ---------- */
  const groups = [
    '.sec-head', '.latency', '.lat-note > div', '.pg', '.card', '.stack-group', '.step', '.panel', '.contact',
  ];
  const vh = window.innerHeight;
  const targets = [];
  groups.forEach((sel) => document.querySelectorAll(sel).forEach((el, i, all) => {
    if (el.getBoundingClientRect().top < vh * 0.92) return;   // already on screen: leave it alone
    const siblings = [...el.parentElement.children].filter((c) => all.length > 1 && c.matches(sel));
    el.style.setProperty('--rd', `${Math.min(siblings.indexOf(el), 5) * 0.07}s`);
    el.classList.add('pre-reveal');
    targets.push(el);
  }));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('revealed');
    requestAnimationFrame(() => el.classList.remove('pre-reveal'));
    el.addEventListener('transitionend', () => { el.classList.remove('revealed'); el.style.removeProperty('--rd'); }, { once: true });
    io.unobserve(el);
  }), { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => io.observe(el));

  /* ---------- Stat count-up ---------- */
  const stats = document.querySelectorAll('.stat b');
  const sio = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    sio.unobserve(e.target);
    const node = e.target.firstChild;                     // text node before <small>
    if (!node || node.nodeType !== 3) return;
    const final = node.textContent;
    const m = final.match(/^(~?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num), dec = (num.split('.')[1] || '').length;
    const t0 = performance.now(), dur = 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      node.textContent = `${pre}${(target * eased).toFixed(dec)}${post}`;
      if (p < 1) requestAnimationFrame(tick); else node.textContent = final;
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  stats.forEach((s) => sio.observe(s));

  /* ---------- Journey progress line ---------- */
  const journey = document.getElementById('journey-line');
  if (journey) {
    const steps = [...journey.querySelectorAll('.step')];
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = journey.getBoundingClientRect();
      const focus = window.innerHeight * 0.6;
      const p = Math.max(0, Math.min(1, (focus - r.top) / (r.height - 48)));
      journey.style.setProperty('--jp', p.toFixed(3));
      steps.forEach((s) => s.classList.toggle('lit', s.getBoundingClientRect().top + 12 < focus));
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();

/* Motion layer: scroll reveals and the journey progress line.
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

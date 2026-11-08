/* ⌘K / Ctrl+K command palette: jump to sections and projects, run actions. */
(() => {
  const $ = (id) => document.getElementById(id);
  const box = $('kbar'), input = $('kbarInput'), list = $('kbarList'), btn = $('kbarBtn');
  if (!box) return;

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const modKey = $('kbdMod'); if (modKey) modKey.textContent = isMac ? '⌘' : 'Ctrl';
  btn.setAttribute('aria-label', `Search and jump (${isMac ? '⌘' : 'Ctrl'}+K)`);

  const go = (sel) => () => {
    const el = document.querySelector(sel); if (!el) return;
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  const flash = (el) => { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); };
  const click = (sel) => () => document.querySelector(sel)?.click();
  const link = (href) => () => { const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.click(); };

  const items = [
    { g: 'Sections', label: 'Latency: anatomy of a reply', hint: '#latency', run: go('#latency') },
    { g: 'Sections', label: 'Latency playground', hint: 'TTFT vs TTFS demo', run: go('#playground') },
    { g: 'Sections', label: 'Selected work', hint: '#work', run: go('#work') },
    { g: 'Sections', label: 'Stack', hint: '#stack', run: go('#stack') },
    { g: 'Sections', label: 'Journey', hint: 'experience & education', run: go('#journey') },
    { g: 'Sections', label: 'Contact', hint: '#contact', run: go('#contact') },
  ];
  // Every project card becomes a jump target (shows "All" filter first so the card is visible).
  document.querySelectorAll('#workGrid .card').forEach((card) => {
    const title = card.querySelector('h3')?.textContent.trim();
    const metric = card.querySelector('.metric')?.textContent.trim();
    items.push({ g: 'Projects', label: title, hint: metric, run: () => {
      if (card.hidden) document.getElementById('f-all')?.click();
      card.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => flash(card), 350);
    } });
  });
  items.push(
    { g: 'Actions', label: 'Ask my résumé (AI chat)', hint: 'questions about my work', run: () => window.portfolioChat?.open() },
    { g: 'Actions', label: 'Download résumé', hint: 'PDF', run: click('.hero-actions a[download]') },
    { g: 'Actions', label: 'Copy email address', hint: 'gargnakshatra11@gmail.com', run: () => { go('#contact')(); click('#copyBtn')(); } },
    { g: 'Actions', label: 'Toggle light / dark theme', hint: '', run: click('#themeToggle') },
    { g: 'Actions', label: 'Open LinkedIn', hint: 'linkedin.com/in/nakshatra-garg', run: link('https://www.linkedin.com/in/nakshatra-garg') },
    { g: 'Actions', label: 'Open GitHub', hint: 'github.com/nakshatra-garg', run: link('https://github.com/nakshatra-garg/') },
  );

  // Subsequence fuzzy match with a bonus for word starts and contiguous runs.
  function score(q, text) {
    if (!q) return 1;
    const t = text.toLowerCase();
    const at = t.indexOf(q);
    if (at >= 0) return 100 + (at === 0 || /[\s:·(/-]/.test(t[at - 1]) ? 50 : 0) - at * 0.1;
    let ti = 0, s = 0, run = 0;
    for (const ch of q) {
      const at = t.indexOf(ch, ti); if (at < 0) return 0;
      run = at === ti ? run + 1 : 0;
      s += 1 + run * 2 + (at === 0 || /[\s:·(-]/.test(t[at - 1]) ? 3 : 0);
      ti = at + 1;
    }
    return s / (t.length * 0.05 + 1);
  }

  let shown = [], active = 0, lastFocus = null;
  function render() {
    const q = input.value.trim().toLowerCase();
    shown = items.map((it) => ({ it, s: Math.max(score(q, it.label), score(q, `${it.label} ${it.hint}`) * 0.6) }))
      .filter((r) => r.s > 0).sort((a, b) => (q ? b.s - a.s : 0)).map((r) => r.it);
    active = Math.min(active, Math.max(0, shown.length - 1));
    if (!shown.length) { list.innerHTML = `<li class="kbar-empty">No matches. Try "rag", "voice" or "résumé".</li>`; return; }
    let html = '', group = '';
    shown.forEach((it, i) => {
      if (!q && it.g !== group) { group = it.g; html += `<li class="kbar-group" role="presentation">${group}</li>`; }
      html += `<li class="kbar-item" role="option" id="kb-${i}" data-i="${i}" aria-selected="${i === active}"><span>${it.label}</span><small>${it.hint || ''}</small></li>`;
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', `kb-${active}`);
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    lastFocus = document.activeElement;
    box.hidden = false; input.value = ''; active = 0; render();
    input.focus();
  }
  function close() { box.hidden = true; lastFocus?.focus?.(); }
  function run(i) { const it = shown[i]; if (!it) return; close(); setTimeout(it.run, 30); }

  btn.addEventListener('click', open);
  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % shown.length; render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % shown.length; render(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') e.preventDefault();
  });
  list.addEventListener('mousemove', (e) => { const li = e.target.closest('.kbar-item'); if (li && +li.dataset.i !== active) { active = +li.dataset.i; render(); } });
  list.addEventListener('click', (e) => { const li = e.target.closest('.kbar-item'); if (li) run(+li.dataset.i); });
  box.querySelector('[data-close]').addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); box.hidden ? open() : close(); }
    else if (e.key === '/' && !typing && box.hidden) { e.preventDefault(); open(); }
  });
})();

/* TTFT vs TTFS playground: one LLM reply, spoken two ways. */
(() => {
  const root = document.getElementById('playground');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const REPLIES = {
    short: 'Sure, I can check that. Your next EMI of ₹12,450 is due on 5 December, and auto-debit is active. Shall I send you a reminder the day before?',
    long: 'Sure, let me quickly pull up your loan account and look at the repayment schedule that is currently on file for you. Your next EMI of ₹12,450 is due on 5 December. Shall I send a reminder?',
  };
  const TTS_FIRST_CHUNK = 80;   // ms for streaming TTS to return audio for the first chunk
  const WORDS_PER_SEC = 2.5;    // speaking rate

  const ui = {
    play: $('pgPlay'), slow: $('pgSlow'), ttft: $('pgTtft'), tps: $('pgTps'),
    ttftOut: $('pgTtftOut'), tpsOut: $('pgTpsOut'), text: $('pgText'),
    think: $('pgThink'), gen: $('pgGen'), markS: $('pgMarkS'),
    silA: $('pgSilA'), talkA: $('pgTalkA'), silB: $('pgSilB'), talkB: $('pgTalkB'),
    l1: $('pgL1'), l2: $('pgL2'), l3: $('pgL3'), axis: $('pgAxis'), head: $('pgHead'), verdict: $('pgVerdict'),
    lanes: $('pgLanes'),
  };

  const fmt = (ms) => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`);

  // Split into "tokens": words with their trailing space/punctuation (close enough to BPE for a demo).
  function tokenize(str) { return str.match(/\S+\s*/g) || []; }

  let model, raf = 0;

  function compute() {
    const ttft = +ui.ttft.value, tps = +ui.tps.value;
    const open = document.querySelector('input[name="pgOpen"]:checked').value;
    const tokens = tokenize(REPLIES[open]);
    const at = tokens.map((_, i) => ttft + (i * 1000) / tps);       // time each token arrives
    const firstEnd = tokens.findIndex((t) => /[.?!]\s*$/.test(t));
    const ttfs = at[firstEnd] + 1000 / tps;                           // sentence complete once its last token lands
    const full = at[at.length - 1] + 1000 / tps;
    const words = tokens.length;
    const speakA = ttfs + TTS_FIRST_CHUNK;
    const speakB = full + TTS_FIRST_CHUNK;
    const talk = (words / WORDS_PER_SEC) * 1000;
    const end = speakB + Math.min(talk, 900);                        // show a slice of the speaking phase
    return { ttft, tps, tokens, at, firstEnd, ttfs, full, speakA, speakB, end };
  }

  function axis(end) {
    const step = end > 3000 ? 1000 : end > 1400 ? 500 : 250;
    let html = '';
    for (let v = 0; v <= end; v += step) {
      const lbl = v === 0 ? '0' : v < 1000 ? `${v} ms` : `${v / 1000} s`;
      if (v / end < 0.94 || v === 0) html += `<span style="left:${(v / end) * 100}%">${lbl}</span>`;
    }
    ui.axis.innerHTML = html;
  }

  function renderText(t, final) {
    const m = model;
    ui.text.innerHTML = m.tokens.map((tok, i) => {
      const cls = ['tok'];
      if (i <= m.firstEnd) cls.push('first');
      if (!final && m.at[i] > t) cls.push('pending');
      return `<span class="${cls.join(' ')}">${tok.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
    }).join('') + (!final && t < m.full ? '<span class="caret"></span>' : '');
  }

  const pct = (ms) => `${Math.max(0, Math.min(1, ms / model.end)) * 100}%`;
  function width(el, from, to) { el.style.left = pct(from); el.style.width = `calc(${pct(Math.max(from, to))} - ${pct(from)})`; }

  function renderLanes(t) {
    const m = model;
    width(ui.think, 0, Math.min(t, m.ttft));
    width(ui.gen, m.ttft, Math.min(t, m.full));
    ui.markS.style.left = pct(m.ttfs);
    ui.markS.style.opacity = t >= m.ttfs ? 1 : 0;
    width(ui.silA, 0, Math.min(t, m.speakA));
    width(ui.talkA, m.speakA, Math.min(t, m.end));
    width(ui.silB, 0, Math.min(t, m.speakB));
    width(ui.talkB, m.speakB, Math.min(t, m.end));
    const playing = t < m.end;
    ui.talkA.classList.toggle('live', playing && t >= m.speakA);
    ui.talkB.classList.toggle('live', playing && t >= m.speakB);
  }

  function renderLabels() {
    const m = model;
    ui.l1.textContent = `TTFT ${fmt(m.ttft)} · TTFS ${fmt(m.ttfs)}`;
    ui.l2.textContent = `speaks at ${fmt(m.speakA)}`;
    ui.l3.textContent = `speaks at ${fmt(m.speakB)}`;
    const saved = m.speakB - m.speakA;
    ui.verdict.innerHTML = `Chunking by sentence starts the voice <b>${fmt(saved)} sooner</b>. TTFT is ${fmt(m.ttft)} either way, which is why it's the wrong number to watch.`;
    ui.ttftOut.textContent = `${m.ttft} ms`;
    ui.tpsOut.textContent = `${m.tps} tok/s`;
  }

  // Resting state: the finished race, so the section reads fully without pressing play.
  function rest() {
    cancelAnimationFrame(raf);
    model = compute();
    axis(model.end);
    renderLabels();
    renderText(model.end, true);
    renderLanes(model.end);
    ui.head.style.opacity = 0;
    setPlayLabel(false);
  }

  function setPlayLabel(playing) {
    ui.play.querySelector('span').textContent = playing ? 'Playing…' : 'Play';
    ui.play.disabled = playing;
  }

  function play() {
    model = compute();
    axis(model.end);
    renderLabels();
    if (reduce) { rest(); return; }
    const speed = ui.slow.checked ? 1 / 3 : 1;
    const start = performance.now();
    const lanesBox = ui.lanes.getBoundingClientRect();
    const track = ui.lanes.querySelector('.lane-track').getBoundingClientRect();
    setPlayLabel(true);
    const frame = (now) => {
      const t = (now - start) * speed;
      renderText(t, false);
      renderLanes(t);
      const x = track.left - lanesBox.left + Math.min(1, t / model.end) * track.width;
      ui.head.style.left = `${x}px`;
      ui.head.style.opacity = 1;
      if (t < model.end) raf = requestAnimationFrame(frame);
      else { renderText(model.end, true); ui.head.style.opacity = 0; setPlayLabel(false); }
    };
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  ui.play.addEventListener('click', play);
  [ui.ttft, ui.tps].forEach((el) => el.addEventListener('input', rest));
  document.querySelectorAll('input[name="pgOpen"]').forEach((el) => el.addEventListener('change', rest));
  window.addEventListener('resize', () => { if (!ui.play.disabled) rest(); });
  rest();
})();

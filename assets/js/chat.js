/* "Ask my résumé": streams grounded answers from the chat worker,
   or falls back to in-browser BM25 search over the same knowledge base. */
(() => {
  const $ = (id) => document.getElementById(id);
  const fab = $('chatFab'), panel = $('chatPanel'), log = $('chatLog'), form = $('chatForm');
  const input = $('chatInput'), send = $('chatSend'), modeEl = $('chatMode'), suggest = $('chatSuggest');
  if (!fab || !panel) return;

  const ENDPOINT = (document.querySelector('meta[name="chat-endpoint"]')?.content || '').trim().replace(/\/$/, '');
  const history = [];       // [{role, content}] sent to the worker
  let kb = null, index = null, busy = false;

  modeEl.textContent = ENDPOINT ? 'Claude · grounded in profile' : 'Offline search · profile only';
  modeEl.classList.toggle('live', !!ENDPOINT);

  /* ---------- Knowledge base + BM25 ---------- */
  const STOP = new Set('a an the and or of to in on for with at by from is are was were be been has have had he his him she her it its this that these those what which who whom how why when where do does did can could would should will i me my you your we our they their as about into than then there here any some not no yes also just over under more most very much many'.split(' '));
  const stem = (w) => w.replace(/(ing|ed|es|s)$/,'');
  const tokens = (s) => (s.toLowerCase().normalize('NFKD').match(/[a-z0-9.+#×%-]+/g) || [])
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, '')).filter((w) => w && !STOP.has(w)).map(stem);

  async function loadKB() {
    if (kb) return kb;
    const res = await fetch('assets/data/knowledge.json');
    kb = await res.json();
    const docs = kb.chunks.map((c) => tokens(`${c.title} ${c.title} ${c.text}`));
    const df = new Map();
    docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
    const avg = docs.reduce((a, d) => a + d.length, 0) / docs.length;
    index = { docs, df, avg, N: docs.length };
    return kb;
  }

  function bm25(query, k1 = 1.4, b = 0.75) {
    const q = [...new Set(tokens(query))];
    return index.docs.map((d, i) => {
      const tf = new Map(); d.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
      let score = 0;
      for (const t of q) {
        const f = tf.get(t); if (!f) continue;
        const n = index.df.get(t);
        const idf = Math.log(1 + (index.N - n + 0.5) / (n + 0.5));
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.length / index.avg));
      }
      return { i, score };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  }

  function offlineAnswer(question) {
    const hits = bm25(question).slice(0, 3);
    if (!hits.length || hits[0].score < 1.2) {
      return { text: "I couldn't find that in Nakshatra's profile. Try asking about his projects, skills, experience or education, or email him at gargnakshatra11@gmail.com.", sources: [] };
    }
    const q = new Set(tokens(question));
    const top = hits.filter((h) => h.score >= hits[0].score * 0.45).slice(0, 2);
    const parts = top.map((h) => {
      const c = kb.chunks[h.i];
      const sentences = c.text.split(/(?<=[.!?])\s+(?=[A-Z(])/);
      const ranked = sentences.map((s, j) => ({ s: s.trim(), j, hit: tokens(s).filter((t) => q.has(t)).length }))
        .sort((a, b) => b.hit - a.hit || a.j - b.j).slice(0, 2).sort((a, b) => a.j - b.j);
      return `${ranked.map((r) => r.s).join(' ')} [${c.id}]`;
    });
    return { text: parts.join('\n\n'), sources: top.map((h) => kb.chunks[h.i].id) };
  }

  /* ---------- Rendering ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function titleOf(id) { return kb?.chunks.find((c) => c.id === id)?.title; }

  function renderAnswer(el, raw) {
    const order = [];
    const html = esc(raw).replace(/\s?\[([a-z0-9-]+)\]/g, (m, id) => {
      const t = titleOf(id); if (!t) return '';
      if (!order.includes(id)) order.push(id);
      return `<span class="cite" title="${esc(t)}">${order.indexOf(id) + 1}</span>`;
    });
    el.innerHTML = html;
    return order;
  }

  function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    const b = document.createElement('div');
    b.className = role === 'user' ? 'bubble-q' : 'bubble-a';
    if (text) b.textContent = text;
    wrap.appendChild(b);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return { wrap, bubble: b };
  }

  function addMeta(wrap, sources, note) {
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.innerHTML = sources.map((id, n) => `<span class="src">${n + 1} · ${esc(titleOf(id) || id)}</span>`).join('') + (note ? `<span>${esc(note)}</span>` : '');
    wrap.appendChild(meta);
    log.scrollTop = log.scrollHeight;
  }

  async function typeOut(bubble, text) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return renderAnswer(bubble, text);
    let out = '';
    for (const piece of text.match(/\S+\s*/g) || []) {
      out += piece; renderAnswer(bubble, out);
      log.scrollTop = log.scrollHeight;
      await new Promise((r) => setTimeout(r, 18));
    }
    return renderAnswer(bubble, text);
  }

  /* ---------- Ask ---------- */
  async function askLive(bubble) {
    const t0 = performance.now();
    let first = 0, text = '', usage = null, errorMsg = '';
    const res = await fetch(`${ENDPOINT}/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    if (!res.ok || !res.body) {
      let msg = `Request failed (${res.status})`;
      try { msg = (await res.json()).error || msg; } catch {}
      const e = new Error(msg); e.status = res.status; throw e;
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let cut;
      while ((cut = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, cut).trim(); buf = buf.slice(cut + 2);
        if (!line.startsWith('data:')) continue;
        const ev = JSON.parse(line.slice(5));
        if (ev.t === 'text') {
          if (!first) { first = performance.now() - t0; bubble.innerHTML = ''; }
          text += ev.v; renderAnswer(bubble, text);
          log.scrollTop = log.scrollHeight;
        } else if (ev.t === 'done') usage = ev.usage;
        else if (ev.t === 'error') errorMsg = ev.v;
      }
    }
    if (errorMsg && !text) { const e = new Error(errorMsg); e.status = 502; throw e; }
    return { text, first, usage };
  }

  async function ask(question) {
    if (busy || !question.trim()) return;
    busy = true; send.disabled = true; suggest.hidden = true;
    addMsg('user', question);
    const { wrap, bubble } = addMsg('bot');
    bubble.innerHTML = '<span class="typing" aria-label="Thinking"><i></i><i></i><i></i></span>';
    await loadKB().catch(() => {});
    history.push({ role: 'user', content: question });

    try {
      if (!ENDPOINT) throw Object.assign(new Error('offline'), { offline: true });
      const { text, first } = await askLive(bubble);
      const sources = renderAnswer(bubble, text);
      history.push({ role: 'assistant', content: text });
      addMeta(wrap, sources, `first token ${Math.round(first)} ms`);
    } catch (err) {
      if (!kb) { bubble.textContent = "Sorry, I couldn't load the profile. Please refresh and try again."; history.pop(); }
      else if (err.status === 429 || err.status === 403) { bubble.textContent = err.message; history.pop(); }
      else {
        const ans = offlineAnswer(question);
        bubble.innerHTML = '';
        const sources = await typeOut(bubble, ans.text);
        history.push({ role: 'assistant', content: ans.text });
        addMeta(wrap, sources, err.offline ? 'offline search' : 'live chat unavailable, showing search results');
      }
    } finally {
      busy = false; send.disabled = false; input.focus();
    }
  }

  /* ---------- Open / close ---------- */
  function open(prefill) {
    panel.hidden = false; fab.setAttribute('aria-expanded', 'true');
    loadKB().catch(() => {});
    if (prefill) ask(prefill); else setTimeout(() => input.focus(), 50);
  }
  function close() { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); }

  fab.addEventListener('click', () => open());
  $('chatClose').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
  suggest.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => ask(b.textContent)));

  window.portfolioChat = { open };
})();

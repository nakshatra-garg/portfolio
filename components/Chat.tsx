"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import kb from "@/lib/knowledge.json";
import { CHAT_ENDPOINT, EMAIL } from "@/lib/site";

type Chunk = { id: string; title: string; text: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: string[]; note?: string };

const chunks = (kb as { chunks: Chunk[] }).chunks;
const titleOf = (id: string) => chunks.find((c) => c.id === id)?.title;

/* ---------- tiny BM25 over the knowledge base (offline mode) ---------- */
const STOP = new Set("a an the and or of to in on for with at by from is are was were be been has have had he his him she her it its this that these those what which who whom how why when where do does did can could would should will i me my you your we our they their as about into than then there here any some not no yes also just over under more most very much many".split(" "));
const tok = (s: string) => (s.toLowerCase().normalize("NFKD").match(/[a-z0-9.+#×%-]+/g) ?? [])
  .map((w) => w.replace(/^[.-]+|[.-]+$/g, "")).filter((w) => w && !STOP.has(w)).map((w) => w.replace(/(ing|ed|es|s)$/, ""));

function useIndex() {
  return useMemo(() => {
    const docs = chunks.map((c) => tok(`${c.title} ${c.title} ${c.text}`));
    const df = new Map<string, number>();
    docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
    const avg = docs.reduce((a, d) => a + d.length, 0) / docs.length;
    return (query: string) => {
      const q = [...new Set(tok(query))];
      return docs.map((d, i) => {
        const tf = new Map<string, number>(); d.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
        let score = 0;
        for (const t of q) {
          const f = tf.get(t); if (!f) continue;
          const n = df.get(t)!; const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
          score += (idf * (f * 2.4)) / (f + 1.4 * (0.25 + (0.75 * d.length) / avg));
        }
        return { i, score };
      }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
    };
  }, []);
}

function offlineAnswer(search: ReturnType<typeof useIndex>, question: string) {
  const hits = search(question).slice(0, 3);
  if (!hits.length || hits[0].score < 1.2) {
    return { content: `I couldn't find that in Nakshatra's profile. Try asking about his projects, skills, experience or education, or email him at ${EMAIL}.`, sources: [] as string[] };
  }
  const q = new Set(tok(question));
  const top = hits.filter((h) => h.score >= hits[0].score * 0.45).slice(0, 2);
  const parts = top.map((h) => {
    const c = chunks[h.i];
    const sents = c.text.split(/(?<=[.!?])\s+(?=[A-Z(])/);
    const picked = sents.map((s, j) => ({ s, j, hit: tok(s).filter((t) => q.has(t)).length }))
      .sort((a, b) => b.hit - a.hit || a.j - b.j).slice(0, 2).sort((a, b) => a.j - b.j);
    return `${picked.map((p) => p.s).join(" ")} [${c.id}]`;
  });
  return { content: parts.join("\n\n"), sources: top.map((h) => chunks[h.i].id) };
}

/** Turns "[chunk-id]" markers into numbered citation chips. */
function Answer({ text }: { text: string }) {
  const order: string[] = [];
  const parts = text.split(/\s?\[([a-z0-9-]+)\]/g);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return <span key={i}>{p}</span>;
        const t = titleOf(p);
        if (!t) return null;
        if (!order.includes(p)) order.push(p);
        return <span key={i} title={t} className="mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-md bg-accent-soft px-1 align-[1px] text-xs font-semibold text-accent">{order.indexOf(p) + 1}</span>;
      })}
    </>
  );
}

const SUGGEST = ["How did he cut LLM costs by 40%?", "What is TTFS and why does it matter?", "Has he fine-tuned LLMs?", "What RAG work has he done?"];

export function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const search = useIndex();
  const log = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const live = Boolean(CHAT_ENDPOINT);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs]);

  const ask = useCallback(async (question: string) => {
    question = question.trim();
    if (!question || busy) return;
    setBusy(true);
    const history: Msg[] = [...msgs, { role: "user", content: question }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    const put = (m: Partial<Msg>) => setMsgs((cur) => { const c = [...cur]; c[c.length - 1] = { ...c[c.length - 1], ...m }; return c; });

    try {
      if (!live) throw Object.assign(new Error("offline"), { offline: true });
      const t0 = performance.now();
      let first = 0, text = "";
      const res = await fetch(`${CHAT_ENDPOINT}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        let msg = `Request failed (${res.status})`;
        try { msg = (await res.json()).error || msg; } catch {}
        throw Object.assign(new Error(msg), { status: res.status });
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let cut;
        while ((cut = buf.indexOf("\n\n")) >= 0) {
          const line = buf.slice(0, cut).trim(); buf = buf.slice(cut + 2);
          if (!line.startsWith("data:")) continue;
          const ev = JSON.parse(line.slice(5));
          if (ev.t === "text") { if (!first) first = performance.now() - t0; text += ev.v; put({ content: text }); }
          else if (ev.t === "error" && !text) throw Object.assign(new Error(ev.v), { status: 502 });
        }
      }
      const sources = [...new Set([...text.matchAll(/\[([a-z0-9-]+)\]/g)].map((m) => m[1]))].filter(titleOf);
      put({ content: text, sources, note: `first token ${Math.round(first)} ms` });
    } catch (err) {
      const e = err as Error & { status?: number; offline?: boolean };
      if (e.status === 429 || e.status === 403) { put({ content: e.message }); }
      else {
        const a = offlineAnswer(search, question);
        put({ content: a.content, sources: a.sources, note: e.offline ? "offline search" : "live chat unavailable, showing search results" });
      }
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [busy, live, msgs, search]);

  // Ask box, palette and other components open the chat through this event.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail;
      if (q) setTimeout(() => ask(q), 50); else setTimeout(() => inputRef.current?.focus(), 60);
    };
    window.addEventListener("open-chat", onOpen);
    return () => window.removeEventListener("open-chat", onOpen);
  }, [ask]);

  const close = () => { setOpen(false); fab.current?.focus(); };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={fab}
            key="fab"
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-chat", { detail: "" }))}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            whileTap={{ scale: 0.96 }}
            className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] right-[max(20px,env(safe-area-inset-right))] z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-accent pl-4 pr-5 text-sm font-medium text-on-accent shadow-[0_10px_30px_color-mix(in_srgb,var(--accent)_40%,transparent)] max-sm:size-[52px] max-sm:justify-center max-sm:p-0"
            aria-label="Ask my résumé"
          >
            <Icon name="chat" className="size-5" />
            <span className="max-sm:hidden">Ask my résumé</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="chat-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "bottom right" }}
            onKeyDown={(e) => e.key === "Escape" && close()}
            className="fixed z-[45] flex flex-col overflow-hidden border border-line bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl max-sm:inset-0 max-sm:pt-[env(safe-area-inset-top)] sm:bottom-5 sm:right-5 sm:h-[min(620px,calc(100dvh-104px))] sm:w-[400px] sm:rounded-3xl"
          >
            <header className="flex items-center justify-between gap-3 border-b border-line py-3 pl-5 pr-3">
              <div>
                <h2 id="chat-title" className="font-semibold tracking-tight">Ask about Nakshatra</h2>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={`size-1.5 rounded-full ${live ? "bg-signal" : "bg-line"}`} />
                  {live ? "Claude · grounded in profile" : "Offline search · profile only"}
                </p>
              </div>
              <button type="button" onClick={close} aria-label="Close chat" className="grid size-11 place-items-center rounded-full bg-fill text-xl leading-none">×</button>
            </header>
            <div ref={log} aria-live="polite" className="flex flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain px-5 py-4">
              <div className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-fill px-3.5 py-2.5 text-[15px] leading-relaxed">
                Hi! Ask me anything about Nakshatra&apos;s work: projects, skills, numbers or background. Every answer cites the part of his profile it comes from.
              </div>
              {msgs.map((m, i) => m.role === "user" ? (
                <div key={i} className="max-w-[92%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[15px] text-on-accent">{m.content}</div>
              ) : (
                <div key={i} className="grid max-w-[92%] gap-1.5">
                  <div className="whitespace-pre-wrap rounded-2xl rounded-bl-md bg-fill px-3.5 py-2.5 text-[15px] leading-relaxed [overflow-wrap:anywhere]">
                    {m.content ? <Answer text={m.content} /> : <span className="inline-flex gap-1 py-1" aria-label="Thinking">{[0, 1, 2].map((d) => <i key={d} className="size-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${d * 150}ms` }} />)}</span>}
                  </div>
                  {(m.sources?.length || m.note) && (
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted">
                      {m.sources?.map((s, n) => <span key={s} className="rounded-full border border-line px-2 py-px">{n + 1} · {titleOf(s)}</span>)}
                      {m.note && <span>{m.note}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!msgs.length && (
              <div className="flex gap-1.5 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
                {SUGGEST.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="min-h-9 shrink-0 rounded-full border border-line bg-surface px-3.5 text-[13px] hover:border-muted">{s}</button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); const q = input; setInput(""); ask(q); }} className="flex gap-2 border-t border-line p-3">
              <label htmlFor="chat-input" className="sr-only">Your question</label>
              <input id="chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} required autoComplete="off"
                placeholder="e.g. Which GPUs has he deployed on?"
                className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base outline-none focus:border-accent" />
              <button type="submit" disabled={busy} aria-label="Send question" className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform active:scale-95 disabled:opacity-50">
                <Icon name="send" className="size-[18px]" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

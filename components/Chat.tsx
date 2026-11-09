"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { AnswerText, SourceList } from "./AnswerText";
import { engine } from "@/lib/engine";
import { askLive, ChatError } from "@/lib/live";
import { CHAT_ENDPOINT } from "@/lib/site";

export type Msg = { role: "user" | "assistant"; content: string; sources?: string[]; note?: string };
/** "open-chat" event detail: a question to ask, or a conversation to continue (from the hero). */
export type OpenChatDetail = string | { messages: Msg[] };

const SUGGEST = ["How did he cut LLM costs by 40%?", "What is his tech stack?", "Has he fine-tuned LLMs?", "What RAG work has he done?"];
const sourcesIn = (text: string) => [...new Set([...text.matchAll(/\[([a-z0-9-]+)\]/g)].map((m) => m[1]))].filter((id) => engine.titleOf(id));

export function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const live = Boolean(CHAT_ENDPOINT);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs]);

  const ask = useCallback(async (question: string, base?: Msg[]) => {
    question = question.trim();
    if (!question || busy) return;
    setBusy(true);
    const history: Msg[] = [...(base ?? msgs), { role: "user", content: question }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    const put = (m: Partial<Msg>) => setMsgs((cur) => { const c = [...cur]; c[c.length - 1] = { ...c[c.length - 1], ...m }; return c; });

    try {
      const { text, first } = await askLive(history.map(({ role, content }) => ({ role, content })), (t) => put({ content: t }));
      put({ content: text, sources: sourcesIn(text), note: `first token ${Math.round(first)} ms` });
    } catch (err) {
      const e = err as ChatError;
      if (e.status === 429 || e.status === 403) put({ content: e.message });
      else {
        const a = engine.answer(question);
        put({ content: a.content, sources: a.sources, note: e.message === "offline" ? "offline search" : "live chat unavailable, showing search results" });
      }
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [busy, msgs]);

  // The hero Ask box, palette and floating button all open the chat through this event.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenChatDetail>).detail;
      setOpen(true);
      if (d && typeof d === "object") { setMsgs(d.messages); setTimeout(() => inputRef.current?.focus(), 60); }
      else if (d) setTimeout(() => ask(d), 50);
      else setTimeout(() => inputRef.current?.focus(), 60);
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
            onClick={() => window.dispatchEvent(new CustomEvent<OpenChatDetail>("open-chat", { detail: "" }))}
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
                  {live ? "Claude · grounded in profile" : "Answers from his profile"}
                </p>
              </div>
              <button type="button" onClick={close} aria-label="Close chat" className="grid size-11 place-items-center rounded-full bg-fill text-xl leading-none">×</button>
            </header>
            <div ref={log} aria-live="polite" className="flex flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain px-5 py-4">
              <div className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-fill px-3.5 py-2.5 text-[15px] leading-relaxed">
                Hi! Ask me anything about Nakshatra&apos;s work: projects, tech stack, numbers or background. Every answer cites the part of his profile it comes from.
              </div>
              {msgs.map((m, i) => m.role === "user" ? (
                <div key={i} className="max-w-[92%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[15px] text-on-accent">{m.content}</div>
              ) : (
                <div key={i} className="grid max-w-[92%] gap-1.5">
                  <div className="whitespace-pre-wrap rounded-2xl rounded-bl-md bg-fill px-3.5 py-2.5 text-[15px] leading-relaxed [overflow-wrap:anywhere]">
                    {m.content ? <AnswerText text={m.content} /> : (
                      <span className="inline-flex gap-1 py-1" aria-label="Thinking">
                        {[0, 1, 2].map((d) => <i key={d} className="size-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${d * 150}ms` }} />)}
                      </span>
                    )}
                  </div>
                  <SourceList sources={m.sources} note={m.note} />
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
                className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base outline-none focus:border-accent focus-visible:outline-none" />
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

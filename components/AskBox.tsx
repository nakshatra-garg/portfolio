"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { AnswerText, SourceList } from "./AnswerText";
import type { Msg, OpenChatDetail } from "./Chat";
import { askChips } from "@/lib/content";
import { engine } from "@/lib/engine";
import { askLive, ChatError } from "@/lib/live";

export function askChat(q?: string) {
  window.dispatchEvent(new CustomEvent<OpenChatDetail>("open-chat", { detail: q ?? "" }));
}

const ease = [0.23, 1, 0.32, 1] as const;

/** Hero Ask box: answers appear inline; "Continue in chat" hands the exchange to the chat panel. */
export function AskBox() {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [ans, setAns] = useState<Msg | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function ask(question: string) {
    question = question.trim();
    if (!question || busy) return;
    setAsked(question);
    setAns({ role: "assistant", content: "" });
    setBusy(true);
    try {
      const { text, first } = await askLive([{ role: "user", content: question }], (t) => setAns({ role: "assistant", content: t }));
      const sources = [...new Set([...text.matchAll(/\[([a-z0-9-]+)\]/g)].map((m) => m[1]))].filter((id) => engine.titleOf(id));
      setAns({ role: "assistant", content: text, sources, note: `first token ${Math.round(first)} ms` });
    } catch (err) {
      const e = err as ChatError;
      if (e.status === 429 || e.status === 403) setAns({ role: "assistant", content: e.message });
      else {
        const a = engine.answer(question);
        setAns({ role: "assistant", content: a.content, sources: a.sources });
      }
    } finally {
      setBusy(false);
    }
  }

  function continueInChat() {
    if (!asked || !ans) return;
    window.dispatchEvent(new CustomEvent<OpenChatDetail>("open-chat", { detail: { messages: [{ role: "user", content: asked }, ans] } }));
  }

  return (
    <div className="mt-8">
      <form
        role="search"
        aria-label="Ask about my work"
        onSubmit={(e) => { e.preventDefault(); ask(q); setQ(""); }}
        className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface py-1.5 pl-4 pr-1.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
      >
        <Icon name="chat" className="size-5 shrink-0 text-accent" />
        <label htmlFor="ask" className="sr-only">Ask anything about my work</label>
        <input
          id="ask"
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={300}
          autoComplete="off"
          placeholder="Ask anything about my work… e.g. What's your tech stack?"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <button type="submit" aria-label="Ask" disabled={busy} className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent transition-transform active:scale-95 disabled:opacity-60">
          <Icon name="send" className="size-[18px]" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
        {askChips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => ask(c.q)}
            aria-pressed={asked === c.q}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-[border-color,color,background-color,transform] active:scale-[0.97] pointer-coarse:min-h-11 ${asked === c.q ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-accent hover:text-accent"}`}
          >
            <Icon name={c.icon} className="size-[15px] text-accent" />
            {c.label}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {asked && ans && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div aria-live="polite" className="mt-4 grid gap-3 rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted"><span className="font-medium text-ink">You asked:</span> {asked}</p>
                <button type="button" onClick={() => { setAsked(null); setAns(null); input.current?.focus(); }} aria-label="Clear answer" className="-m-2 grid size-11 shrink-0 place-items-center rounded-full text-lg text-muted hover:bg-fill hover:text-ink">×</button>
              </div>
              <motion.div key={asked} initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.25, ease }} className="whitespace-pre-wrap text-[16px] leading-relaxed [overflow-wrap:anywhere]">
                {ans.content ? <AnswerText text={ans.content} /> : (
                  <span className="inline-flex gap-1 py-1" aria-label="Thinking">
                    {[0, 1, 2].map((d) => <i key={d} className="size-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${d * 150}ms` }} />)}
                  </span>
                )}
              </motion.div>
              {!busy && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <SourceList sources={ans.sources} note={ans.note} />
                  <button type="button" onClick={continueInChat} className="inline-flex min-h-10 items-center gap-1.5 rounded-full text-sm font-medium text-accent hover:underline hover:underline-offset-4 pointer-coarse:min-h-11">
                    Continue in chat <Icon name="send" className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

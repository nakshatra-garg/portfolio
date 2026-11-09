"use client";
import { useState } from "react";
import { Icon } from "./Icon";
import { askChips } from "@/lib/content";

export function askChat(q?: string) {
  window.dispatchEvent(new CustomEvent("open-chat", { detail: q ?? "" }));
}

export function AskBox() {
  const [q, setQ] = useState("");
  return (
    <div className="mt-8">
      <form
        role="search"
        aria-label="Ask about my work"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) { askChat(q.trim()); setQ(""); } }}
        className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface py-1.5 pl-4 pr-1.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
      >
        <Icon name="chat" className="size-5 shrink-0 text-accent" />
        <label htmlFor="ask" className="sr-only">Ask anything about my work</label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={300}
          autoComplete="off"
          placeholder="Ask anything about my work… e.g. How did you cut LLM costs?"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Ask" className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent transition-transform active:scale-95">
          <Icon name="send" className="size-[18px]" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
        {askChips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => askChat(c.q)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-medium transition-[border-color,color,transform] hover:border-accent hover:text-accent active:scale-[0.97] pointer-coarse:min-h-11"
          >
            <Icon name={c.icon} className="size-[15px] text-accent" />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

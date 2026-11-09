import { engine } from "@/lib/engine";

/** Renders an answer: **bold**, line breaks, and "[chunk-id]" markers as numbered citation chips. */
export function AnswerText({ text }: { text: string }) {
  const order: string[] = [];
  const parts = text.split(/\s?\[([a-z0-9-]+)\]|(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p === undefined || p === "") return null;
        const kind = i % 3; // 0: text, 1: citation id, 2: bold
        if (kind === 2) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (kind === 1) {
          const t = engine.titleOf(p);
          if (!t) return null;
          if (!order.includes(p)) order.push(p);
          return (
            <span key={i} title={t} className="mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-md bg-accent-soft px-1 align-[1px] text-xs font-semibold text-accent">
              {order.indexOf(p) + 1}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export function SourceList({ sources, note }: { sources?: string[]; note?: string }) {
  if (!sources?.length && !note) return null;
  return (
    <div className="flex flex-wrap gap-1.5 text-xs text-muted">
      {sources?.map((s, n) => <span key={s} className="rounded-full border border-line px-2 py-px">{n + 1} · {engine.titleOf(s)}</span>)}
      {note && <span>{note}</span>}
    </div>
  );
}

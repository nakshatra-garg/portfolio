import { CHAT_ENDPOINT } from "./site";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export class ChatError extends Error { constructor(message: string, public status = 0) { super(message); } }

/** Streams an answer from the chat Worker. Calls onText with the growing text; resolves with the full text and time to first token. */
export async function askLive(history: ChatMsg[], onText: (text: string) => void) {
  if (!CHAT_ENDPOINT) throw new ChatError("offline");
  const t0 = performance.now();
  let first = 0, text = "";
  const res = await fetch(`${CHAT_ENDPOINT}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
  if (!res.ok || !res.body) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new ChatError(msg, res.status);
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let cut;
    while ((cut = buf.indexOf("\n\n")) >= 0) {
      const line = buf.slice(0, cut).trim();
      buf = buf.slice(cut + 2);
      if (!line.startsWith("data:")) continue;
      const ev = JSON.parse(line.slice(5));
      if (ev.t === "text") { if (!first) first = performance.now() - t0; text += ev.v; onText(text); }
      else if (ev.t === "error" && !text) throw new ChatError(ev.v, 502);
    }
  }
  return { text, first };
}

// Offline answer engine for "Ask my résumé".
// 1) Curated intents answer the questions recruiters actually ask, grounded in knowledge.json.
// 2) Otherwise BM25 search (with synonym expansion) returns the single best passage,
//    plus a second only when it is nearly as relevant.
// Pure TypeScript (no React, no path aliases) so it can be unit-tested with plain Node.

export type Chunk = { id: string; title: string; text: string };
export type Answer = { content: string; sources: string[]; via: "intent" | "search" | "none"; intent?: string };

const EMAIL = "gargnakshatra11@gmail.com";

/* ------------------------------------------------------------------ intents */
type Intent = { id: string; patterns: [RegExp, number][]; answer: string; sources: string[] };

// Each pattern adds its weight when it matches; the best-scoring intent wins if it clears MIN_INTENT.
const MIN_INTENT = 2;
const INTENTS: Intent[] = [
  {
    id: "confidential",
    patterns: [[/\b(which|what)\b.*\b(model|llm)s?\b.*\b(use|using|host|serve|self-host|fine-?tun|run)/, 2], [/\bmodel (name|family|size)\b/, 3], [/\b(gemma|qwen|llama|mistral|deepseek|phi)\b/, 3]],
    answer: "The specific models Nakshatra runs in production are confidential. What he can share: it's an **open-weight LLM served on vLLM and NVIDIA H200 GPUs**, fine-tuned with **LoRA** and evaluated with **LLM-as-a-judge** and human review. [llm-selfhosted] [finetuning]",
    sources: ["llm-selfhosted", "finetuning"],
  },
  {
    id: "stack",
    patterns: [[/\btech(nology)?[\s-]*stack\b/, 4], [/\b(tools?|technolog(y|ies)|frameworks?|libraries|toolkit)\b/, 2], [/\b(stack)\b/, 1], [/\bskills?\b/, 2], [/\bprogramming|languages? (does|do) (he|you) (use|code|write)|\bcode in\b/, 3], [/\bwhat does he (use|work with)\b/, 2]],
    answer: "Nakshatra's core stack:\n• **Serving:** vLLM, streaming inference, CUDA graphs, multi-GPU on NVIDIA H200, Blackwell, A100 and T4\n• **GenAI:** RAG (BM25 + dense + reranking), BGE-M3 embeddings, LoRA/QLoRA, Hugging Face, LLM-as-a-judge, guardrails\n• **Voice:** ASR/STT, TTS, spoken language ID, RVC voice cloning, Azure Speech\n• **Backend & ops:** Python, FastAPI, Flask, WebSocket, Docker, HAProxy, Redis, Prometheus\n• **Data & cloud:** Qdrant, pgvector, FAISS, PostgreSQL, Azure, AWS [skills-llm] [skills-genai] [skills-voice] [skills-infra]",
    sources: ["skills-llm", "skills-genai", "skills-voice", "skills-infra"],
  },
  {
    id: "cost",
    patterns: [[/\bcosts?\b|cheap|\bsav(e|ed|ing|ings)\b|\bbill|money|40 ?%/, 3], [/\bself[\s-]?host/, 2], [/\b(third[\s-]party|api)\b/, 1], [/\breplace/, 1]],
    answer: "He replaced a third-party LLM API with a **self-hosted open-weight model on vLLM and NVIDIA H200 GPUs**, serving about **2.5M voice-bot calls a day** behind a smart **HAProxy router**. Result: **~40% lower inference cost**, quality and latency that **matched or beat** the API, and **no caller data leaving** the company's infrastructure. [llm-selfhosted]",
    sources: ["llm-selfhosted"],
  },
  {
    id: "latency",
    patterns: [[/\bttfs\b|time[\s-]to[\s-]first[\s-]sentence/, 4], [/\bttft\b|first token/, 3], [/\blatency|fast|speed|p95|p99|milliseconds?|\bms\b/, 2]],
    answer: "Nakshatra made **time to first sentence (TTFS)** the voice latency metric instead of time to first token, because TTS can't speak until a full sentence exists. In production: **50 ms TTFT**, **0.3 s p95 / 0.6 s p99 TTFS**, and **1.5–2 s p95** for the full reply, tracked live on Prometheus. [latency-ttfs]",
    sources: ["latency-ttfs"],
  },
  {
    id: "langid",
    patterns: [[/\blanguage[\s-]?(id|identification|detection|detect)|\blid\b|spoken language|which language/, 4], [/\baudio (tower|encoder)/, 3], [/\bmultilingual|hindi|english detection/, 2]],
    answer: "He built the **in-house spoken language-ID model** used in production: he opened up a **multimodal LLM**, extracted its **audio tower** and **fine-tuned it for language detection**, then paired it with a **semantic-similarity text classifier**. The ensemble runs at **95%+ accuracy**. On serving, **CUDA graph capture** cut audio encoding **35×**, scaling to **100+ concurrent callers** at **sub-300 ms p95**. [lang-id]",
    sources: ["lang-id"],
  },
  {
    id: "rag",
    patterns: [[/\brag\b|retrieval|retriev|vector (db|database|search)|semantic search|hybrid search|embedding|rerank/, 4], [/\bqdrant|bm25|knowledge base|chatbots?\b/, 2]],
    answer: "He built production **hybrid-retrieval RAG**: **BM25 + dense vectors in Qdrant + reranking**, for chat and voice bots across multiple enterprise clients. It reaches **~80% precision@3**, reduces hallucinations and improves flow completion, backed by an embedding service with **two-tier caching (Redis + Qdrant)**. [rag]",
    sources: ["rag"],
  },
  {
    id: "finetune",
    patterns: [[/\bfine[\s-]?tun|lora|qlora|train(ed|ing)? (a |an |the )?(model|llm)|\bpeft\b/, 4], [/\b(asr|tts|speech) (model|training)/, 2], [/\bevaluat|llm[\s-]as[\s-]a[\s-]judge/, 2]],
    answer: "Yes. He **fine-tunes open-weight LLMs with LoRA**, evaluated with **LLM-as-a-judge** and human review, and **fine-tuned an LLM's audio tower** for spoken language detection. He also owns data collection, curation and **training pipelines for in-house ASR and TTS** models. [finetuning] [lang-id]",
    sources: ["finetuning", "lang-id"],
  },
  {
    id: "guardrails",
    patterns: [[/\bguard ?rails?\b|safety|pii|redact|hallucinat|harmful|thinking[\s-]tokens?|leak/, 4], [/\bguardrail stack\b/, 3]],
    answer: "He designed a **multi-layer guardrail stack** over the LLM serving layer: **PII redaction**, **reasoning/thinking-token leak suppression**, **repetition control**, **harmful-content filtering** and **system-prompt adherence**, all running **inside the production latency budget**. [guardrails]",
    sources: ["guardrails"],
  },
  {
    id: "gpus",
    patterns: [[/\bgpus?\b|h200|blackwell|a100|\bt4\b|nvidia|cuda|hardware|infra(structure)?\b/, 4]],
    answer: "He has deployed on **NVIDIA H200**, **Blackwell**, **A100** and **T4** GPUs. The self-hosted LLM runs on **H200s with vLLM**, and he led a **multi-GPU rollout from A100 to Blackwell** for the language-ID service that **doubled capacity**, using **CUDA graph capture** to cut audio encoding 35×. [skills-llm] [lang-id] [llm-selfhosted]",
    sources: ["skills-llm", "lang-id", "llm-selfhosted"],
  },
  {
    id: "experience",
    patterns: [[/\bexperience|years|how long|career|background|work history|worked|previous (job|role)|internships?/, 3], [/\bcurrent(ly)? (role|job|position|company|work)|where does he (currently )?work|works? (at|for)\b|employer|rezo/, 3]],
    answer: "**3+ years** in production AI, all at **Rezo.ai** in Noida: **Data Scientist / AI Associate** since **May 2024**, after a **Data Science internship** there from **Aug 2023 to Apr 2024**. Earlier internships: **vel.ai** (2021–22), **Technocolabs** (2021) and **TheSmartBridge** (2020). [role-current] [exp-velai]",
    sources: ["role-current", "exp-velai"],
  },
  {
    id: "education",
    patterns: [[/\beducation|degree|stud(y|ied)|college|universit|m\.?tech|b\.?tech|cgpa|gpa|vit\b|graduat/, 4]],
    answer: "**M.Tech in Computer Science and Engineering (AI/ML)** from **VIT Vellore** (2022–24, CGPA **8.9**) and **B.Tech in Information Technology** from **College of Engineering Roorkee** (2018–22, CGPA **8.4**). During the M.Tech he published research on **crop-yield prediction with a deep-learning transformer**. [education] [publication]",
    sources: ["education", "publication"],
  },
  {
    id: "contact",
    patterns: [[/\bcontact|reach|email|mail|hire|get in touch|linkedin|github|connect|resume|cv\b|phone|call him/, 4]],
    answer: `The best way to reach Nakshatra is email: **${EMAIL}**. He's also on **LinkedIn** (linkedin.com/in/nakshatra-garg) and **GitHub** (github.com/nakshatra-garg), and his résumé can be downloaded from this site. [contact]`,
    sources: ["contact"],
  },
  {
    id: "location",
    patterns: [[/\bwhere (is he|does he live|based)|location|located|city|country|remote|relocat/, 4]],
    answer: "Nakshatra is based in **Noida, Uttar Pradesh, India**. [summary]",
    sources: ["summary"],
  },
  {
    id: "about",
    patterns: [[/\bwho is|tell me about (him|nakshatra|yourself)\b|about (him|nakshatra)\b|summar|introduce|overview|what does he do\b|elevator pitch/, 4]],
    answer: "Nakshatra Garg is an **AI engineer** at **Rezo.ai** (Noida, India) with **3+ years** building **production LLM and voice AI**. He owns a **self-hosted LLM serving millions of voice-bot calls a day** (~40% cheaper than the API it replaced), built the **guardrail stack**, **hybrid RAG** and an **in-house language-ID model (95%+)**, and works across inference, fine-tuning and real-time speech. [summary] [llm-selfhosted]",
    sources: ["summary", "llm-selfhosted"],
  },
  {
    id: "projects",
    patterns: [[/\bprojects?|built|systems?|what has he (made|done|shipped)|portfolio|work on|accomplish|achievement/, 3]],
    answer: "Highlights:\n• **Self-hosted LLM** for millions of voice-bot calls a day, **~40% cheaper** [llm-selfhosted]\n• **In-house language ID**, fine-tuned audio tower + text classifier, **95%+** [lang-id]\n• **Guardrail stack** inside the latency budget [guardrails]\n• **Hybrid RAG**, **~80% precision@3** [rag]\n• **Real-time voice cloning**, 20 s → ~1 s [voice-cloning]\n• **ID-document OCR** for a leading Indian bank [ocr-kyc]",
    sources: ["llm-selfhosted", "lang-id", "guardrails", "rag", "voice-cloning", "ocr-kyc"],
  },
];

/* --------------------------------------------------------------- BM25 search */
const STOP = new Set("a an the and or of to in on for with at by from is are was were be been has have had he his him she her it its this that these those what which who whom how why when where do does did can could would should will i me my you your we our they their as about into than then there here any some not no yes also just over under more most very much many tell nakshatra garg".split(" "));
const SYNONYMS: Record<string, string[]> = {
  stack: ["skill", "tool"], tool: ["skill"], tech: ["skill"], technology: ["skill"],
  speed: ["latency"], fast: ["latency"], slow: ["latency"],
  cheap: ["cost"], saving: ["cost"],
  speech: ["voice", "asr", "tts"], audio: ["voice", "speech"],
  search: ["retrieval", "rag"], vector: ["qdrant", "retrieval"],
  job: ["role", "rezo"], work: ["role", "experience"],
  school: ["education"], degree: ["education"],
};
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");
export const tokenize = (s: string) =>
  (s.toLowerCase().normalize("NFKD").match(/[a-z0-9.+#×%-]+/g) ?? [])
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((w) => w && !STOP.has(w))
    .map(stem)
    .filter((w) => w.length > 1);

export function createEngine(chunks: Chunk[]) {
  const docs = chunks.map((c) => tokenize(`${c.title} ${c.title} ${c.text}`));
  const df = new Map<string, number>();
  docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const avg = docs.reduce((a, d) => a + d.length, 0) / docs.length;
  const byId = new Map(chunks.map((c) => [c.id, c]));

  function search(query: string) {
    const base = tokenize(query);
    const expanded = new Set(base);
    base.forEach((t) => (SYNONYMS[t] ?? []).forEach((s) => expanded.add(stem(s))));
    return docs
      .map((d, i) => {
        const tf = new Map<string, number>();
        d.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
        let score = 0;
        for (const t of expanded) {
          const f = tf.get(t);
          if (!f) continue;
          const n = df.get(t)!;
          const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
          const w = base.includes(t) ? 1 : 0.6; // synonyms count a bit less
          score += (w * idf * (f * 2.4)) / (f + 1.4 * (0.25 + (0.75 * d.length) / avg));
        }
        return { i, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function matchIntent(question: string) {
    const q = question.toLowerCase();
    let best: { intent: Intent; score: number } | null = null;
    for (const intent of INTENTS) {
      const score = intent.patterns.reduce((s, [re, w]) => (re.test(q) ? s + w : s), 0);
      if (score >= MIN_INTENT && (!best || score > best.score)) best = { intent, score };
    }
    return best;
  }

  function answer(question: string): Answer {
    const hit = matchIntent(question);
    if (hit) {
      const sources = hit.intent.sources.filter((id) => byId.has(id));
      return { content: hit.intent.answer, sources, via: "intent", intent: hit.intent.id };
    }
    const hits = search(question).slice(0, 3);
    if (!hits.length || hits[0].score < 1.6) {
      return {
        content: `I don't have that detail in Nakshatra's profile. Try asking about his projects, tech stack, latency work, experience or education, or email him at **${EMAIL}**.`,
        sources: [], via: "none",
      };
    }
    const q = new Set(tokenize(question));
    // Only add a second passage when it is nearly as relevant as the first.
    const top = hits.filter((h, i) => i === 0 || h.score >= hits[0].score * 0.8).slice(0, 2);
    const parts = top.map((h) => {
      const c = chunks[h.i];
      const sents = c.text.split(/(?<=[.!?])\s+(?=[A-Z(])/);
      const picked = sents
        .map((s, j) => ({ s, j, hit: tokenize(s).filter((t) => q.has(t)).length }))
        .sort((a, b) => b.hit - a.hit || a.j - b.j)
        .slice(0, 2)
        .sort((a, b) => a.j - b.j);
      return `${picked.map((p) => p.s).join(" ")} [${c.id}]`;
    });
    return { content: parts.join("\n\n"), sources: top.map((h) => chunks[h.i].id), via: "search" };
  }

  return { answer, search, titleOf: (id: string) => byId.get(id)?.title };
}

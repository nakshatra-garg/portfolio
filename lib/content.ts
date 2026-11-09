// All page content lives here. Wrap words in **double asterisks** to bold them.

export type IconName =
  | "server" | "language" | "shield" | "rag" | "tune" | "mic" | "cache" | "idcard" | "code" | "chart";

export type Project = {
  slug: string;
  cat: ("llm" | "voice" | "rag" | "vision")[];
  label: string;
  title: string;
  metric: string;
  desc: string;
  tags: string[];
  icon: IconName;
};

export const person = {
  name: "Nakshatra Garg",
  first: "Nakshatra",
  last: "Garg",
  role: "AI Engineer",
  focus: "LLM inference & voice AI",
  location: "Noida, India",
  headline: "I build LLM and voice AI systems that handle **millions of calls** a day.",
  summary:
    "I build **LLM and voice AI systems** that run in **production** for enterprise clients at Rezo.ai: **self-hosted inference**, **guardrails**, **RAG** and **real-time speech**. I optimise for what callers actually feel, like how fast the first sentence is spoken.",
};

export const stats = [
  { value: "~40%", label: "lower LLM inference cost" },
  { value: "0.3 s", label: "p95 time to first sentence" },
  { value: "35×", label: "faster audio encode" },
  { value: "95%+", label: "in-house language-ID accuracy" },
];

export const glance = [
  { k: "Current role", v: "Data Scientist / AI Associate, Rezo.ai" },
  { k: "Experience", v: "3+ years in production AI" },
  { k: "Focus", v: "LLM inference · Voice AI · RAG" },
  { k: "Core stack", v: "Python, vLLM, FastAPI, Qdrant, Docker" },
  { k: "Education", v: "M.Tech CSE (AI/ML), VIT · 8.9" },
];

export const ticker = [
  "vLLM", "NVIDIA H200 · Blackwell", "CUDA graphs", "LoRA / QLoRA", "Qdrant", "BM25 + dense retrieval",
  "Reranking", "Guardrails", "ASR · TTS", "FastAPI", "Redis", "Prometheus", "HAProxy", "Docker", "pgvector", "LLM-as-a-judge",
];

export const flagship = {
  label: "LLM serving · flagship",
  title: "Self-hosted LLM serving millions of voice-bot calls a day",
  metric: "−40% cost",
  desc:
    "Replaced a third-party LLM API with an **open-weight model on vLLM and NVIDIA H200s** (~2.5M calls a day), behind a smart **HAProxy router**. **~40% cheaper**, quality and latency matched or beat the API, and **no caller data leaves our infrastructure**.",
  tags: ["vLLM", "H200", "HAProxy", "Prometheus"],
  latency: [
    { label: "First token", value: 50, shown: "50 ms" },
    { label: "First sentence p95", value: 300, shown: "0.3 s" },
    { label: "First sentence p99", value: 600, shown: "0.6 s" },
    { label: "Full reply p95", value: 1500, to: 2000, shown: "1.5–2 s" },
  ],
  note: "I made **time to first sentence** our voice latency metric: TTS can't speak until a sentence exists, so first-token time undersells the wait.",
};

export const projects: Project[] = [
  {
    slug: "language-id", cat: ["voice", "llm"], label: "Voice · fine-tuning", icon: "language",
    title: "In-house spoken language identification", metric: "95%+ in production",
    desc: "Opened up a **multimodal LLM**, extracted its **audio tower** and **fine-tuned it for language detection**, then paired it with a **semantic-similarity text classifier**. **CUDA graph capture** cut audio encoding **35×**; serves **100+ concurrent callers** at **sub-300 ms p95**.",
    tags: ["Model surgery", "Audio encoder fine-tuning", "Ensemble", "CUDA graphs"],
  },
  {
    slug: "guardrails", cat: ["llm"], label: "LLM serving · safety", icon: "shield",
    title: "Multi-layer guardrail stack", metric: "5 layers",
    desc: "**PII redaction**, reasoning-token leak suppression, repetition control, harmful-content filtering and system-prompt adherence, all **inside the production latency budget**.",
    tags: ["PII redaction", "Streaming", "Content filters"],
  },
  {
    slug: "rag", cat: ["rag"], label: "RAG · retrieval", icon: "rag",
    title: "Hybrid-retrieval RAG for chat and voice bots", metric: "~80% precision@3",
    desc: "**BM25 + dense vectors** in Qdrant, then **reranking**, across multiple enterprise clients. **Fewer hallucinations** and higher flow completion, backed by an embedding service with **two-tier caching**.",
    tags: ["BM25", "Qdrant", "Reranking", "Redis"],
  },
  {
    slug: "training", cat: ["llm", "voice"], label: "Training", icon: "tune",
    title: "LoRA fine-tuning and in-house ASR/TTS", metric: "LoRA + LLM-as-a-judge",
    desc: "**LoRA fine-tunes** evaluated with **LLM-as-a-judge** and human review. I own data collection, curation and **training pipelines** for in-house speech recognition and synthesis.",
    tags: ["LoRA / QLoRA", "LLM-as-a-judge", "ASR", "TTS"],
  },
  {
    slug: "voice-cloning", cat: ["voice"], label: "Voice · synthesis", icon: "mic",
    title: "Real-time voice cloning", metric: "20 s → 1 s",
    desc: "A headless, **in-memory inference pipeline** on RVC that made voice cloning **fast enough for live calls**.",
    tags: ["RVC", "In-memory inference"],
  },
  {
    slug: "tts-cache", cat: ["voice", "rag"], label: "Voice · caching", icon: "cache",
    title: "Vector-similarity TTS cache", metric: "Synthesize once",
    desc: "Matches new bot utterances to **semantically identical past audio**, cutting redundant synthesis and **TTS cost**.",
    tags: ["BGE-M3", "pgvector", "Azure Blob"],
  },
  {
    slug: "ocr", cat: ["vision"], label: "Vision · KYC", icon: "idcard",
    title: "ID-document OCR for a leading Indian bank", metric: "Aadhaar & PAN",
    desc: "Extraction from government ID documents powering **production KYC**. Earlier lifted **OCR accuracy 15%** by reworking detection-to-OCR and retraining against drift.",
    tags: ["Object detection", "OCR"],
  },
  {
    slug: "code-review", cat: ["llm"], label: "Developer tooling", icon: "code",
    title: "LLM-powered code review", metric: "Team-wide",
    desc: "**Led** an LLM code-review system that checks changes against **engineering best practices** across teams.",
    tags: ["LLM agents", "Prompting"],
  },
  {
    slug: "speech-analytics", cat: ["voice"], label: "Voice · analytics", icon: "chart",
    title: "Speech analytics and rudeness detection", metric: "Post-call insight",
    desc: "Call metrics (silence, interruptions, response latency, flow) plus an **audio-feature rudeness classifier**, served via Flask APIs.",
    tags: ["Audio features", "Classification", "Flask"],
  },
];

export type ChapterVisual = "pressure" | "measure" | "host" | "leak" | "shadow" | "result";

/** "How I work", told through one real project: moving voice-bot traffic off a third-party LLM API. */
export const story = {
  eyebrow: "How I work",
  title: "How we moved millions of calls off a third-party LLM API.",
  intro: "One project, start to finish. It's the clearest picture of how I work: measure what users feel, build the boring safety rails, and never switch without proof.",
  chapters: [
    {
      id: "why", kicker: "The breaking point", visual: "pressure" as ChapterVisual,
      title: "Three problems that grew with every call",
      body: "Our voice bots were running on a third-party LLM API. At **millions of calls a day**, three things kept growing: the **bill**, the **caller data leaving our infrastructure**, and the **outages and rate limits** we couldn't control.",
    },
    {
      id: "measure", kicker: "Measure first", visual: "measure" as ChapterVisual,
      title: "Decide what “fast” means for a caller",
      body: "Before changing anything, I defined the number that matches what callers feel. First token was already quick, but a caller hears **sentences, not tokens**. So we track **time to first sentence (TTFS)** at p95 and p99, live on Prometheus.",
    },
    {
      id: "host", kicker: "Build", visual: "host" as ChapterVisual,
      title: "Self-host an open-weight model",
      body: "An open-weight model on **vLLM** and **NVIDIA H200 GPUs**, behind a smart **HAProxy router** that spreads load across GPUs. Every request stays **inside our infrastructure**.",
    },
    {
      id: "leak", kicker: "The turning point", visual: "leak" as ChapterVisual,
      title: "The model said things it shouldn't",
      body: "Early outputs **leaked the model's thinking tokens** and sometimes **repeated themselves**, which a caller would hear out loud. I built a **multi-layer guardrail stack** on the stream: thinking-token suppression, repetition control, PII redaction, content filtering and prompt adherence, all **inside the latency budget**.",
    },
    {
      id: "shadow", kicker: "Prove it", visual: "shadow" as ChapterVisual,
      title: "Shadow real calls before switching",
      body: "We **mirrored live calls** to the new model while the old API still answered callers. Its replies were never used, only **compared on quality and latency**. We switched only once the self-hosted model **matched or beat** the API.",
    },
    {
      id: "result", kicker: "The result", visual: "result" as ChapterVisual,
      title: "Cheaper, faster to speak, and ours",
      body: "**~40% lower inference cost**, quality and latency **matched or beat** the old API, **no caller data leaves** our infrastructure, and the first sentence is ready in **0.3 s at p95**.",
    },
  ],
};

export const experience = [
  {
    when: "May 2024 – present", role: "Data Scientist / AI Associate", org: "Rezo.ai",
    points: [
      "**Own the self-hosted LLM** behind ~2.5M voice-bot calls a day; introduced **TTFS** as the voice latency metric.",
      "Built an **in-house language-ID model** (fine-tuned LLM audio tower + text classifier, **95%+ accuracy**), the **guardrail stack**, **hybrid RAG**, TTS cache and real-time voice cloning.",
      "**Fine-tune LLMs with LoRA**; own data and training pipelines for in-house **ASR and TTS**.",
    ],
  },
  {
    when: "Aug 2023 – Apr 2024", role: "Data Science Intern", org: "Rezo.ai",
    points: [
      "Improved **document OCR** by upgrading and retraining the detection model; shipped Flask APIs with Swagger docs.",
      "Designed **speech-analytics metrics** and a rudeness-detection dataset from audio features.",
    ],
  },
];

export const earlier = [
  { org: "vel.ai", what: "X-ray object detection; time-series forecasting for crypto and energy data", when: "Dec 2021 – May 2022" },
  { org: "Technocolabs", what: "End-to-end intraday-trading ML project with an LSTM, deployed on Flask", when: "May – Jun 2021" },
  { org: "TheSmartBridge", what: "Customer-care chatbot on IBM Watson grounded in a user manual", when: "May – Jun 2020" },
];

export const skills = [
  { k: "LLM serving", v: "vLLM · open-weight LLMs · streaming inference · TTFT/p95 tuning · CUDA graphs · multi-GPU (H200, Blackwell, A100, T4) · Ollama" },
  { k: "GenAI & NLP", v: "RAG · BM25 + dense hybrid · reranking · BGE-M3 · LoRA/QLoRA · Hugging Face · LLM-as-a-judge · guardrails · multimodal LLMs · Claude" },
  { k: "Speech & voice", v: "ASR/STT · TTS · language ID (fine-tuned audio encoders) · RVC voice cloning · SpeechBrain · Azure Speech · real-time voice bots" },
  { k: "LLMOps", v: "Docker · HAProxy · Prometheus · Redis · model-serving APIs · monitoring" },
  { k: "Languages & APIs", v: "Python · FastAPI · Flask · WebSocket · REST · SQL" },
  { k: "Data & cloud", v: "Qdrant · pgvector · FAISS · ChromaDB · MySQL · Azure (ML, AI Services, Speech, Blob) · AWS (EC2, S3, Bedrock)" },
];

export const education = [
  { level: "M.Tech", field: "Computer Science and Engineering", focus: "AI / ML", school: "Vellore Institute of Technology", years: "2022 – 2024", cgpa: 8.9 },
  { level: "B.Tech", field: "Information Technology", focus: "", school: "College of Engineering Roorkee", years: "2018 – 2022", cgpa: 8.4 },
];

export const publication = {
  title: "Predictive Modeling of Crop Yield Using Deep Learning Based Transformer with Climate Change Effects",
  topics: ["Deep learning", "Transformers", "Climate change", "Crop yield"],
};

export type Cert = { name: string; issuer?: string; topic: string };

/** Most relevant to AI engineering first. Only credentials listed on LinkedIn; issuers only where known. */
export const certFeatured: Cert[] = [
  { name: "IBM Applied AI Professional Certificate", issuer: "IBM", topic: "Applied AI" },
  { name: "Advanced Computer Vision with TensorFlow", issuer: "DeepLearning.AI", topic: "Computer vision" },
];
export const certMore: Cert[] = [
  { name: "Visual Analytics with Tableau", topic: "Data visualisation" },
  { name: "Programming Fundamentals", topic: "Programming" },
  { name: "Google IT Support Professional Certificate", issuer: "Google", topic: "IT fundamentals" },
];
export const honors = ["Adzap Quiz"];

export const languages = ["English, native or bilingual", "Hindi, native or bilingual"];

export const askChips = [
  { label: "Projects", icon: "server" as IconName, q: "What production LLM systems has he built?" },
  { label: "Latency", icon: "chart" as IconName, q: "What is TTFS and why does it matter?" },
  { label: "Voice AI", icon: "language" as IconName, q: "How does he do spoken language identification?" },
  { label: "RAG", icon: "rag" as IconName, q: "What RAG work has he done?" },
  { label: "Tech stack", icon: "tune" as IconName, q: "What is his tech stack?" },
];

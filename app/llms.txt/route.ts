import { SITE_URL } from "@/lib/site";
import { publishedPosts } from "@/lib/posts";

export const dynamic = "force-static";

/** Plain-text profile for AI search engines and assistants (llmstxt.org). */
export function GET() {
  const body = `# Nakshatra Garg

> AI engineer (Data Scientist / AI Associate at Rezo.ai, Noida, India) who builds production LLM and voice AI systems that handle millions of calls a day: self-hosted LLM inference, guardrails, hybrid-retrieval RAG and real-time speech (ASR/TTS).

## Highlights
- Owns a self-hosted open-weight LLM on vLLM and NVIDIA H200 GPUs serving ~2.5M voice-bot calls a day; replaced a third-party API at ~40% lower inference cost.
- Introduced Time-to-First-Sentence (TTFS) as the voice latency metric: 50 ms TTFT, 0.3 s p95 / 0.6 s p99 TTFS, 1.5–2 s p95 full response.
- Multi-layer guardrails: PII redaction, reasoning-token leak suppression, repetition control, content filtering.
- In-house spoken language identification: fine-tuned the audio tower extracted from a multimodal LLM and ensembled it with a semantic-similarity text classifier; 95%+ accuracy in production. 35x faster audio encode with CUDA graphs, 100+ concurrent callers, sub-300 ms p95.
- Hybrid RAG (BM25 + dense vectors in Qdrant + reranking): ~80% precision@3 across enterprise clients.
- LoRA fine-tuning of open-weight LLMs with LLM-as-a-judge evaluation; owns in-house ASR/TTS training pipelines.
- Real-time voice cloning on RVC: 20 s to ~1 s latency.

## Background
- M.Tech, Computer Science and Engineering (AI/ML), Vellore Institute of Technology, 2024 (CGPA 8.9).
- B.Tech, Information Technology, College of Engineering Roorkee, 2022 (CGPA 8.4).
- Publication: Predictive Modeling of Crop Yield Using Deep Learning Based Transformer with Climate Change Effects.

## Links
- [Website](${SITE_URL}/)
- [Résumé (PDF)](${SITE_URL}/files/Nakshatra_Garg_Resume.pdf)
- [LinkedIn](https://www.linkedin.com/in/nakshatra-garg)
- [GitHub](https://github.com/nakshatra-garg)
- Email: gargnakshatra11@gmail.com
${publishedPosts.length ? `\n## Writing\n${publishedPosts.map((p) => `- [${p.title}](${SITE_URL}/writing/${p.slug}/): ${p.description}`).join("\n")}\n` : ""}`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

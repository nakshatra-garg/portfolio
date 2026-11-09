import kb from "./knowledge.json";
import { createEngine, type Chunk } from "./answer";

/** Shared offline engine instance for the site. */
export const engine = createEngine((kb as { chunks: Chunk[] }).chunks);

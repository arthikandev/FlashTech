/**
 * Knowledge selection: semantic (OpenAI embeddings) with heuristic fallback.
 */

import OpenAI from "openai";

export type KnowledgeChunk = {
  id: string;
  text: string;
  embeddingId?: string;
};

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_TIMEOUT_MS = 1200;

function pickKnowledgeHeuristic(args: {
  chunks: KnowledgeChunk[];
  pageHistory: Array<{ path: string }>;
  maxChunks?: number;
}): string {
  const { chunks, pageHistory, maxChunks = 3 } = args;
  if (chunks.length === 0) return "";

  const pathText = pageHistory.map((p) => p.path.toLowerCase()).join(" ");

  const scored = chunks.map((chunk) => {
    const id = chunk.id.toLowerCase();
    const text = chunk.text.toLowerCase();
    let score = 0;
    if (pathText.includes(id)) score += 3;
    if (pathText.includes("pricing") && (id.includes("gold") || id.includes("platinum")))
      score += 2;
    if (text.split(" ").some((w) => w.length > 4 && pathText.includes(w))) score += 1;
    return { chunk, score };
  });

  const selected = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map((s) => s.chunk);

  const fallback = selected.length > 0 ? selected : chunks.slice(0, maxChunks);

  return fallback.map((c) => `- ${c.text}`).join("\n");
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function embedTexts(
  client: OpenAI,
  texts: string[]
): Promise<number[][]> {
  const res = await Promise.race([
    client.embeddings.create({ model: EMBEDDING_MODEL, input: texts }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("embedding_timeout")), EMBEDDING_TIMEOUT_MS)
    ),
  ]);
  return res.data.map((d) => d.embedding);
}

async function pickKnowledgeSemantic(args: {
  chunks: KnowledgeChunk[];
  pageHistory: Array<{ path: string }>;
  crmNotes?: string;
  maxChunks?: number;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || args.chunks.length === 0) {
    return pickKnowledgeHeuristic(args);
  }

  const { chunks, pageHistory, crmNotes, maxChunks = 3 } = args;
  const pathText = pageHistory.map((p) => `${p.path}`).join(" ");
  const query = [pathText, crmNotes?.trim()].filter(Boolean).join(" — ").slice(0, 500);
  if (!query.trim()) {
    return pickKnowledgeHeuristic(args);
  }

  try {
    const client = new OpenAI({ apiKey });
    const chunkTexts = chunks.map((c) => c.text.slice(0, 800));
    const [queryVec, ...chunkVecs] = await embedTexts(client, [query, ...chunkTexts]);

    const ranked = chunks
      .map((chunk, i) => ({
        chunk,
        score: cosineSimilarity(queryVec, chunkVecs[i] ?? []),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxChunks);

    if (ranked.length === 0 || ranked[0]!.score < 0.2) {
      return pickKnowledgeHeuristic(args);
    }

    return ranked.map((r) => `- ${r.chunk.text}`).join("\n");
  } catch {
    return pickKnowledgeHeuristic(args);
  }
}

/** Sync API — heuristic only (legacy callers). */
export function pickKnowledgeContext(args: {
  chunks: KnowledgeChunk[];
  pageHistory: Array<{ path: string }>;
  maxChunks?: number;
}): string {
  return pickKnowledgeHeuristic(args);
}

/** Preferred: semantic match when OPENAI_API_KEY is set. */
export async function pickKnowledgeContextAsync(args: {
  chunks: KnowledgeChunk[];
  pageHistory: Array<{ path: string }>;
  crmNotes?: string;
  maxChunks?: number;
}): Promise<string> {
  return pickKnowledgeSemantic(args);
}

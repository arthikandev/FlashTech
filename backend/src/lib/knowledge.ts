/**
 * Lightweight knowledge selection from business chunks (no embeddings yet).
 * Picks chunks whose id/text match visitor page paths or CRM signals.
 */

export type KnowledgeChunk = {
  id: string;
  text: string;
  embeddingId?: string;
};

export function pickKnowledgeContext(args: {
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

  const fallback =
    selected.length > 0 ? selected : chunks.slice(0, maxChunks);

  return fallback.map((c) => `- ${c.text}`).join("\n");
}

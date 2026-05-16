import type { BPSessionEndData } from "./beyondpresence/client";
import type { TranscriptTurn } from "./webhook";

export function mapBpMessagesToTranscript(
  session: BPSessionEndData | undefined,
  fallbackOpener: string
): TranscriptTurn[] {
  const raw = session?.messages ?? [];
  const turns: TranscriptTurn[] = raw
    .map((m, i) => {
      const text = (m.text ?? m.content ?? "").trim();
      if (!text) return null;
      const role =
        m.role === "user" || m.role === "human" ? ("user" as const) : ("assistant" as const);
      return {
        role,
        text,
        timestamp: Date.now() - (raw.length - i) * 1000,
      };
    })
    .filter((t): t is TranscriptTurn => t != null);

  if (turns.length > 0) return turns;

  return [
    {
      role: "assistant",
      text: fallbackOpener,
      timestamp: Date.now() - 1000,
    },
    {
      role: "user",
      text: "Session ended",
      timestamp: Date.now(),
    },
  ];
}

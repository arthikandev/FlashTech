/** Default Beyond Presence agent — single source of truth for demos and fallbacks */
export const DEMO_AGENT_ID = "9fe4cbe8-2f99-4b8e-9dda-60f32846300a";

const BEY_CHAT_BASE = "https://bey.chat";

export function beyondPresenceEmbedUrl(agentId?: string | null): string {
  const id = agentId?.trim() || DEMO_AGENT_ID;
  return `${BEY_CHAT_BASE}/${encodeURIComponent(id)}`;
}

type Props = {
  agentId?: string | null;
  className?: string;
  height?: number;
  title?: string;
};

export function BeyondPresenceFrame({
  agentId,
  className = "",
  height = 520,
  title = "Beyond Presence AI Avatar",
}: Props) {
  return (
    <iframe
      src={beyondPresenceEmbedUrl(agentId)}
      title={title}
      allow="camera; microphone; autoplay; fullscreen"
      className={`w-full rounded-xl border-0 bg-black ${className}`.trim()}
      style={{ height, maxWidth: "100%" }}
    />
  );
}

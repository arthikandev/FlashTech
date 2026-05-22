const BEY_CHAT_BASE = "https://bey.chat";

export function beyondPresenceEmbedUrl(agentId: string): string {
  return `${BEY_CHAT_BASE}/${encodeURIComponent(agentId)}`;
}

type Props = {
  agentId: string;
  className?: string;
  height?: number;
  title?: string;
  /** When set, autoplay this MP4 instead of the Bey.chat iframe (e.g. `PREVIEW_VIDEO_SRC`). */
  videoSrc?: string;
};

export function BeyondPresenceFrame({
  agentId,
  className = "",
  height = 520,
  title = "Beyond Presence AI Avatar",
  videoSrc,
}: Props) {
  const chrome = `w-full rounded-xl border-0 bg-black ${className}`.trim();
  const style = { height, maxWidth: "100%" as const };

  if (videoSrc) {
    return (
      <video
        aria-label={title}
        title={title}
        className={`${chrome} object-cover`}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={style}
      />
    );
  }

  return (
    <iframe
      src={beyondPresenceEmbedUrl(agentId)}
      title={title}
      allow="camera; microphone; autoplay; fullscreen"
      className={chrome}
      style={style}
    />
  );
}

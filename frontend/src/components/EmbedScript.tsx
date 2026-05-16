import { useEffect } from "react";

type ReadyDetail = {
  visitorId: string;
  businessId: string;
  sessionId: string;
  returnCount?: number;
  isKnownVisitor?: boolean;
};

type Props = {
  embedKey: string;
  onReady?: (detail: ReadyDetail) => void;
};

export function EmbedScript({ embedKey, onReady }: Props) {
  const baseUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const src = `${baseUrl}/api/embed/${embedKey}`;

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ReadyDetail>).detail;
      if (detail?.visitorId) {
        onReady?.(detail);
      }
    };
    window.addEventListener("presenceiq:ready", handler);
    return () => window.removeEventListener("presenceiq:ready", handler);
  }, [onReady]);

  useEffect(() => {
    const existing = document.querySelector(`script[data-piq-embed="${embedKey}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.piqEmbed = embedKey;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [embedKey, src]);

  return null;
}

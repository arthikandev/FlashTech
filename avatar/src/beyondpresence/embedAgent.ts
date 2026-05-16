export type EmbedAgentOptions = {
  container: HTMLElement;
  bpAgentId?: string | null;
  /** Beyond Presence embed URL pattern — adjust per BP docs */
  embedBaseUrl?: string;
};

/**
 * Mount avatar container (deferred until pipeline returns).
 * Replace embed URL with your Beyond Presence managed agent iframe src.
 */
export function embedAgent(options: EmbedAgentOptions): () => void {
  const { container, bpAgentId } = options;
  container.innerHTML = "";
  container.setAttribute("data-piq-avatar", "mounted");

  if (!bpAgentId) {
    container.innerHTML =
      '<p style="color:#94a3b8;font-family:system-ui;padding:1rem">Configure BEYONDPRESENCE_API_KEY and seed bpAgentId for live avatar.</p>';
    return () => {
      container.innerHTML = "";
    };
  }

  const iframe = document.createElement("iframe");
  iframe.title = "PresenceIQ Avatar";
  iframe.allow = "microphone; camera; autoplay";
  iframe.style.cssText =
    "width:100%;max-width:420px;height:520px;border:0;border-radius:12px;background:#0f172a";
  iframe.src =
    options.embedBaseUrl ??
    `https://app.bey.chat/embed/${encodeURIComponent(bpAgentId)}`;

  container.appendChild(iframe);

  return () => {
    container.innerHTML = "";
  };
}

export function hideAgentContainer(container: HTMLElement): void {
  container.style.visibility = "hidden";
  container.style.minHeight = "520px";
}

export function showAgentContainer(container: HTMLElement): void {
  container.style.visibility = "visible";
}

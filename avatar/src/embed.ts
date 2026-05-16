const BEY_CHAT_BASE = "https://bey.chat";

export function showLoading(container: HTMLElement): void {
  container.innerHTML = "";
  container.setAttribute("aria-busy", "true");
  container.style.minHeight = container.style.minHeight || "420px";

  const skeleton = document.createElement("div");
  skeleton.className = "presenceiq-avatar-loading";
  skeleton.setAttribute("role", "status");
  skeleton.textContent = "Preparing your assistant…";
  Object.assign(skeleton.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "inherit",
    padding: "2rem",
    color: "#555",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.95rem",
    background: "linear-gradient(135deg, #f4f6f8 0%, #e8ecf0 100%)",
    borderRadius: "12px",
  });

  container.appendChild(skeleton);
}

export function showError(container: HTMLElement, message: string): void {
  container.removeAttribute("aria-busy");
  container.innerHTML = "";

  const el = document.createElement("div");
  el.className = "presenceiq-avatar-error";
  el.setAttribute("role", "alert");
  el.textContent = message;
  Object.assign(el.style, {
    padding: "1.5rem",
    color: "#8b1a1a",
    background: "#fdeaea",
    borderRadius: "12px",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.9rem",
  });

  container.appendChild(el);
}

export function mountBeyondPresenceIframe(
  container: HTMLElement,
  bpAgentId: string
): HTMLIFrameElement {
  container.innerHTML = "";
  container.removeAttribute("aria-busy");

  const iframe = document.createElement("iframe");
  iframe.src = `${BEY_CHAT_BASE}/${encodeURIComponent(bpAgentId)}`;
  iframe.title = "PresenceIQ assistant";
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute(
    "allow",
    "camera; microphone; fullscreen; autoplay; clipboard-write"
  );
  Object.assign(iframe.style, {
    width: "100%",
    height: "600px",
    maxHeight: "80vh",
    border: "none",
    borderRadius: "12px",
    display: "block",
  });

  container.appendChild(iframe);
  return iframe;
}

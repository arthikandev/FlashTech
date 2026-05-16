import { initPresenceIQAvatar } from "@presenceiq/avatar";

const backendUrl = (
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export function bootDemoSite(embedKey: string): void {
  const script = document.createElement("script");
  script.src = `${backendUrl}/api/embed/${embedKey}`;
  script.async = true;
  document.head.appendChild(script);

  const container = document.getElementById("avatar-slot");
  if (!container) {
    console.warn("[PresenceIQ] Missing #avatar-slot");
    return;
  }

  const spinner = document.getElementById("avatar-spinner");

  initPresenceIQAvatar({
    backendUrl,
    avatarContainer: container,
    waitForCrmMs: 500,
  });

  window.addEventListener("presenceiq:pipeline-start", () => {
    spinner?.classList.remove("hidden");
  });

  window.addEventListener("presenceiq:pipeline-complete", () => {
    spinner?.classList.add("hidden");
  });
}

export function setupHashRouter(): void {
  function render() {
    const hash = window.location.hash.replace(/^#/, "") || "/";
    document.querySelectorAll("[data-route]").forEach((el) => {
      const route = el.getAttribute("data-route");
      el.classList.toggle("hidden", route !== hash);
    });
  }
  window.addEventListener("hashchange", render);
  render();
}

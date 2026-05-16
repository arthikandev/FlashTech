const backendUrl = (
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

type InitOptions = {
  backendUrl?: string;
  avatarContainer?: HTMLElement;
  container?: HTMLElement;
  webhookSecret?: string;
  waitForCrmMs?: number;
};

declare global {
  interface Window {
    PresenceIQAvatar?: {
      initPresenceIQAvatar: (options: InitOptions) => void;
    };
  }
}

function loadAvatarSdk(): Promise<void> {
  if (window.PresenceIQAvatar?.initPresenceIQAvatar) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-presenceiq-avatar-sdk="1"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Avatar SDK failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "/presenceiq-avatar.js";
    script.async = true;
    script.dataset.presenceiqAvatarSdk = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Avatar SDK failed to load"));
    document.head.appendChild(script);
  });
}

export async function bootDemoSite(embedKey: string): Promise<void> {
  const embed = document.createElement("script");
  embed.src = `${backendUrl}/api/embed/${embedKey}`;
  embed.async = true;
  document.head.appendChild(embed);

  const container = document.getElementById("avatar-slot");
  if (!container) {
    console.warn("[PresenceIQ] Missing #avatar-slot");
    return;
  }

  const spinner = document.getElementById("avatar-spinner");

  window.addEventListener("presenceiq:pipeline-start", () => {
    spinner?.classList.remove("hidden");
  });

  window.addEventListener("presenceiq:pipeline-complete", () => {
    spinner?.classList.add("hidden");
  });

  try {
    await loadAvatarSdk();
    window.PresenceIQAvatar?.initPresenceIQAvatar({
      backendUrl,
      avatarContainer: container,
      waitForCrmMs: 200,
    });
  } catch (err) {
    console.error("[PresenceIQ] Avatar SDK:", err);
  }
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

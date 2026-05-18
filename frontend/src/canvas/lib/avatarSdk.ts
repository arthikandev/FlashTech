import { resolveBackendBaseUrl } from "@/lib/backendUrl";

const CONTAINER_ID = "presenceiq-avatar-canvas";

let loadPromise: Promise<void> | null = null;
let initPromise: Promise<void> | null = null;

/** Call when backend base URL is invalidated (e.g. integration Retry) so init runs again with the new URL. */
export function invalidateCanvasAvatarInit(): void {
  initPromise = null;
}

export function loadAvatarSdk(): Promise<void> {
  if (window.PresenceIQAvatar?.init) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-presenceiq-avatar-sdk="1"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Avatar SDK failed to load")), {
        once: true,
      });
      if (window.PresenceIQAvatar?.init) resolve();
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

  // Drop the cached rejection so the next caller gets a fresh attempt.
  loadPromise.catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}

function waitForContainer(timeoutMs = 8000): Promise<HTMLElement> {
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const el = document.getElementById(CONTAINER_ID);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      observer.disconnect();
      reject(new Error("Avatar container not found — reload the page and try again"));
    }, timeoutMs);
  });
}

/** Load SDK and init against the canvas mount (must exist in DOM). */
export async function ensureCanvasAvatarInitialized(bpAgentId?: string): Promise<void> {
  const trimmedAgent = bpAgentId?.trim();
  if (trimmedAgent) {
    window.__PRESENCEIQ_CONFIG__ = {
      ...window.__PRESENCEIQ_CONFIG__,
      bpAgentId: trimmedAgent,
    };
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await loadAvatarSdk();
      const container = await waitForContainer();

      const backendUrl = await resolveBackendBaseUrl();
      window.PresenceIQAvatar?.init({
        backendUrl,
        container,
        waitForCrmMs: 200,
      });
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/** Preload SDK early so bootstrap attaches before the first send. */
export function preloadCanvasAvatarSdk(): void {
  void loadAvatarSdk().catch(() => {
    /* surfaced when user sends */
  });
}

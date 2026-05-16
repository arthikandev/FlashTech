import { useEffect, useState } from "react";

const backendUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001").replace(
  /\/$/,
  ""
);

declare global {
  interface Window {
    PresenceIQAvatar?: {
      init: (opts: {
        backendUrl?: string;
        container?: HTMLElement;
        avatarContainer?: HTMLElement;
        waitForCrmMs?: number;
      }) => void;
      initPresenceIQAvatar: (opts: {
        backendUrl?: string;
        container?: HTMLElement;
        avatarContainer?: HTMLElement;
        waitForCrmMs?: number;
      }) => void;
    };
  }
}

function loadAvatarSdk(): Promise<void> {
  if (window.PresenceIQAvatar?.init) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/presenceiq-avatar.js";
    script.async = true;
    script.dataset.presenceiqAvatarSdk = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Avatar SDK failed to load"));
    document.head.appendChild(script);
  });
}

type Props = {
  embedKey: string;
};

export function AvatarBoot({ embedKey }: Props) {
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const spinner = document.getElementById("avatar-spinner");
    const showLoading = () => {
      spinner?.classList.remove("hidden");
      setFallbackMessage(null);
    };
    const onFingerprint = () => showLoading();
    const onStart = () => showLoading();
    const onComplete = () => spinner?.classList.add("hidden");
    const onFallback = (e: Event) => {
      const reason = (e as CustomEvent).detail?.reason ?? "Avatar unavailable";
      setFallbackMessage(String(reason));
      spinner?.classList.add("hidden");
    };

    window.addEventListener("presenceiq:fingerprint-complete", onFingerprint);
    window.addEventListener("presenceiq:pipeline-start", onStart);
    window.addEventListener("presenceiq:pipeline-complete", onComplete);
    window.addEventListener("presenceiq:avatar-fallback", onFallback);

    let cancelled = false;
    void loadAvatarSdk().then(() => {
      if (cancelled) return;
      const container = document.getElementById("presenceiq-avatar");
      if (container && window.PresenceIQAvatar) {
        window.PresenceIQAvatar.init({
          backendUrl,
          container,
          waitForCrmMs: 200,
        });
      }
    });

    return () => {
      cancelled = true;
      window.removeEventListener("presenceiq:fingerprint-complete", onFingerprint);
      window.removeEventListener("presenceiq:pipeline-start", onStart);
      window.removeEventListener("presenceiq:pipeline-complete", onComplete);
      window.removeEventListener("presenceiq:avatar-fallback", onFallback);
    };
  }, [embedKey]);

  return (
    <div className="mt-8 rounded-xl border border-[#212121] bg-[#101010] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
        Live avatar · reload to see personalised opener
      </p>
      <div id="avatar-spinner" className="hidden text-sm text-primary mb-2">
        Preparing your advisor…
      </div>
      {fallbackMessage ? (
        <div
          className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"
          role="alert"
        >
          <p className="font-medium">Avatar connection issue</p>
          <p className="mt-1 text-amber-200/80">{fallbackMessage}</p>
          <button
            type="button"
            className="mt-2 text-xs underline text-amber-100"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : null}
      <div
        id="presenceiq-avatar"
        className="min-h-[280px] rounded-lg border border-dashed border-[#212121] bg-black/50"
        aria-live="polite"
      />
    </div>
  );
}

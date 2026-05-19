import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { BEYOND_PRESENCE_VIDEO_SRC } from "@/lib/previewVideo";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const BULLET_KEYS = [
  "beyond.bullet0",
  "beyond.bullet1",
  "beyond.bullet2",
  "beyond.bullet3",
] as const;

export function BeyondPresenceLiveSection() {
  const { t } = useLandingLocale();

  return (
    <section
      id="beyond-presence"
      className="relative border-t border-[#212121] bg-black px-4 py-20 md:py-28"
    >
      <div className="bg-noise absolute inset-0 opacity-[0.12] pointer-events-none" aria-hidden />
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <p className="text-primary text-xs uppercase tracking-widest mb-3">
            {t("beyond.eyebrow")}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#E1E0CC] leading-tight">
            {t("beyond.title")}
          </h2>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-lg">
            {t("beyond.desc")}
          </p>
          <ul className="mt-8 space-y-3">
            {BULLET_KEYS.map((key) => (
              <li key={key} className="flex gap-3 text-sm text-gray-400">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="shimmer-btn inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
            >
              {t("beyond.ctaDemo")}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full border border-[#212121] px-5 py-2.5 text-sm text-[#E1E0CC] hover:border-primary/40 transition-colors"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/10 blur-xl pointer-events-none" />
          <div className="relative rounded-2xl border border-[#212121] bg-[#0a0a0a] p-3 sm:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                {t("beyond.liveAgent")}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-primary">
                Beyond Presence
              </span>
            </div>
            <BeyondPresenceFrame
              agentId=""
              height={560}
              className="rounded-lg"
              videoSrc={BEYOND_PRESENCE_VIDEO_SRC}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

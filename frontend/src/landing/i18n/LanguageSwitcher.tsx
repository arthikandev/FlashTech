import { cn } from "@/lib/utils";
import { useLandingLocale } from "./LandingLocaleProvider";
import type { LandingLocale } from "./types";

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className }: Props) {
  const { locale, setLocale, t } = useLandingLocale();

  const options: { id: LandingLocale; labelKey: "lang.en" | "lang.ta" }[] = [
    { id: "en", labelKey: "lang.en" },
    { id: "ta", labelKey: "lang.ta" },
  ];

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "flex rounded-full border border-white/14 bg-black/45 p-1 backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      {options.map(({ id, labelKey }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLocale(id)}
            className={cn(
              "flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-white/12 text-[#fdfcf8]"
                : "text-[#E1E0CC]/65 hover:text-[#E1E0CC]"
            )}
            aria-pressed={active}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}

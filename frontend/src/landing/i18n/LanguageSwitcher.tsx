import { cn } from "@/lib/utils";
import { NAV_LINK_CLASS } from "../nav";
import { useLandingLocale } from "./LandingLocaleProvider";
import type { LandingLocale } from "./types";

const segmentClass = cn("flex-1 rounded-full px-3 py-2", NAV_LINK_CLASS);

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
        "flex rounded-full border border-[#212121] bg-black/40 p-1",
        className,
      )}
    >
      {options.map(({ id, labelKey }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLocale(id)}
            className={cn(segmentClass, active && "bg-white/10")}
            aria-pressed={active}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}

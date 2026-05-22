import { INDUSTRY_USE_CASES } from "@/components/industries/industryUseCases";
import { cn } from "@/lib/utils";
import { t } from "../i18n/canvas.en";

const WELCOME_CHIPS = INDUSTRY_USE_CASES;

type Props = {
  onPickPrompt: (prompt: string) => void;
  activePrompt?: string;
};

export function CanvasWelcome({ onPickPrompt, activePrompt }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-xl text-center">
        <h1 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          {t("welcome.title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("welcome.subtitle")}
        </p>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("welcome.chipsLabel")}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {WELCOME_CHIPS.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => onPickPrompt(ind.samplePrompt)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-left text-xs transition-colors sm:text-sm",
                activePrompt === ind.samplePrompt
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <span className="font-medium text-foreground">{ind.name}</span>
              <span className="hidden text-muted-foreground sm:inline"> — </span>
              <span className="block text-muted-foreground line-clamp-1 sm:inline sm:line-clamp-none">
                {ind.samplePrompt.slice(0, 48)}
                {ind.samplePrompt.length > 48 ? "…" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

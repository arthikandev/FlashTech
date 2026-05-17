import { motion } from "framer-motion";
import { IndustryUseCaseCard } from "@/components/industries/IndustryUseCaseCard";
import { INDUSTRY_USE_CASES } from "@/components/industries/industryUseCases";
import { t } from "../i18n/canvas.en";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  onPickPrompt: (prompt: string) => void;
};

export function CanvasUseCasesPanel({ onPickPrompt }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-4 pt-2">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {t("welcome.chipsLabel")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {INDUSTRY_USE_CASES.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease }}
            >
              <IndustryUseCaseCard
                name={ind.name}
                badge={ind.badge}
                stat={ind.stat}
                description={ind.description}
                icon={Icon}
                demoTo={ind.demoTo}
                compact
                onSelectPrompt={() => onPickPrompt(ind.samplePrompt)}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IndustryUseCaseCard } from "@/components/industries/IndustryUseCaseCard";
import { INDUSTRY_USE_CASES } from "@/components/industries/industryUseCases";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const ease = [0.16, 1, 0.3, 1] as const;

export function IndustriesSection() {
  const { t } = useLandingLocale();

  return (
    <section id="industries" className="section-pad bg-background px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t("industries.eyebrow")}
          title={t("industries.title")}
          subtitle={t("industries.subtitle")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_USE_CASES.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease }}
              >
                <IndustryUseCaseCard
                  name={ind.name}
                  badge={ind.badge}
                  stat={ind.stat}
                  description={ind.description}
                  icon={Icon}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

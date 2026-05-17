import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { setSelectedIndustry } from "@/onboarding/storage";
import type { Industry } from "@/onboarding/types";

const ease = [0.16, 1, 0.3, 1] as const;

export function CategorySelectPage() {
  const navigate = useNavigate();

  const selectCategory = (industry: Industry) => {
    setSelectedIndustry(industry);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="brand-theme min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:py-14">
        <Link
          to="/"
          className="group mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            PresenceIQ
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            Choose your industry
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Your dashboard, KPIs, and avatar defaults are tailored to your category. You can onboard
            multiple businesses in the same industry later.
          </p>
        </motion.div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <motion.li
              key={cat.code}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.05 * i }}
            >
              <button
                type="button"
                onClick={() => selectCategory(cat.industry)}
                className="group flex h-full w-full flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <cat.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  {cat.tag}
                </span>
                <span className="mt-1 text-lg font-semibold text-foreground">{cat.name}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </span>
                <span className="mt-4 text-xs text-muted-foreground">
                  Core metric: <span className="text-foreground">{cat.coreMetric}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

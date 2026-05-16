"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";

type PlanFeature = { text: string; included: boolean };

type Plan = {
  id: string;
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  features: PlanFeature[];
  cta: string;
  ctaTo: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 0,
    annual: 0,
    description: "For teams validating pre-conversation intelligence.",
    features: [
      { text: "500 visitors / month", included: true },
      { text: "1 business workspace", included: true },
      { text: "Intent scoring + personalised opener", included: true },
      { text: "Embed script + dashboard (demo mode)", included: true },
      { text: "Beyond Presence agent sync", included: false },
      { text: "Slack hot-lead alerts", included: false },
    ],
    cta: "Start free",
    ctaTo: "/onboard",
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 99,
    annual: 79,
    description: "For revenue teams running live avatar on production sites.",
    features: [
      { text: "25,000 visitors / month", included: true },
      { text: "3 business workspaces", included: true },
      { text: "Beyond Presence agent sync", included: true },
      { text: "Slack hot-lead alerts + CRM push (n8n)", included: true },
      { text: "Real-time Convex dashboard", included: true },
      { text: "White-label avatar", included: false },
    ],
    cta: "Start free trial",
    ctaTo: "/onboard",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    annual: null,
    description: "Custom deployments, compliance, and dedicated support.",
    features: [
      { text: "Unlimited visitors", included: true },
      { text: "White-label avatar + custom LLM", included: true },
      { text: "SSO + audit logs", included: true },
      { text: "SLA & dedicated success engineer", included: true },
      { text: "Multi-region + private Convex", included: true },
      { text: "Self-serve onboarding only", included: false },
    ],
    cta: "Talk to sales",
    ctaTo: "mailto:hello@presenceiq.ai",
  },
];

const revealVariants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
  hidden: {
    filter: "blur(8px)",
    y: -16,
    opacity: 0,
  },
};

function PricingSwitch({ onSwitch }: { onSwitch: (annual: boolean) => void }) {
  const [selected, setSelected] = useState<"monthly" | "annual">("monthly");

  const handleSwitch = (value: "monthly" | "annual") => {
    setSelected(value);
    onSwitch(value === "annual");
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border border-[#212121] bg-[#101010] p-1">
        <button
          type="button"
          onClick={() => handleSwitch("monthly")}
          className={cn(
            "relative z-10 h-10 w-fit rounded-full px-5 py-2 text-sm font-medium transition-colors",
            selected === "monthly" ? "text-black" : "text-gray-400",
          )}
        >
          {selected === "monthly" && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute inset-0 rounded-full border border-primary/40 bg-primary shadow-sm shadow-primary/20"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>
        <button
          type="button"
          onClick={() => handleSwitch("annual")}
          className={cn(
            "relative z-10 flex h-10 w-fit shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
            selected === "annual" ? "text-black" : "text-gray-400",
          )}
        >
          {selected === "annual" && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute inset-0 rounded-full border border-primary/40 bg-primary shadow-sm shadow-primary/20"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Annual</span>
          <span
            className={cn(
              "relative rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              selected === "annual"
                ? "bg-black/15 text-black"
                : "bg-primary/15 text-primary",
            )}
          >
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}

function PlanPrice({
  plan,
  annual,
}: {
  plan: Plan;
  annual: boolean;
}) {
  if (plan.monthly == null) {
    return <span className="font-serif text-4xl text-primary">Custom</span>;
  }
  if (plan.monthly === 0) {
    return <span className="font-serif text-4xl text-primary">Free</span>;
  }

  const value = annual ? plan.annual! : plan.monthly;

  return (
    <div className="flex items-baseline gap-0.5">
      <span className="font-serif text-4xl text-primary">$</span>
      <NumberFlow
        value={value}
        format={{ style: "decimal", maximumFractionDigits: 0 }}
        className="font-serif text-4xl text-primary tabular-nums"
      />
      <span className="ml-1 text-sm text-gray-500">
        {annual ? "/mo billed yearly" : "/month"}
      </span>
    </div>
  );
}

function PlanCta({ plan }: { plan: Plan }) {
  const className = cn(
    "mt-6 block w-full rounded-full py-2.5 text-center text-sm font-medium transition-colors",
    plan.popular
      ? "bg-primary text-black hover:opacity-90"
      : "border border-[#212121] text-[#E1E0CC] hover:border-primary/40",
  );

  if (plan.ctaTo.startsWith("mailto:")) {
    return (
      <a href={plan.ctaTo} className={className}>
        {plan.cta}
      </a>
    );
  }

  return (
    <Link to={plan.ctaTo} className={className}>
      {plan.cta}
    </Link>
  );
}

export function PricingSection4() {
  const [annual, setAnnual] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={pricingRef}
      className="relative mx-auto overflow-x-hidden bg-black"
    >
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="pointer-events-none absolute top-0 h-80 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:70px_80px]" />
        <Sparkles
          density={1200}
          direction="bottom"
          speed={0.8}
          color="#dedbc8"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>

      <div
        className="pointer-events-none absolute inset-x-[10%] top-0 z-0 h-full opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle at center, color-mix(in oklch, var(--color-primary) 35%, transparent) 0%, transparent 70%)",
        }}
      />

      <article className="relative z-10 mx-auto mb-8 max-w-3xl space-y-4 px-4 pt-4 text-center md:mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/90">
          Pricing
        </p>
        <h2 className="font-serif text-3xl text-[#E1E0CC] sm:text-4xl md:text-5xl">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.08}
            staggerFrom="first"
            reverse
            containerClassName="justify-center"
            transition={{ type: "spring", stiffness: 250, damping: 40 }}
          >
            Scale from pilot to enterprise
          </VerticalCutReveal>
        </h2>
        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-sm text-gray-500 sm:text-base"
        >
          Pre-conversation intelligence that pays for itself on the first hot lead.
        </TimelineContent>
        <TimelineContent
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={setAnnual} />
        </TimelineContent>
      </article>

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-4 pb-8 md:grid-cols-3">
        {PLANS.map((plan, index) => (
          <TimelineContent
            key={plan.id}
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative flex h-full flex-col overflow-hidden border-[#212121] text-[#E1E0CC]",
                plan.popular
                  ? "z-20 border-primary/35 bg-gradient-to-b from-[#141414] via-[#101010] to-[#0a0a0a] shadow-[0_-8px_80px_-20px] shadow-primary/25"
                  : "z-10 bg-gradient-to-b from-[#121212] via-[#101010] to-[#0a0a0a]",
              )}
            >
              {plan.popular && (
                <div className="bg-primary px-4 py-2 text-center text-[10px] font-medium uppercase tracking-widest text-black">
                  Most popular
                </div>
              )}
              <CardHeader className="text-left">
                <h3 className="text-lg font-medium text-[#E1E0CC]">{plan.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{plan.description}</p>
                <div className="mt-4">
                  <PlanPrice plan={plan} annual={annual} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                <PlanCta plan={plan} />
                <ul className="mt-6 flex-1 space-y-3 border-t border-[#212121] pt-5">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={cn(
                        "flex gap-2 text-sm",
                        f.included ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      {f.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
                      )}
                      <span className={f.included ? "" : "line-through opacity-60"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>

    </motion.div>
  );
}

export default PricingSection4;

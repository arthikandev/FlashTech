import { useState } from "react";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PlanFeature = { text: string; included: boolean };

const PLANS = [
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
    ] satisfies PlanFeature[],
    cta: "Start free",
    ctaTo: "/onboard",
    featured: false,
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
    ] satisfies PlanFeature[],
    cta: "Start free trial",
    ctaTo: "/onboard",
    featured: true,
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
    ] satisfies PlanFeature[],
    cta: "Talk to sales",
    ctaTo: "mailto:hello@presenceiq.ai",
    featured: false,
  },
] as const;

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="section-pad bg-black px-4 border-t border-[#212121]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Pricing"
          title="Scale from pilot to enterprise"
          subtitle="Pre-conversation intelligence that pays for itself on the first hot lead."
        />

        <div className="sticky top-0 z-10 -mx-4 px-4 py-4 md:static md:mx-0 md:px-0 md:py-0 bg-black/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-b border-[#212121] md:border-0 mb-8 md:mb-10 flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? "text-[#E1E0CC]" : "text-gray-500"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className="relative h-7 w-12 rounded-full bg-[#212121] border border-[#333] transition-colors"
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-primary transition-transform ${
                annual ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? "text-[#E1E0CC]" : "text-gray-500"}`}>
            Annual
            <span className="ml-1.5 text-primary text-xs">Save 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-24 md:pb-0">
          {PLANS.map((plan) => {
            const price =
              plan.monthly == null
                ? "Custom"
                : plan.monthly === 0
                  ? "Free"
                  : `$${annual ? plan.annual : plan.monthly}`;
            const period =
              plan.monthly == null || plan.monthly === 0
                ? ""
                : annual
                  ? "/mo billed yearly"
                  : "/month";

            return (
              <article
                key={plan.id}
                className={`relative rounded-2xl flex flex-col overflow-hidden ${
                  plan.featured
                    ? "border border-primary/30 bg-[#101010] shadow-lg shadow-primary/5"
                    : "border border-[#212121] bg-[#101010]"
                }`}
              >
                {plan.featured && (
                  <div className="bg-primary px-4 py-2 text-center text-[10px] font-medium uppercase tracking-widest text-black">
                    Most popular
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-medium text-[#E1E0CC]">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">{plan.description}</p>
                  <p className="font-serif text-3xl text-primary">
                    {price}
                    {period && (
                      <span className="text-sm font-sans text-gray-500">{period}</span>
                    )}
                  </p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f.text}
                        className={`flex gap-2 text-sm ${
                          f.included ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {f.included ? (
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? "" : "line-through opacity-60"}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {plan.ctaTo.startsWith("mailto:") ? (
                    <a
                      href={plan.ctaTo}
                      className={`mt-6 block text-center rounded-full py-2.5 text-sm font-medium transition-colors ${
                        plan.featured
                          ? "bg-primary text-black hover:opacity-90"
                          : "border border-[#212121] text-[#E1E0CC] hover:border-primary/40"
                      }`}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      to={plan.ctaTo}
                      className={`mt-6 block text-center rounded-full py-2.5 text-sm font-medium transition-colors ${
                        plan.featured
                          ? "bg-primary text-black hover:opacity-90"
                          : "border border-[#212121] text-[#E1E0CC] hover:border-primary/40"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-[#212121] bg-[#101010]/95 backdrop-blur-xl p-3">
          <Link
            to="/onboard"
            className="block w-full text-center rounded-full bg-primary py-3 text-sm font-medium text-black"
          >
            Get started free
          </Link>
        </div>
      </div>
    </section>
  );
}

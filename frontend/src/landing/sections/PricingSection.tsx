import { PricingCards, type PricingPlan } from "@/components/ui/pricing-cards";

const plans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    description: "Embed SDK and one demo tenant for evaluation.",
    features: [
      "PresenceIQ embed script",
      "1 demo site (Seylan, CloudMetrics, or Coral)",
      "Basic visitor fingerprinting",
      "Community support",
    ],
    cta: "Get started",
    ctaTo: "/dashboard",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    annualPrice: "$990",
    description: "Live Convex dashboard and all three vertical demos.",
    features: [
      "All Starter features",
      "Live dashboard + session detail",
      "All three demo tenants",
      "Intent scores & recommended actions",
      "n8n / Slack webhook hooks",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    ctaTo: "/dashboard",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Multi-team rollout with custom integrations and SLAs.",
    features: [
      "All Pro features",
      "Dedicated BeyondPresence pipeline",
      "Custom branding & white-label embed",
      "SSO and audit logs",
      "Dedicated success manager",
      "Bulk tenant provisioning",
    ],
    cta: "Contact sales",
    ctaTo: "/dashboard",
  },
];

export function PricingSection() {
  return (
    <PricingCards
      heading="Plans & Pricing"
      description="Scale from a single embed to enterprise pilots — pay yearly and save on Pro."
      plans={plans}
    />
  );
}

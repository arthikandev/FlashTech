import { DemoLayout } from "./DemoLayout";

const plans = [
  {
    name: "Gold",
    price: "LKR 2,500/mo",
    perks: ["Priority support", "2% cashback on bills"],
  },
  {
    name: "Platinum",
    price: "LKR 5,900/mo",
    perks: ["Dedicated RM", "4% cashback", "Airport lounge"],
    highlight: true,
  },
];

export function SeylanPage() {
  return (
    <DemoLayout
      industryLabel="Banking demo"
      title="Seylan Bank"
      subtitle="Personal banking — compare Gold and Platinum plans. PresenceIQ embed loads on this page."
      embedKey="seylan-demo"
    >
      <section id="pricing" className="scroll-mt-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-xl border p-6 transition-colors ${
                plan.highlight
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-background/40"
              }`}
            >
              <h3 className="text-xl font-medium text-foreground">{plan.name}</h3>
              <p className="text-primary mt-1">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                {plan.perks.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-6 w-full py-2.5 rounded-full bg-primary text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Apply now
              </button>
            </article>
          ))}
        </div>
      </section>
    </DemoLayout>
  );
}

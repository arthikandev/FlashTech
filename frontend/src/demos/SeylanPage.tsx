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
      title="Seylan Bank"
      subtitle="Personal banking — compare Gold and Platinum plans"
      embedKey="seylan-demo"
    >
      <section id="pricing" className="scroll-mt-8">
        <h2 className="text-lg font-medium text-white mb-4">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.highlight
                  ? "border-emerald-500/50 bg-emerald-950/20"
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <p className="text-emerald-400 mt-1">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {plan.perks.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-6 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
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

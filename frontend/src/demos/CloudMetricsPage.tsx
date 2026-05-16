import { DemoLayout } from "./DemoLayout";

export function CloudMetricsPage() {
  return (
    <DemoLayout
      industryLabel="SaaS demo"
      title="CloudMetrics"
      subtitle="Analytics platform — 14-day trial with full API access. Ideal for B2B intent scoring demos."
      embedKey="cloudmetrics-demo"
    >
      <section id="pricing" className="scroll-mt-8 max-w-lg">
        <h2 className="text-lg font-medium text-foreground mb-4">Plans</h2>
        <article className="rounded-xl border border-violet-500/30 bg-violet-950/10 p-6">
          <h3 className="text-xl font-medium text-foreground">Pro</h3>
          <p className="text-primary mt-1">$49/mo per seat</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>• Unlimited dashboards</li>
            <li>• Full API access</li>
            <li>• 14-day free trial</li>
          </ul>
          <button
            type="button"
                className="mt-6 w-full py-2.5 rounded-full bg-primary text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start trial
          </button>
        </article>
      </section>
    </DemoLayout>
  );
}

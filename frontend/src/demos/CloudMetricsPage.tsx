import { DemoLayout } from "./DemoLayout";

export function CloudMetricsPage() {
  return (
    <DemoLayout
      title="CloudMetrics"
      subtitle="SaaS analytics — 14-day trial with full API access"
      embedKey="cloudmetrics-demo"
    >
      <section id="pricing" className="scroll-mt-8 max-w-lg">
        <h2 className="text-lg font-medium text-white mb-4">Plans</h2>
        <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-xl font-semibold text-white">Pro</h3>
          <p className="text-emerald-400 mt-1">$49/mo per seat</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• Unlimited dashboards</li>
            <li>• Full API access</li>
            <li>• 14-day free trial</li>
          </ul>
          <button
            type="button"
            className="mt-6 w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Start trial
          </button>
        </article>
      </section>
    </DemoLayout>
  );
}

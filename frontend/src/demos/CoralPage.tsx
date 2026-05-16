import { DemoLayout } from "./DemoLayout";

export function CoralPage() {
  return (
    <DemoLayout
      title="Coral Resort"
      subtitle="Oceanfront stays — suite packages with breakfast & spa"
      embedKey="coral-demo"
    >
      <section id="pricing" className="scroll-mt-8 max-w-lg">
        <h2 className="text-lg font-medium text-white mb-4">Suites</h2>
        <article className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6">
          <h3 className="text-xl font-semibold text-white">Ocean Suite</h3>
          <p className="text-amber-300 mt-1">From $320/night</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• Daily breakfast included</li>
            <li>• Spa credit $50/night</li>
            <li>• Ocean view balcony</li>
          </ul>
          <button
            type="button"
            className="mt-6 w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
          >
            Book suite
          </button>
        </article>
      </section>
    </DemoLayout>
  );
}

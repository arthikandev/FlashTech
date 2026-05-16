import { DemoLayout } from "./DemoLayout";

export function CoralPage() {
  return (
    <DemoLayout
      industryLabel="Hospitality demo"
      title="Coral Resort"
      subtitle="Oceanfront stays — suite packages with breakfast and spa credit."
      embedKey="coral-demo"
    >
      <section id="pricing" className="scroll-mt-8 max-w-lg">
        <h2 className="text-lg font-medium text-foreground mb-4">Suites</h2>
        <article className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-6">
          <h3 className="text-xl font-medium text-foreground">Ocean Suite</h3>
          <p className="text-amber-200/90 mt-1">From $320/night</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>• Daily breakfast included</li>
            <li>• Spa credit $50/night</li>
            <li>• Ocean view balcony</li>
          </ul>
          <button
            type="button"
                className="mt-6 w-full py-2.5 rounded-full bg-primary text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Book suite
          </button>
        </article>
      </section>
    </DemoLayout>
  );
}

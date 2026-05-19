import { CategoryDashboardCore } from "../CategoryDashboardWidgets";
import { CategoryTopIntents } from "../CategoryTopIntents";
import { TrialCohort } from "../widgets/TrialCohort";

export function SaasDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <div className="grid gap-4 lg:grid-cols-2">
        <TrialCohort />
        <CategoryTopIntents
          code="SAAS_SOFTWARE"
          title="Top feature & pricing intents"
        />
      </div>
    </div>
  );
}

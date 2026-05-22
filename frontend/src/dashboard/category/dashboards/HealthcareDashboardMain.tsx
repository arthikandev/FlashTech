import { CategoryDashboardCore } from "../CategoryDashboardWidgets";
import { CategoryTopIntents } from "../CategoryTopIntents";
import { MultilingualIntakeMatrix } from "../widgets/MultilingualIntakeMatrix";

export function HealthcareDashboardMain() {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
        Sensitive-content flags are surfaced inline. Connect a FHIR webhook to
        forward pre-briefs to your care team.
      </div>
      <CategoryDashboardCore />
      <MultilingualIntakeMatrix />
      <CategoryTopIntents code="HEALTHCARE" title="Top intake intents" />
    </div>
  );
}

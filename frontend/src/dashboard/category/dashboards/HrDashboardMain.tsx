import { CategoryDashboardCore } from "../CategoryDashboardWidgets";
import { CategoryTopIntents } from "../CategoryTopIntents";
import { CandidatePipelineKanban } from "../widgets/CandidatePipelineKanban";

export function HrDashboardMain() {
  return (
    <div className="space-y-6">
      <CategoryDashboardCore />
      <CandidatePipelineKanban />
      <CategoryTopIntents code="HR_RECRUITMENT" title="Top candidate intents" />
    </div>
  );
}

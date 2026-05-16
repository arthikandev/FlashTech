import { useDashboardContext } from "../context/DashboardContext";
import { WorkflowActivity } from "../sections/WorkflowActivity";

export function WorkflowPage() {
  const { detail, triggers, triggersLoading, businessId } = useDashboardContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-dash-ink">Workflow</h1>
        <p className="text-xs text-dash-muted">n8n automation triggers and pipeline status</p>
      </div>
      <WorkflowActivity
        hasIntelligence={!!detail?.intelligence}
        hasConversation={!!detail?.conversation}
        triggers={triggers}
        triggersLoading={triggersLoading && Boolean(businessId)}
      />
    </div>
  );
}

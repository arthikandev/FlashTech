import { Link } from "react-router-dom";
import { useDashboardContext } from "../context/DashboardContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { WorkflowActivity } from "../sections/WorkflowActivity";
import { WorkflowTriggers } from "../sections/WorkflowTriggers";

export function WorkflowPage() {
  const {
    detail,
    triggers,
    triggersLoading,
    businessId,
    business,
    signedIn,
    hasMembershipForEmbed,
    embedKey,
  } = useDashboardContext();

  const canEdit = signedIn && hasMembershipForEmbed;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Workflow"
        subtitle="Webhook automation triggers and pipeline status"
        actions={
          <Link to={`/canvas/settings?embedKey=${encodeURIComponent(embedKey)}`} className="text-xs text-primary hover:underline">
            Configure webhooks →
          </Link>
        }
      />

      <WorkflowActivity
        hasIntelligence={!!detail?.intelligence}
        hasConversation={!!detail?.conversation}
        hasCrmData={Boolean(detail?.visitor.crmData)}
        hasBpAgent={Boolean(business?.avatarConfig?.bpAgentId?.trim())}
        triggers={triggers}
        triggersLoading={triggersLoading && Boolean(businessId)}
      />

      <WorkflowTriggers
        businessId={businessId}
        triggers={triggers}
        loading={triggersLoading}
        canEdit={canEdit}
      />
    </div>
  );
}

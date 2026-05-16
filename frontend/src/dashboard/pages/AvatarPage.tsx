import { useDashboardContext } from "../context/DashboardContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { AvatarPerformance } from "../sections/AvatarPerformance";

export function AvatarPage() {
  const { sessions, business } = useDashboardContext();

  const agentHint = business?.avatarConfig?.bpAgentId
    ? ` · Agent ${business.avatarConfig.bpAgentId.slice(0, 8)}…`
    : "";

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Avatar"
        subtitle={`Beyond Presence telemetry${agentHint}`}
      />
      <AvatarPerformance sessions={sessions} />
    </div>
  );
}

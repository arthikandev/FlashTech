import { useDashboardContext } from "../context/DashboardContext";
import { AvatarPerformance } from "../sections/AvatarPerformance";

export function AvatarPage() {
  const { sessions, business } = useDashboardContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-dash-ink">Avatar</h1>
        <p className="text-xs text-dash-muted">
          Beyond Presence telemetry
          {business?.avatarConfig?.bpAgentId
            ? ` · Agent ${business.avatarConfig.bpAgentId.slice(0, 8)}…`
            : ""}
        </p>
      </div>
      <AvatarPerformance sessions={sessions} />
    </div>
  );
}

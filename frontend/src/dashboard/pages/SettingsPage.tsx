import { useDashboardContext } from "../context/DashboardContext";

export function SettingsPage() {
  const { business, embedKey, signedIn, needsMembership, linkToCurrentBusiness, linking } =
    useDashboardContext();

  const avatar = business?.avatarConfig;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-dash-ink">Settings</h1>
        <p className="text-xs text-dash-muted">Workspace configuration and embed details</p>
      </div>

      <section className="dash-card p-5 space-y-4">
        <h2 className="text-sm font-medium text-dash-ink">Business</h2>
        <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
          <dt className="text-dash-muted">Name</dt>
          <dd className="text-dash-ink">{business?.name ?? "—"}</dd>
          <dt className="text-dash-muted">Industry</dt>
          <dd className="text-dash-ink capitalize">{business?.industry ?? "—"}</dd>
          <dt className="text-dash-muted">Embed key</dt>
          <dd className="font-mono text-xs text-dash-accent">{embedKey}</dd>
        </dl>
      </section>

      <section className="dash-card p-5 space-y-4">
        <h2 className="text-sm font-medium text-dash-ink">Avatar config</h2>
        <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
          <dt className="text-dash-muted">Agent ID</dt>
          <dd className="font-mono text-xs text-dash-ink break-all">
            {avatar?.bpAgentId ?? "Not configured"}
          </dd>
          <dt className="text-dash-muted">Persona</dt>
          <dd className="text-dash-ink">{avatar?.personaTone ?? "—"}</dd>
          <dt className="text-dash-muted">Language</dt>
          <dd className="text-dash-ink">{avatar?.defaultLanguage ?? "—"}</dd>
        </dl>
      </section>

      <section className="dash-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-dash-ink">Webhooks</h2>
        <p className="text-xs text-dash-muted">
          CRM fetch, CRM push, and Slack URLs are configured per business in Convex. Contact
          your admin to update webhook endpoints.
        </p>
        <ul className="text-xs text-dash-muted space-y-1 font-mono">
          <li>crm_fetch · configured in backend</li>
          <li>crm_push · configured in backend</li>
          <li>slack_alert · configured in backend</li>
        </ul>
      </section>

      {signedIn && needsMembership && (
        <button
          type="button"
          onClick={linkToCurrentBusiness}
          disabled={linking}
          className="rounded-md bg-dash-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {linking ? "Linking…" : "Link account to this workspace"}
        </button>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Circle, Plug, RefreshCw, X } from "lucide-react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ConnectorCatalog = {
  kind: string;
  label: string;
  industries: string[];
  description: string;
};

const CATALOG: ConnectorCatalog[] = [
  {
    kind: "hubspot",
    label: "HubSpot",
    industries: ["bank", "saas", "hr"],
    description: "Push hot leads, sync contact properties, fire workflows.",
  },
  {
    kind: "stripe",
    label: "Stripe",
    industries: ["saas"],
    description: "Read trial state, write upgrade links, track MRR signal.",
  },
  {
    kind: "cloudbeds",
    label: "Cloudbeds PMS",
    industries: ["hotel"],
    description: "Returning-guest lookup, room availability, folio writes.",
  },
  {
    kind: "fhir_webhook",
    label: "FHIR Webhook",
    industries: ["hospital"],
    description: "Forward pre-brief to your EHR over HL7/FHIR webhook.",
  },
  {
    kind: "shopify",
    label: "Shopify",
    industries: ["ecommerce"],
    description: "Cart read, discount-code write, order status pull.",
  },
  {
    kind: "greenhouse",
    label: "Greenhouse",
    industries: ["hr"],
    description: "Candidate sync, interview scheduling, stage updates.",
  },
  {
    kind: "workday",
    label: "Workday",
    industries: ["hr"],
    description: "Job requisition pull, candidate status writeback.",
  },
];

function statusPill(status: string) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="size-3" /> Connected
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300">
        <X className="size-3" /> Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Circle className="size-3" /> Not connected
    </span>
  );
}

export function AdminIntegrations() {
  const { businessId, business } = useTenant();
  const rows = useQuery(
    api.connectors.listByBusiness,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );
  const upsert = useMutation(api.connectors.upsertConnector);
  const disconnect = useMutation(api.connectors.disconnect);
  const markSynced = useMutation(api.connectors.markSynced);

  const [busy, setBusy] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const byKind = new Map((rows ?? []).map((r) => [r.kind, r]));
  const suggested = business?.industry
    ? CATALOG.filter((c) => c.industries.includes(business.industry as string))
    : CATALOG;
  const other = CATALOG.filter((c) => !suggested.includes(c));

  async function handleConnect(kind: string) {
    if (!businessId) return;
    setBusy(kind);
    setErrorMsg(null);
    try {
      const apiToken = window.prompt(
        `Paste your ${kind} API token / webhook URL (stored encrypted)`
      );
      if (!apiToken) {
        setBusy(null);
        return;
      }
      await upsert({
        businessId: businessId as unknown as string,
        kind,
        configJson: JSON.stringify({ token: apiToken }),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleSync(kind: string) {
    if (!businessId) return;
    setBusy(kind);
    try {
      await markSynced({
        businessId: businessId as unknown as string,
        kind,
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleDisconnect(kind: string) {
    if (!businessId) return;
    if (!window.confirm(`Disconnect ${kind}?`)) return;
    setBusy(kind);
    try {
      await disconnect({
        businessId: businessId as unknown as string,
        kind,
      });
    } finally {
      setBusy(null);
    }
  }

  function renderRow(c: ConnectorCatalog) {
    const row = byKind.get(c.kind);
    const status = row?.status ?? "disconnected";
    const connected = status === "connected" || status === "error";
    return (
      <li
        key={c.kind}
        className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-3"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Plug className="size-4 text-muted-foreground" aria-hidden />
            <p className="font-medium text-foreground">{c.label}</p>
            {statusPill(status)}
          </div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {c.description}
          </p>
          {row?.lastSyncAt ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Last sync: {new Date(row.lastSyncAt).toLocaleString()}
            </p>
          ) : null}
          {row?.lastError ? (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">
              {row.lastError}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <button
                type="button"
                onClick={() => handleSync(c.kind)}
                disabled={busy === c.kind}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw className="size-3" /> Sync
              </button>
              <button
                type="button"
                onClick={() => handleDisconnect(c.kind)}
                disabled={busy === c.kind}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-rose-700 hover:bg-muted disabled:opacity-50 dark:text-rose-300"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleConnect(c.kind)}
              disabled={busy === c.kind}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Connect
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Suggested for your industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{suggested.map(renderRow)}</ul>
        </CardContent>
      </Card>

      {other.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Other connectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">{other.map(renderRow)}</ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

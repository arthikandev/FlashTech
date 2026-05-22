import { useMemo } from "react";
import { useTenant } from "@/tenant/TenantContext";

export type WebhookEndpointKey = "crmFetch" | "crmPush" | "slack";

export type WebhookEndpointStatus = {
  key: WebhookEndpointKey;
  label: string;
  configured: boolean;
  url?: string;
};

export function useWebhookStatus() {
  const { business } = useTenant();

  return useMemo(() => {
    const urls = business?.webhookUrls;
    const crmFetchUrl = urls?.crmFetch?.trim() || urls?.n8nCrmFetch?.trim();
    const crmPushUrl = urls?.crmPush?.trim() || urls?.n8nCrmPush?.trim();
    const slackUrl = urls?.slackHotLead?.trim() || urls?.n8nSlack?.trim();

    const endpoints: WebhookEndpointStatus[] = [
      {
        key: "crmFetch",
        label: "CRM fetch",
        configured: Boolean(crmFetchUrl),
        url: crmFetchUrl,
      },
      {
        key: "crmPush",
        label: "CRM push",
        configured: Boolean(crmPushUrl),
        url: crmPushUrl,
      },
      {
        key: "slack",
        label: "Slack alert",
        configured: Boolean(slackUrl),
        url: slackUrl,
      },
    ];
    const configuredCount = endpoints.filter((e) => e.configured).length;
    return { endpoints, configuredCount, totalCount: endpoints.length };
  }, [business?.webhookUrls]);
}

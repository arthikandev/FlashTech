import { v } from "convex/values";

/** Per-workspace automation endpoints (HTTPS). Legacy `n8n*` keys still read for older rows. */
export const businessWebhookUrls = v.object({
  crmFetch: v.optional(v.string()),
  crmPush: v.optional(v.string()),
  slackHotLead: v.optional(v.string()),
  n8nCrmFetch: v.optional(v.string()),
  n8nCrmPush: v.optional(v.string()),
  n8nSlack: v.optional(v.string()),
});

# Outbound & inbound webhooks (vendor-neutral)

PresenceIQ does **not** ship a specific workflow engine. Configure HTTPS endpoints you control (Zapier, Make, custom workers, etc.).

## Outbound (PresenceIQ → your URLs)

| Env / workspace field | When it fires |
|----------------------|---------------|
| `WEBHOOK_CRM_FETCH_TRIGGER` (or legacy `N8N_WEBHOOK_CRM_FETCH`) / `business.webhookUrls.crmFetch` | After fingerprint when a visitor is eligible for enrichment |
| `WEBHOOK_SLACK_HOT_LEAD` / `business.webhookUrls.slackHotLead` | When intent score ≥ 80 (hot lead) |
| `WEBHOOK_CRM_PUSH` / `business.webhookUrls.crmPush` | Post-call summary from Beyond Presence session webhook |
| `WEBHOOK_CHURN_RISK` (server-wide) | When churn risk is high on the visitor record |

## Inbound (your automation → PresenceIQ)

`POST /api/webhooks/crm-ingest` with header `X-Webhook-Secret: INBOUND_WEBHOOK_SECRET` (legacy: `N8N_WEBHOOK_SECRET`).

Same handler remains available at `POST /api/webhooks/n8n/crm` for older configs.

## Workflow templates (n8n / Make / Zapier)

Import or recreate from JSON sketches in [`devops/automation/workflows/`](automation/workflows/):

| File | Maps to env |
|------|-------------|
| `crm-fetch.workflow.json` | `WEBHOOK_CRM_FETCH_TRIGGER` |
| `hot-lead-slack.workflow.json` | `WEBHOOK_SLACK_HOT_LEAD` |
| `crm-push.workflow.json` | `WEBHOOK_CRM_PUSH` |
| `churn-email.workflow.json` | `WEBHOOK_CHURN_RISK` |

Point each workflow’s public webhook URL at the matching `WEBHOOK_*` value in `backend/.env.local` (or per-tenant `business.webhookUrls` in Convex).

## Local E2E

```bash
# Terminal 1: npx convex dev
# Terminal 2: npm run dev:clean
PRESENCEIQ_BACKEND_URL=http://localhost:3001 npm run test:webhooks
```

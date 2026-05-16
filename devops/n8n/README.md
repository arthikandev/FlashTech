# n8n Cloud — PresenceIQ automation

Import these workflows into [n8n Cloud](https://app.n8n.io) and connect them to your backend.

## Workflows

| File | Webhook path | Backend env var |
|------|----------------|-----------------|
| `crm-fetch.workflow.json` | `presenceiq-crm-fetch` | `N8N_WEBHOOK_CRM_FETCH` |
| `hot-lead-slack.workflow.json` | `presenceiq-hot-lead` | `N8N_WEBHOOK_SLACK` |
| `crm-push.workflow.json` | `presenceiq-crm-push` | `N8N_WEBHOOK_CRM_PUSH` |
| `churn-email.workflow.json` | `presenceiq-churn-email` | `N8N_WEBHOOK_CHURN` (optional) |

## Setup (n8n Cloud)

### 1. Import workflows

For each JSON file: **Workflows → Add workflow → ⋮ → Import from file**

### 2. Set n8n variables

**Settings → Variables** (must match `backend/.env.local`):

| Variable | Example |
|----------|---------|
| `PRESENCEIQ_BACKEND_URL` | `http://localhost:3001` (local `npm run dev:3001`) or your Vercel URL |
| `N8N_WEBHOOK_SECRET` | Same as backend `N8N_WEBHOOK_SECRET` |
| `SEYLAN_DEMO_ACCOUNT_NUMBER` | `064000012548001` (optional) |

### 3. Credentials

- **Hot Lead Slack** — connect Slack OAuth; set channel `#sales-alerts` (or your hackathon channel)
- **Churn Email** — configure SMTP credentials on the Send Email node (optional)

### 4. Activate and copy webhook URLs

Toggle each workflow **Active**. Copy the **Production Webhook URL** into `backend/.env.local`:

```bash
N8N_WEBHOOK_CRM_FETCH=https://YOUR.app.n8n.cloud/webhook/presenceiq-crm-fetch
N8N_WEBHOOK_SLACK=https://YOUR.app.n8n.cloud/webhook/presenceiq-hot-lead
N8N_WEBHOOK_CRM_PUSH=https://YOUR.app.n8n.cloud/webhook/presenceiq-crm-push
N8N_WEBHOOK_CHURN=https://YOUR.app.n8n.cloud/webhook/presenceiq-churn-email
```

Restart `npm run dev` after updating env.

### 5. Local backend + n8n Cloud

n8n Cloud cannot reach `localhost` unless you expose it:

- Deploy backend to Vercel, or
- Use [ngrok](https://ngrok.com): `ngrok http 3000` → set `PRESENCEIQ_BACKEND_URL` to the ngrok HTTPS URL

## CRM fetch flow

1. Backend `POST /api/fingerprint` → triggers `N8N_WEBHOOK_CRM_FETCH`
2. n8n calls `POST {BACKEND}/api/seylan/account-inquiry` (Seylan key stays on backend)
3. Falls back to Sarangan demo data if Seylan fails
4. n8n `POST {BACKEND}/api/webhooks/n8n/crm` with `X-Webhook-Secret`
5. Pipeline receives enriched CRM → personalised opener

## Hot lead flow

1. `POST /api/pipeline` scores intent
2. If `intentScore >= 80` → backend POSTs to `N8N_WEBHOOK_SLACK`
3. n8n IF node → Slack message

## Post-call flow

1. Person 1 `POST /api/webhooks/beyondpresence/session`
2. Backend forwards to `N8N_WEBHOOK_CRM_PUSH`
3. n8n logs outcome + responds 200

## Test

```bash
# Backend running on :3000
bash devops/scripts/test-n8n-flow.sh
```

Check **Executions** in n8n Cloud for each workflow.

# n8n setup (Person 1 — DevOps)

Import workflows from this folder into your n8n instance (cloud or self-hosted).

## 1. Environment variables (n8n)

| Variable | Example |
|----------|---------|
| `PRESENCEIQ_BACKEND_URL` | `https://your-app.vercel.app` or `http://localhost:3000` |
| `N8N_WEBHOOK_SECRET` | Same as `backend/.env.local` — run `node devops/scripts/generate-secrets.js` |

## 2. Import workflows

| File | Purpose |
|------|---------|
| `crm-fetch.workflow.json` | Fingerprint → fetch fake CRM → `POST /api/webhooks/n8n/crm` |
| `hot-lead-slack.workflow.json` | Backend triggers Slack when intent &gt; 80 |
| `crm-push.workflow.json` | Post-conversation CRM update |
| `churn-email.workflow.json` | Stretch |

**Steps:** n8n → Workflows → Import from File → select each JSON → Activate.

## 3. Copy webhook URLs to backend

After activation, copy each workflow’s **Production Webhook URL** into Vercel / `backend/.env.local`:

```
N8N_WEBHOOK_CRM_FETCH=https://...
N8N_WEBHOOK_SLACK=https://...
N8N_WEBHOOK_CRM_PUSH=https://...
```

Redeploy backend on Vercel after updating env vars.

## 4. Smoke tests

### CRM path

1. `POST /api/fingerprint` with `embedKey: seylan-demo`
2. Confirm n8n runs CRM fetch workflow
3. Visitor `crmData.name` populated in Convex

Or manual:

```powershell
$env:BACKEND_URL="http://localhost:3000"
$env:N8N_WEBHOOK_SECRET="your-secret"
.\devops\scripts\integration-test.ps1
```

### Slack path

1. Complete pipeline for high-intent visitor (Sarangan seed)
2. `POST /api/webhooks/beyondpresence/session` with valid payload
3. Confirm Slack channel receives hot-lead message

## 5. Checklist

- [ ] All 4 workflows imported and active
- [ ] n8n env vars set
- [ ] Backend `N8N_WEBHOOK_*` URLs set
- [ ] CRM fetch smoke test pass
- [ ] Slack smoke test pass

# PresenceIQ DevOps

## Quick links

- [Person 1 tracker (dev.md)](../dev.md)
- [Vercel deploy](deploy/vercel.md)
- [Convex deploy](deploy/convex.md) · [D1 checklist](deploy/D1-convex-checklist.md)
- [Frontend deploy](deploy/frontend.md)
- [n8n workflows](n8n/) · [n8n SETUP](n8n/SETUP.md)
- [Generate secrets](scripts/generate-secrets.js)
- [Integration test (PowerShell)](scripts/integration-test.ps1)

## Environment setup

See [docs/ENV.md](../docs/ENV.md). Backend: `cd backend && cp .env.example .env.local`

## Integration test checklist (hour 20)

Run with backend on `http://localhost:3000` and `npx convex dev` + seed:

```bash
cd backend
npx convex run seed:seedDemo
```

- [ ] `curl http://localhost:3000/api/health` returns `"status":"ok"`
- [ ] `curl http://localhost:3000/api/embed/seylan-demo` returns JavaScript
- [ ] POST `/api/fingerprint` with `embedKey: seylan-demo`, `fingerprint: demo-sarangan-fp` returns visitorId
- [ ] POST `/api/pipeline` with visitorId + businessId returns Sarangan opener, `pipelineMs` < 2000
- [ ] POST `/api/webhooks/n8n/crm` with `X-Webhook-Secret` patches CRM name
- [ ] POST `/api/webhooks/beyondpresence/session` saves conversation
- [ ] Convex dashboard shows visitors + intelligence rows

## n8n setup

1. Import JSON files from `n8n/` into your n8n instance.
2. Set environment variables:
   - `PRESENCEIQ_BACKEND_URL` — e.g. `http://localhost:3000`
   - `N8N_WEBHOOK_SECRET` — must match backend `.env.local`
3. Copy webhook URLs into backend env:
   - `N8N_WEBHOOK_CRM_FETCH`
   - `N8N_WEBHOOK_SLACK`
   - `N8N_WEBHOOK_CRM_PUSH`

## Production checklist

- [ ] `npx convex deploy` from `backend/`
- [ ] Vercel deploy with root directory `backend`
- [ ] All env vars set (see `docs/ENV.md` and `backend/.env.example`)
- [ ] URLs posted in root `README.md` and `docs/DEVELOPMENT_PLAN.md`

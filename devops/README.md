# PresenceIQ DevOps

## Quick links

- [Person 1 tracker (dev.md)](../dev.md)
- [Vercel deploy](deploy/vercel.md)
- [Convex deploy](deploy/convex.md) · [D1 checklist](deploy/D1-convex-checklist.md)
- [Frontend deploy](deploy/frontend.md) · [frontend Vercel](deploy/frontend-vercel.md)
- [n8n workflows](n8n/) · [n8n SETUP](n8n/SETUP.md) · [n8n README](n8n/README.md)
- [Generate secrets](scripts/generate-secrets.js)
- [Integration test (bash)](scripts/integration-test.sh) · [PowerShell](scripts/integration-test.ps1)
- [n8n E2E test](scripts/test-n8n-flow.sh)

## Environment setup

See [docs/ENV.md](../docs/ENV.md) and [scripts/setup-integration-env.md](scripts/setup-integration-env.md). Backend: `cd backend && cp .env.example .env.local`

## Verify all backend layers

```bash
cd backend
npm run verify:all      # env + build + Convex
npm run verify:full     # + n8n webhook URLs + smoke ping
npm run status          # quick integration summary
```

## Integration checklist

- [ ] `curl http://localhost:3001/api/embed/seylan-demo` returns JavaScript
- [ ] POST `/api/fingerprint` with `embedKey: seylan-demo`, `fingerprint: demo-sarangan-fp` returns visitorId
- [ ] POST `/api/pipeline` returns personalised opener for Sarangan
- [ ] Beyond Presence status: `curl http://localhost:3001/api/beyondpresence/status`
- [ ] n8n workflows imported and `N8N_WEBHOOK_*` set in `backend/.env.local`

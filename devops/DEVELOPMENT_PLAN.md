# DevOps & Automation — Development Plan

**Lead**: Person 1 (DevOps + Avatar) — see [dev.md](../dev.md)

## Milestones

- [x] n8n workflow JSON exports in `devops/n8n/`
- [x] Deploy docs in `devops/deploy/`
- [ ] Hour 4 — Convex cloud deployed
- [ ] Hour 10 — Vercel backend URL shared with team
- [ ] Hour 24 — All env vars set in production

## Environment variables

See [docs/ENV.md](../docs/ENV.md) (index) and [backend/.env.example](../backend/.env.example) (backend source of truth).

## D0 secrets

- [x] `devops/scripts/generate-secrets.js`
- [ ] Run script; hand off `devops/.secrets.local` to Person 2

## n8n workflows

See [n8n/SETUP.md](n8n/SETUP.md).

- [ ] Import `n8n/crm-fetch.workflow.json`
- [ ] Import `n8n/hot-lead-slack.workflow.json`
- [ ] Import `n8n/crm-push.workflow.json`
- [ ] Import `n8n/churn-email.workflow.json` (stretch)

## Deploy checklist

- [ ] `backend/` → Vercel — [deploy/vercel.md](deploy/vercel.md)
- [ ] `npx convex deploy` — [deploy/D1-convex-checklist.md](deploy/D1-convex-checklist.md)
- [ ] `frontend/` → [deploy/frontend.md](deploy/frontend.md)
- [ ] Post URLs in root README.md and [dev.md](../dev.md)

## Integration test (hour 20)

Run `devops/scripts/integration-test.ps1` with `BACKEND_URL` set.

- [ ] Reload Seylan site → pipeline < 2s
- [ ] Slack fires on hot lead
- [ ] Dashboard updates without refresh

## Blockers / notes

_(add during build)_

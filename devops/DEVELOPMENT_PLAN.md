# DevOps & Automation — Development Plan

**Leads**: Person 2 (n8n, backend deploy) + Person 3 (frontend deploy)

## Milestones

- [x] n8n workflow JSON exports in `devops/n8n/`
- [x] Deploy docs in `devops/deploy/`
- [ ] Hour 4 — Convex cloud deployed
- [ ] Hour 10 — Vercel backend URL shared with team
- [ ] Hour 24 — All env vars set in production

## Environment variables

See [docs/ENV.md](../docs/ENV.md) (index) and [backend/.env.example](../backend/.env.example) (backend source of truth).

## n8n workflows

- [ ] Import `n8n/crm-fetch.workflow.json`
- [ ] Import `n8n/hot-lead-slack.workflow.json`
- [ ] Import `n8n/crm-push.workflow.json`
- [ ] Import `n8n/churn-email.workflow.json` (stretch)

## Deploy checklist

- [ ] `backend/` → Vercel (root directory = `backend`)
- [ ] `npx convex deploy` from `backend/`
- [ ] `frontend/` → Vercel or Netlify
- [ ] Post URLs in root README.md

## Integration test (hour 20)

- [ ] Reload Seylan site → pipeline < 2s
- [ ] Slack fires on hot lead
- [ ] Dashboard updates without refresh

## Blockers / notes

_(add during build)_

# DevOps — Member C

Owner of database, deployments, GitHub hygiene, env management.

## Folder map
```
devops/
├── README.md                     this file
├── deploy/
│   ├── neon.md                   Postgres on Neon — create project, get URLs
│   ├── render.md                 Backend on Render — env, build, start
│   ├── netlify.md                Frontend on Netlify — base, build, publish
│   └── env-vars.md               full list of env vars per environment
├── scripts/
│   ├── setup-labels.sh           create GitHub labels for issue tagging
│   ├── branch-protection.sh      protect main: require 1 review + status checks
│   └── share-secrets.md          how to share secrets safely with the team
```

## Daily checklist
- [ ] Neon project provisioned, `DATABASE_URL` + `DIRECT_URL` shared with Member B (private channel only)
- [ ] OpenAI API key shared with Member B
- [ ] Prisma schema migrated on Neon — confirm 4 tables exist
- [ ] Seed data applied — login `test@studymate.ai / password123` works
- [ ] Render web service deployed, env vars set, healthcheck `/health` returns 200
- [ ] Netlify deployed, `VITE_API_URL` points to Render URL
- [ ] End-to-end smoke: register → create note → AI summary → quiz → progress chart
- [ ] Branch protection enabled on `main`
- [ ] All members have access to repo + dashboards

## What lives where (not in this folder)
- Prisma schema + migrations: `backend/prisma/` (you own this content even though it sits there for Prisma to find it)
- Netlify SPA redirects: `frontend/public/_redirects`
- PR + Issue templates: `.github/`
- `.env.example` files: in each app folder

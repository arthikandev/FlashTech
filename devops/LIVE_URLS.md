# Production URLs (PresenceIQ)

| Service | URL |
|---------|-----|
| Backend API | https://backend-blond-theta-13.vercel.app |
| Frontend app | https://frontend-nu-neon-44.vercel.app |
| Convex (dev deployment) | https://adamant-puffin-769.convex.cloud |
| CloudMetrics demo | https://frontend-nu-neon-44.vercel.app/sites/cloudmetrics/index.html#/pricing |
| Avatar SDK | https://frontend-nu-neon-44.vercel.app/presenceiq-avatar.js |
| Embed script | https://backend-blond-theta-13.vercel.app/api/embed/cloudmetrics-demo |

## Deploy commands

```bash
node devops/scripts/generate-secrets.js
node devops/scripts/apply-secrets.mjs
bash devops/scripts/build-avatar-bundle.sh
bash devops/scripts/vercel-sync-env.sh backend
cd backend && vercel deploy --prod --yes --scope sarangans-projects-55d6b0e1
bash devops/scripts/vercel-sync-env.sh frontend
cd frontend && vercel deploy --prod --yes --scope sarangans-projects-55d6b0e1
```

## n8n

See [n8n/PRODUCTION.md](n8n/PRODUCTION.md). After importing workflows, sync webhook URLs:

```bash
bash devops/scripts/vercel-sync-env.sh backend
cd backend && vercel deploy --prod --yes --scope sarangans-projects-55d6b0e1
```

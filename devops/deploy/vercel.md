# Deploy backend to Vercel

1. Import GitHub repo in Vercel.
2. Set **Root Directory** to `backend`.
3. Framework: Next.js (auto-detected).
4. Add environment variables from `backend/.env.example` (see `docs/ENV.md` for shared values across tracks).
5. Deploy.

## Required env vars

Use `backend/.env.example` as source of truth. Sync to Vercel:

```bash
bash devops/scripts/vercel-sync-env.sh backend
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex HTTP client |
| `OPENAI_API_KEY` | Intent scoring |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g. `https://backend-blond-theta-13.vercel.app`) |
| `BEYONDPRESENCE_API_KEY` | BP agent sync |
| `BP_WEBHOOK_SECRET`, `N8N_WEBHOOK_SECRET` | Webhook auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Dashboard |
| `N8N_WEBHOOK_CRM_FETCH`, `N8N_WEBHOOK_SLACK`, `N8N_WEBHOOK_CRM_PUSH` | n8n automation |
| `SEYLAN_API_BASE_URL`, `SEYLAN_API_KEY` | Sandbox CRM (optional) |

**CI only:** `CONVEX_DEPLOY_KEY` (not needed on Vercel runtime)

## One-command deploy

```bash
bash devops/scripts/vercel-deploy-all.sh
```

## Post-deploy

Update root `README.md` with production URL. Share with Person 3 for embed `src` (frontend unchanged — uses `VITE_BACKEND_URL`).

## API rehearsal (no frontend changes)

From repo root, with backend running locally:

```bash
cd backend
npm run check:env
npm run verify:all          # stop dev server first, or run clean + dev after
curl -s http://localhost:3001/api/health | jq .checks
curl -s http://localhost:3001/api/beyondpresence/status | jq .
bash ../devops/scripts/test-n8n-flow.sh   # after N8N_WEBHOOK_* set
```

Demo site (Person 3 frontend, frozen): `http://localhost:5173/sites/seylan/index.html#/pricing`

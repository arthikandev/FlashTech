# Deploy backend to Vercel

1. Import GitHub repo in Vercel.
2. Set **Root Directory** to `backend`.
3. Framework: Next.js (auto-detected).
4. Add environment variables from `backend/.env.example` (see `docs/ENV.md` for shared values across tracks).
5. Deploy.

## Required env vars

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT` (from Convex dashboard)
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your Vercel URL)
- `N8N_WEBHOOK_SECRET`, `BP_WEBHOOK_SECRET`
- `N8N_WEBHOOK_CRM_FETCH`, `N8N_WEBHOOK_SLACK`, `N8N_WEBHOOK_CRM_PUSH` (optional)

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

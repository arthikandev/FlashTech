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

Update root `README.md` with production URL. Share with Person 3 for embed `src`.

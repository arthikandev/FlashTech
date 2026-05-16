# Deploy frontend to Vercel

1. Import GitHub repo in Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework: Vite (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`

## Environment variables

| Variable | Example |
|----------|---------|
| `VITE_BACKEND_URL` | `https://your-backend.vercel.app` |
| `VITE_CONVEX_URL` | `https://adamant-puffin-769.convex.cloud` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

## Post-deploy

- Dashboard: `https://<app>.vercel.app/`
- Seylan demo: `https://<app>.vercel.app/sites/seylan/index.html#/pricing`
- Update `docs/DEVELOPMENT_PLAN.md` shared URLs table.

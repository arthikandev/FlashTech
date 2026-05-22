# FlashTech reference

## Key paths

| Path | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Routes; `/dashboard` → BackendRedirect |
| `frontend/src/lib/runtimeConfig.ts` | Convex URL resolution |
| `scripts/setup-local-env.mjs` | Creates `.env.local` files |
| `frontend/scripts/write-runtime-config.mjs` | CI / build: writes runtime-config from secrets |
| `docs/ENV.md` | Env var index |
| `docs/ARCHITECTURE.md` | Pipeline sequence |
| `devops/deploy/frontend.md` | Vercel frontend |
| `devops/deploy/vercel.md` | Vercel backend |

## Team Convex deployment (example)

- URL: `https://adamant-puffin-769.convex.cloud`
- Deployment: `dev:adamant-puffin-769`

## Message template for teammate

> Frontend Vercel: branch `main`, root `frontend`. I own landing + `/login`. Please keep deploying backend from your branch; share production backend URL for `VITE_BACKEND_URL` / `runtime-config.json`. Do not change `frontend/src/landing/` on `main`.

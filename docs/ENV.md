# Environment variables

PresenceIQ uses **one `.env.example` per app folder** (not at repo root). Next.js and Vite only load env files from the folder where you run `npm run dev`.

## Which file to copy

| Track | Person | Copy this file | To |
|-------|--------|----------------|-----|
| Backend | Person 2 | [`backend/.env.example`](../backend/.env.example) | `backend/.env.local` |
| Avatar | Person 1 | [`avatar/.env.example`](../avatar/.env.example) | `avatar/.env.local` |
| Frontend | Person 3 | [`frontend/.env.example`](../frontend/.env.example) | `frontend/.env.local` |

## Shared values (must match across tracks)

| Variable | Defined in | Also used by |
|----------|------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | backend | frontend → `VITE_CONVEX_URL` (same URL) |
| `BP_WEBHOOK_SECRET` | backend | avatar (post-call webhook header) |
| `N8N_WEBHOOK_SECRET` | backend | n8n workflows calling backend webhooks |
| `NEXT_PUBLIC_APP_URL` / `BACKEND_URL` | backend | avatar, frontend embed + API calls |

**Source of truth for backend + webhooks:** [`backend/.env.example`](../backend/.env.example)

## Convex setup (Person 2)

1. Copy `backend/.env.example` → `backend/.env.local`
2. Set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` (see backend template for `adamant-puffin-769` example)
3. Run `npx convex dev` from `backend/` — it may add dev credentials to `.env.local` automatically
4. For CI/production deploy: use **Deploy Key** from Convex Dashboard → Settings (not the `dev:slug|eyJ...` dev URL token)

## Production (Vercel / Netlify)

Set the same variable names in each platform’s dashboard for the matching root directory (`backend/`, `frontend/`). See [devops/deploy/vercel.md](../devops/deploy/vercel.md).

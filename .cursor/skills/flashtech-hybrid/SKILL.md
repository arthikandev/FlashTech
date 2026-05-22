---
name: flashtech-hybrid
description: >-
  FlashTech (PresenceIQ) monorepo: hybrid UI (your landing/login on Vite,
  friend backend on setup-clerk), Convex env, deploy rules. Use when working
  in FlashTech, PresenceIQ, frontend/backend split, Vercel, convex dev, or
  teammate branch setup-clerk.
---

# FlashTech hybrid workflow

## Product split (do not merge UIs blindly)

| Surface | Owner | Location | Branch |
|---------|-------|----------|--------|
| Landing + login | Person 3 (you) | `frontend/src/landing/`, `frontend/src/auth/` | `main` |
| API, Clerk dashboard, embed | Person 2 (friend) | `backend/`, friend may use `setup-clerk` | friend workflow unchanged |
| Avatar embed SDK | Person 1 | `avatar/` | — |
| Automation / deploy docs | Person 1 | `devops/` | — |

**Hard rule:** Do not replace or redesign the cinematic landing on `main` unless the user explicitly asks. Friend must not edit `frontend/src/landing/**` on `main` without review.

## User journey

```text
/ and /login     → Vite frontend (your UI)
after sign-in    → {backendUrl}/dashboard (friend's Next.js + Clerk on setup-clerk)
/demos/*         → Vite demo tenants + EmbedScript
```

Handoff: [`frontend/src/lib/backendUrl.ts`](frontend/src/lib/backendUrl.ts) → `goToBackendDashboard()`.

## Local dev (automatic defaults)

```bash
# Once per machine
node scripts/setup-local-env.mjs   # or: cd frontend && npm run dev (runs setup)

# Terminal 1 — friend backend (their workflow; port 3001 on setup-clerk)
cd backend && npm install && npx convex dev && npm run dev

# Terminal 2 — your frontend
cd frontend && npm run dev   # :5173, proxies /app → localhost:3001 if no VITE_BACKEND_URL
```

Config resolution order:

1. `VITE_BACKEND_URL` / `VITE_CONVEX_URL` in `frontend/.env.local`
2. [`frontend/public/runtime-config.json`](frontend/public/runtime-config.json) (`backendUrl`, `convexUrl`)
3. Dev proxy: `/app` → `http://localhost:3001`
4. Convex default: `https://adamant-puffin-769.convex.cloud`

Restart Vite after changing `.env.local`.

## Convex

- Backend: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` in `backend/.env.local`
- Frontend: `VITE_CONVEX_URL` must match backend URL
- Run `npx convex dev` from `backend/`; seed with `npm run seed`
- Vite `/dashboard` routes redirect to backend; Convex React dashboard in `frontend/src/dashboard/` is legacy unless routes are restored

## Git and deploy

- **Production frontend:** Vercel root `frontend/`, branch **`main`**
- **Production backend:** Vercel root `backend/` — often friend's deploy from `setup-clerk` until merged
- Set `VITE_BACKEND_URL` on frontend Vercel to friend's live backend URL
- Optional GitHub secrets: `PRESENCEIQ_BACKEND_URL`, `PRESENCEIQ_CONVEX_URL` (see `.github/workflows/frontend-ci.yml`)

**Do not** set frontend Vercel Production Branch to `setup-clerk` (swaps landing).

Selective merge (friend → `main`): take `backend/**`, `avatar/**`; keep your `frontend/src/landing/**`, `motion-footer.tsx`, `pricing-cards.tsx`.

## Known gaps on `main`

- `main` backend may lack `/dashboard` until friend's `setup-clerk` is merged or `runtime-config.json` points at friend's deployed backend
- ~173 files differ between `main` and `origin/setup-clerk`
- Login is mock (no Clerk on Vite login page)
- Dead code: `OnboardingPage`, `DashboardRoute`, `LandingHeader` (unused in router)

## Verify before push

```bash
cd frontend && npm run build
cd backend && npm ci && npm run build
```

## Push

Only commit when the user asks. Push `main` to `origin` after landing-preserving changes.

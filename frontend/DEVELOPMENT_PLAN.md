# Frontend & Demo Lead — Development Plan

**Owner:** Person 3  
**Branch:** `feature/frontend-person3`  
**Tools:** React, Vite, TypeScript, Tailwind, Convex React client  
**Guide:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

Aligned with [docs/DEVELOPMENT_PLAN.md](../docs/DEVELOPMENT_PLAN.md).

## Team checkpoints

| Hour | Checkpoint | Done |
|------|------------|------|
| 4 | Embed + visitor on CloudMetrics demo | [x] |
| 10 | Reload shows visitor in dashboard (Sarangan E2E) | [x] |
| 15 | Live dashboard with intent scores (reactive) | [x] |
| 20 | Full demo script ready | [ ] |
| 24 | 3 demo sites + pitch + 10 rehearsals | [ ] |

## Repo layout

```
frontend/src/demos/     — React route demos (upstream)
frontend/sites/       — Static HTML demos + boot.ts (legacy)
```

## Phase 4 — Onboarding & pitch (stashed work)

- [x] Onboarding wizard — `/onboard`
- [x] 5-slide pitch deck — `/deck`
- [x] Slack mock — `/slack`
- [x] Deploy frontend to Vercel — https://frontend-nu-neon-44.vercel.app
- [ ] 10 rehearsals with P1 + P2

## Depends on Person 2

- [x] API contract — `docs/API_CONTRACT.md`
- [ ] Production `VITE_BACKEND_URL` (use `http://localhost:3001` locally)
- [x] Convex URL — `adamant-puffin-769`

## Local dev

```bash
# Terminal 1 — backend
cd backend && npm run dev:3001

# Terminal 2 — frontend (uses localhost:3001 via .env.development)
cd frontend
cp .env.example .env.local   # add VITE_CLERK_PUBLISHABLE_KEY from backend
npm install
npm run build:avatar         # once — copies SDK to public/
npm run dev
```

| Command | Backend target |
|---------|----------------|
| `npm run dev` | Local `http://localhost:3001` |
| `npm run dev:deployed` | Production Vercel API (UI dev only) |
| `npm run deploy` | Build + push to Vercel |

Routes: `/demos/cloudmetrics` (React) · `/sites/cloudmetrics/index.html#/pricing` (static)  
Dashboard: http://localhost:5173/dashboard

**Production:** https://frontend-nu-neon-44.vercel.app

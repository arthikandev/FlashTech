# Frontend & Demo Lead — Development Plan

**Owner:** Person 3  
**Branch:** `feature/frontend-person3`  
**Tools:** React, Vite, TypeScript, Tailwind, Convex React client  
**Guide:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

Aligned with [docs/DEVELOPMENT_PLAN.md](../docs/DEVELOPMENT_PLAN.md).

## Team checkpoints

| Hour | Checkpoint | Done |
|------|------------|------|
| 4 | Embed + visitor on Seylan demo | [x] |
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
- [ ] Deploy frontend to Vercel
- [ ] 10 rehearsals with P1 + P2

## Depends on Person 2

- [x] API contract — `docs/API_CONTRACT.md`
- [ ] Production `VITE_BACKEND_URL` (use `http://localhost:3001` locally)
- [x] Convex URL — `adamant-puffin-769`

## Local dev

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Routes: `/demos/seylan` (React) · `/sites/seylan/index.html#/pricing` (static)  
Dashboard: http://localhost:5173/dashboard

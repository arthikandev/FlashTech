# Frontend & Demo Lead — Development Plan

**Owner**: Person 3  
**Branch**: `feature/frontend-person3`  
**Tools**: React/Vite, Convex React client, Tailwind

## Milestones

- [ ] Hour 4 — Seylan Bank demo site with embed placeholder
- [ ] Hour 10 — Embed live; page reload shows visitor in dashboard
- [ ] Hour 15 — Live dashboard with intent scores (reactive)
- [ ] Hour 24 — 3 demo sites + pitch deck + 10 rehearsals

## Phase 1 — Foundation (0–4h)

- [ ] Scaffold `frontend/` (Vite + React recommended)
- [ ] Build fake Seylan Bank landing page (pricing page prominent)
- [ ] Add embed script tag — see `frontend/.env.example` and `docs/ENV.md`
- [ ] Seed fake CRM JSON — `frontend/public/fake-crm.json`
- [ ] Second screen layout for Slack demo

## Phase 2 — Demo sites (4–10h)

- [ ] Seylan Bank — `embedKey: seylan-demo`
- [ ] CloudMetrics SaaS — `embedKey: cloudmetrics-demo`
- [ ] Coral Resort Hotel — `embedKey: coral-demo`

## Phase 3 — Live dashboard (10–18h)

- [ ] Convex provider — `VITE_CONVEX_URL` from Person 2
- [ ] `listLiveSessions` — real-time session table
- [ ] `getSessionDetail` — transcript, intent arc, action items

## Depends on Person 2

- [x] API contract + query names in `docs/API_CONTRACT.md`
- [ ] Vercel backend URL for embed `src`
- [ ] Convex deployment URL

## Embed snippet

```html
<script src="http://localhost:3000/api/embed/seylan-demo" async></script>
```

## Blockers / notes

_(add during build)_

# PresenceIQ

**The AI avatar that knows WHO you are before you speak.**

Pre-conversation customer intelligence · Personalised in real time · For enterprise

Cursor Colombo 24H Buildathon 2026 · BeyondPresence Track

## Team

| Person | Role | Folder | Development plan |
|--------|------|--------|-------------------|
| Person 1 | DevOps & Avatar | [`avatar/`](avatar/) · [`devops/`](devops/) | [dev.md](dev.md) |
| Person 2 | Backend & Automation | [`backend/`](backend/) | [backend/DEVELOPMENT_PLAN.md](backend/DEVELOPMENT_PLAN.md) |
| Person 3 | Frontend & Demo Lead | [`frontend/`](frontend/) | [frontend/DEVELOPMENT_PLAN.md](frontend/DEVELOPMENT_PLAN.md) |

Shared: [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) · [`devops/DEVELOPMENT_PLAN.md`](devops/DEVELOPMENT_PLAN.md)

## Environment variables

See **[docs/ENV.md](docs/ENV.md)** — one `.env.example` per track (`backend/`, `avatar/`, `frontend/`). No root `.env` file.

## Deploy frontend SPA (single Vercel site)

See **[devops/deploy/frontend-vercel.md](devops/deploy/frontend-vercel.md)** — Root Directory **`frontend/`**, **`npm run build`** (includes **presenceiq-avatar.js**).

## Quick start (full stack)

The **product UI** (landing, dashboard, demos) is the **frontend** Vite app. The **backend** is the API only — visiting `localhost:3000` (or `:3001` / `:3002`) alone shows a minimal API index, not the dashboard.

```bash
# Terminal 1 — Convex
cd backend && npx convex dev

# Terminal 2 — API (default http://localhost:3000, or npm run dev:3001)
cd backend && cp .env.example .env.local && npm install && npm run dev

# Terminal 3 — Product UI ← open this in the browser
cd frontend && npm install && npm run dev
# → http://localhost:5173  (dashboard: /dashboard, Seylan demo: /demos/seylan)
```

See **[backend/SETUP.md](backend/SETUP.md)** for API keys. Root `/` on the API server redirects to the frontend in the browser; use `/?api=1` to stay on the API index.

## Embed (demo sites)

```html
<script src="http://localhost:3000/api/embed/seylan-demo" async></script>
```

Listen for `presenceiq:ready`, then call `POST /api/pipeline`.

## API docs

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) — functional and non-functional requirements
- [docs/API_CONTRACT.md](docs/API_CONTRACT.md)
- [docs/BEYOND_PRESENCE.md](docs/BEYOND_PRESENCE.md) — Beyond Presence setup
- [docs/API_PROVIDERS.md](docs/API_PROVIDERS.md) — OpenAI, BP, Seylan, n8n, Convex, Clerk
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/BACKEND_CONTRIBUTION.md](docs/BACKEND_CONTRIBUTION.md)

## Live URLs

- Backend (Vercel): https://backend-blond-theta-13.vercel.app
- Convex: https://adamant-puffin-769.convex.cloud
- Frontend (Vercel): https://frontend-nu-neon-44.vercel.app
- Seylan demo: https://frontend-nu-neon-44.vercel.app/sites/seylan/index.html#/pricing
- Avatar SDK: https://frontend-nu-neon-44.vercel.app/presenceiq-avatar.js
- n8n setup: [devops/n8n/PRODUCTION.md](devops/n8n/PRODUCTION.md) (paste workflow webhook URLs into backend Vercel env)

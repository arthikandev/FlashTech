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

## Quick start (backend)

See **[backend/SETUP.md](backend/SETUP.md)** for full API key setup.

```bash
cd backend                   # required — Convex/npm commands need backend/package.json
cp .env.example .env.local   # add OPENAI_API_KEY — see SETUP.md
npm install
npm run check:env
npm run verify:all           # env + build + Convex
npm run verify:full          # + n8n webhooks (after pasting URLs in .env.local)
npx convex dev               # terminal 1 — deploy schema
npm run dev                  # terminal 2 — http://localhost:3000
npx convex run seed:seedDemo # run from backend/ only
```

## Embed (demo sites)

```html
<script src="http://localhost:3000/api/embed/seylan-demo" async></script>
```

Listen for `presenceiq:ready`, then call `POST /api/pipeline`.

## API docs

- [docs/API_CONTRACT.md](docs/API_CONTRACT.md)
- [docs/BEYOND_PRESENCE.md](docs/BEYOND_PRESENCE.md) — Beyond Presence setup
- [docs/API_PROVIDERS.md](docs/API_PROVIDERS.md) — OpenAI, BP, Seylan, n8n, Convex, Clerk
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/BACKEND_CONTRIBUTION.md](docs/BACKEND_CONTRIBUTION.md)

## Live URLs

_Fill after deploy — see [devops/DEVELOPMENT_PLAN.md](devops/DEVELOPMENT_PLAN.md)_

- Backend (Vercel): _
- Convex: _
- Frontend dashboard: _

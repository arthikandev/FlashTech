# PresenceIQ — integration environment setup (all tracks)

Run from repo root. Paste real values into `backend/.env.local` (never commit).

## 1. Backend `.env.local`

```bash
cd backend
cp .env.example .env.local
```

Required for full stack:

| Variable | Source |
|----------|--------|
| `N8N_WEBHOOK_CRM_FETCH` | n8n Cloud → crm-fetch workflow → Production URL |
| `N8N_WEBHOOK_SLACK` | n8n Cloud → hot-lead-slack → Production URL |
| `N8N_WEBHOOK_CRM_PUSH` | n8n Cloud → crm-push → Production URL |
| `N8N_WEBHOOK_CHURN` | optional |
| `BEYONDPRESENCE_API_KEY` | https://app.bey.chat/settings |
| `N8N_WEBHOOK_SECRET` | `openssl rand -hex 16` |

## 2. n8n Cloud variables

| Variable | Value |
|----------|--------|
| `PRESENCEIQ_BACKEND_URL` | ngrok HTTPS URL or Vercel backend URL |
| `N8N_WEBHOOK_SECRET` | same as backend |

Local backend: `ngrok http 3001` then set URL in n8n.

## 3. Verify

```bash
cd backend
npm run verify:full
npm run validate:n8n
PRESENCEIQ_BACKEND_URL=http://localhost:3001 npm run test:n8n
```

## 4. Frontend `.env.local`

```bash
cd frontend
cp .env.example .env.local
# VITE_BACKEND_URL, VITE_CONVEX_URL, VITE_CLERK_PUBLISHABLE_KEY
```

## 5. Avatar `.env`

```bash
cd avatar
cp .env.example .env
# VITE_BACKEND_URL or BACKEND_URL
```

# Environment variables

Single source of truth. Keep this updated when you add/rename vars.

## Backend (`backend/.env` locally, Render env in prod)

| Key | Local | Production | Notes |
|-----|-------|------------|-------|
| `DATABASE_URL` | Neon pooled URL | Neon pooled URL | port 6543 |
| `DIRECT_URL` | Neon direct URL | Neon direct URL | port 5432, for migrations |
| `JWT_SECRET` | any random string | `openssl rand -hex 32` | rotate if leaked |
| `JWT_EXPIRES_IN` | `7d` | `7d` | |
| `OPENAI_API_KEY` | from openai.com | from openai.com | |
| `OPENAI_MODEL` | `gpt-4o-mini` | `gpt-4o-mini` | |
| `PORT` | `3000` | (Render injects) | |
| `NODE_ENV` | `development` | `production` | |
| `FRONTEND_URL` | `http://localhost:5173` | Netlify URL | for CORS |

## Frontend (`frontend/.env` locally, Netlify env in prod)

| Key | Local | Production |
|-----|-------|------------|
| `VITE_API_URL` | `http://localhost:3000` | Render URL |

## Secrets distribution
Member C owns the master copy. Share via:
- **Tier 1 (Neon, OpenAI)**: 1Password / Bitwarden vault item shared with Member B only.
- **Tier 2 (test seed login)**: posted in team Discord channel — fine to share with all.
- **Never**: commit a real value to git, paste in PR description, or screenshot.

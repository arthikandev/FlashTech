# Render — Backend

## Create service
1. https://render.com → New + → **Web Service** → connect GitHub repo `arthikandev/StudyMAT-AI`.
2. **Root directory**: `backend`
3. **Build command**:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
4. **Start command**:
   ```
   node src/server.js
   ```
5. **Branch**: `main`
6. **Instance**: Free (sleeps after 15 min idle — first request will be slow)

## Environment variables
Add in Settings → Environment:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_URL` | Neon direct URL |
| `JWT_SECRET` | run `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `OPENAI_API_KEY` | from platform.openai.com |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Netlify URL (set after first Netlify deploy) |
| `PORT` | leave blank — Render injects it |

## Verify
- Render dashboard shows **Live**.
- `curl https://<your-service>.onrender.com/health` returns `{"status":"ok"}`.
- Check **Logs** for any startup errors.

## Common issues
- **Prisma client missing**: ensure `npx prisma generate` is in the build command.
- **Migration fails**: confirm `DIRECT_URL` is set (Prisma uses it for migrations).
- **CORS blocked**: `FRONTEND_URL` must exactly match the Netlify origin (no trailing slash).

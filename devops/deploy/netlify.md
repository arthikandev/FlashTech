# Netlify — Frontend

## Connect site
1. https://app.netlify.com → Add new site → Import from Git → pick `arthikandev/StudyMAT-AI`.
2. **Base directory**: `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `frontend/dist`
5. **Branch**: `main`

## Environment variables
Site settings → Environment variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Render backend URL (e.g. `https://studymate-ai.onrender.com`) |

After setting, **trigger a redeploy** — Vite bakes env vars at build time.

## SPA routing
`frontend/public/_redirects` already contains:
```
/*  /index.html  200
```
This is required so React Router routes like `/dashboard` resolve correctly on direct navigation.

## Verify
- Visit the Netlify URL → Landing page loads.
- Open DevTools → Network → confirm requests go to your Render `VITE_API_URL`.
- Register a user → should succeed if backend CORS allows the Netlify origin.

## Common issues
- **404 on refresh**: `_redirects` not in `public/`, or wrong publish dir.
- **CORS errors**: `FRONTEND_URL` env on Render doesn't match Netlify origin.
- **`VITE_API_URL` undefined**: forgot to redeploy after adding env var.

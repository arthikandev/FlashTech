# Deploy frontend to Vercel

Single SPA deployment (**full app**: landing, dashboard, demos). Convex and backend are separate deployments; configure their URLs via Vite env at **build time**.

## 1. Vercel project (root directory)

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` (required — repo is a monorepo) |
| **Framework Preset** | Vite (auto-detected) |
| **Install Command** | `npm install` (default; optional override matches [`vercel.json`](../../frontend/vercel.json)) |
| **Build Command** | `npm run build` (`build` chains **avatar bundle** + TypeScript + Vite — see [`package.json`](../../frontend/package.json)) |
| **Output Directory** | `dist` |

Do **not** use the repo root as the project root; the SPA and `vercel.json` live under `frontend/`.

## 2. Environment variables (Production + Preview)

Set in **Vercel → Project → Settings → Environment Variables** for branches you deploy. **Redeploy** after edits (Vite bakes env into the bundle at build).

| Variable | Required | Purpose |
|----------|-----------|---------|
| `VITE_CONVEX_URL` | **Yes** | Convex HTTP URL (`https://…..convex.cloud`) — dashboard realtime queries |
| `VITE_BACKEND_URL` | Recommended | Deployed backend base (`https://…vercel.app`) — embed/API calls from the browser |
| `VITE_CLERK_PUBLISHABLE_KEY` | If using Clerk | Must match Convex auth setup (see [`docs/ENV.md`](../../docs/ENV.md)) |

**Preview deployments:** Duplicate the same vars for **Preview**, or scope secrets to Production only.

**Convex auth:** Frontend origin (`https://<project>.vercel.app` or custom domain) must be allowed wherever your Convex + Clerk config expects JWT / CORS behavior.

### Clerk redirect URLs (required for Google / SSO)

In **Clerk Dashboard → Configure → Paths** (or **Allowed redirect URLs**), allow your deployed frontend origin plus:

- `https://<your-frontend-host>/login` and `https://<your-frontend-host>/login/*` (includes `/login/sso-callback`)
- `https://<your-frontend-host>/register` and `https://<your-frontend-host>/register/*`
- `https://<your-frontend-host>/onboard`

React Router must use `login/*` and `register/*` routes (not exact `/login` only) so Clerk path-based auth can mount `<SignIn />` on SSO callback.

Template for local parity: [`frontend/.env.example`](../../frontend/.env.example), production sample: `.env.production` (never commit secrets).

## 3. SPA routing

[`frontend/vercel.json`](../../frontend/vercel.json) rewrites non-static paths to `index.html` so client routes (**`/dashboard`**, **`/deck`**, **`/present`**, **`/demos/*`**) and hard refresh work. Static exclusions include `assets/`, `sites/`, **`presenceiq-avatar.js`**, `fake-crm.json`.

## 4. Avatar embed bundle

Production **`npm run build`** runs **`build:avatar`** first (copies [`presenceiq-avatar.js`](../../frontend/public/presenceiq-avatar.js) from the `avatar/` package). Vercel CI uses the same script; no manual copy step needed.

Smoke: after deploy open `https://<your-deployment>/presenceiq-avatar.js` — should return JavaScript.

## 5. Post-deploy smoke checklist

Manual checks after each production deploy:

- [ ] `/` landing loads  
- [ ] `/login` → Google/SSO → brief `/login/sso-callback` → `/onboard` (no blank screen)  
- [ ] `/dashboard` loads (Convex + optional Clerk — network tab shows Convex websocket)    
- [ ] **`/dashboard` hard refresh** (reload) still serves app (SPA rewrite)  
- [ ] `/demos/seylan` (and other `/demos/*`)  
- [ ] `/deck`, `/present` if using pitch flows  
- [ ] `/presenceiq-avatar.js` returns 200  

If dashboard loads but **mutations or auth fail**, verify **Convex** + **backend** allowed origins / Clerk authorized domains match your frontend URL.

CLI from `frontend/`: [`npm run deploy`](../../frontend/package.json) (build + `vercel deploy`).

### Static demo HTML sites

- Seylan: `https://<host>/sites/seylan/index.html#/pricing` — see [`frontend/vite.config.ts`](../../frontend/vite.config.ts) (multi-page `rollupOptions.input`).

## Local frontend dev

```bash
cd backend && npm run dev:3001    # terminal 1 — optional backend
cd frontend && npm run dev        # terminal 2 — `.env.development`
```

Use `npm run dev:deployed` to exercise production env locally.

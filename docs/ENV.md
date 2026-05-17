# Environment variables

PresenceIQ uses **one `.env.example` per app folder** (not at repo root). Next.js and Vite only load env files from the folder where you run `npm run dev`.

## Backend setup (Person 2)

**Step-by-step:** [`backend/SETUP.md`](../backend/SETUP.md)  
**Validate keys:** `cd backend && npm run check:env`

## Which file to copy

| Track | Person | Copy this file | To |
|-------|--------|----------------|-----|
| Backend | Person 2 | [`backend/.env.example`](../backend/.env.example) | `backend/.env.local` |
| Avatar | Person 1 | [`avatar/.env.example`](../avatar/.env.example) | `avatar/.env.local` |
| Frontend | Person 3 | [`frontend/.env.example`](../frontend/.env.example) | `frontend/.env.local` |

## Shared values (must match across tracks)

| Variable | Defined in | Also used by |
|----------|------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | backend | frontend → `VITE_CONVEX_URL` (same URL) |
| `BP_WEBHOOK_SECRET` | backend | avatar (post-call webhook header) |
| `N8N_WEBHOOK_SECRET` | backend | n8n workflows calling backend webhooks |
| `NEXT_PUBLIC_APP_URL` / `BACKEND_URL` | backend | avatar, frontend embed + API calls. **Local dev:** use `http://localhost:3001` when running `npm run dev:3001` |
| `BEYONDPRESENCE_API_KEY` | backend only | Outbound BP API — **do not** copy to `avatar/.env.local` |
| `VITE_CLERK_PUBLISHABLE_KEY` | frontend | Clerk sign-in for dashboard (Person 3) — **not** the Frontend API URL |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex (via `npx convex env set`) | Clerk **Frontend API URL**, e.g. `https://integral-lamprey-56.clerk.accounts.dev` |

**Source of truth for backend + webhooks:** [`backend/.env.example`](../backend/.env.example)

### Backend required keys

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://adamant-puffin-769.convex.cloud` |
| `OPENAI_API_KEY` | Get from platform.openai.com — **never commit real keys** |
| `BEYONDPRESENCE_API_KEY` | [app.bey.chat/settings](https://app.bey.chat/settings) — pipeline syncs agent context |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |
| `SEYLAN_API_BASE_URL` / `SEYLAN_API_KEY` | Hackathon sandbox CRM (`http://34.21.206.87:3000`, `x-api-key` header) |
| `N8N_WEBHOOK_CRM_FETCH` | n8n Cloud — CRM enrichment on fingerprint |
| `N8N_WEBHOOK_SLACK` | n8n Cloud — hot-lead Slack when intent ≥ 80 |
| `N8N_WEBHOOK_CRM_PUSH` | n8n Cloud — post-call CRM log |
| `N8N_WEBHOOK_CHURN` | Optional — churn-risk email workflow |
| If all `N8N_WEBHOOK_*` empty | Uses Seylan sandbox then demo CRM mock |

If `OPENAI_API_KEY` or `BEYONDPRESENCE_API_KEY` was ever committed to git or pasted in chat, rotate at the provider immediately.

**Provider index:** [API_PROVIDERS.md](API_PROVIDERS.md) · **Beyond Presence:** [BEYOND_PRESENCE.md](BEYOND_PRESENCE.md)

## Clerk + Convex Auth (dashboard)

Dashboard Convex queries require a signed-in Clerk user linked to a business via `businessMembers`.

1. Create a Clerk app and enable the [Convex integration](https://dashboard.clerk.com/apps/setup/convex).
2. From `backend/`, set the issuer on your Convex deployment:

   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-app.clerk.accounts.dev
   ```

   Example (integral-lamprey-56): `https://integral-lamprey-56.clerk.accounts.dev`.  
   Clerk Dashboard may label this **Frontend API URL** — it is **not** the Vite `VITE_*` publishable key.

3. Run `npx convex dev` so `convex/auth.config.ts` syncs.
4. Optional — link your Clerk user to the Seylan demo business after seed:

   ```bash
   npx convex run seed:seedDemo '{"clerkUserId":"user_..."}'
   ```

   Find `user_...` in Clerk Dashboard → Users, or sign in once on the frontend and read `identity.subject` from Convex logs.

**Frontend (Person 3):** set `VITE_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local` and wrap the app with `ClerkProvider` + `ConvexProviderWithClerk` ([Convex + Clerk](https://docs.convex.dev/auth/clerk)).

## Convex setup (Person 2)

1. Copy `backend/.env.example` → `backend/.env.local`
2. Set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` (see backend template for `adamant-puffin-769` example)
3. Run `npx convex dev` from `backend/` — it may add dev credentials to `.env.local` automatically
4. For CI/production deploy: use **Deploy Key** from Convex Dashboard → Settings (not the `dev:slug|eyJ...` dev URL token)

## Production (Vercel / Netlify)

Set the same variable names in each platform's dashboard for the matching root directory (`backend/`, `frontend/`).

- **Frontend SPA:** [devops/deploy/frontend-vercel.md](../devops/deploy/frontend-vercel.md) — Root Directory **`frontend/`**, **`npm run build`** (includes **presenceiq-avatar.js** bundle), env: **`VITE_CONVEX_URL`**, **`VITE_BACKEND_URL`**, optional **`VITE_CLERK_PUBLISHABLE_KEY`**. Assign to **Production** and **Preview**; redeploy after changes.
- **Backend:** [devops/deploy/vercel.md](../devops/deploy/vercel.md).

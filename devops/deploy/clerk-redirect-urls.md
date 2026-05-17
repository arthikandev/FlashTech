# Clerk redirect URLs (PresenceIQ frontend)

Configure in [Clerk Dashboard](https://dashboard.clerk.com) → your application → **Configure** → **Paths** (or **Allowed redirect URLs**).

Replace `<host>` with your deployed frontend origin (e.g. `https://frontend-nu-neon-44.vercel.app`).

## Required URLs

| URL | Purpose |
|-----|---------|
| `<host>/login` | Sign-in entry |
| `<host>/login/*` | OAuth SSO callback (`/login/sso-callback`) and other Clerk subpaths |
| `<host>/register` | Sign-up entry |
| `<host>/register/*` | Sign-up OAuth callbacks |
| `<host>/onboard` | Post-auth onboarding |
| `<host>/auth/callback` | Post sign-in redirect ([`LoginPage`](../../frontend/src/auth/LoginPage.tsx) `forceRedirectUrl`) |

## Example (production)

```
https://frontend-nu-neon-44.vercel.app/login
https://frontend-nu-neon-44.vercel.app/login/*
https://frontend-nu-neon-44.vercel.app/register
https://frontend-nu-neon-44.vercel.app/register/*
https://frontend-nu-neon-44.vercel.app/onboard
https://frontend-nu-neon-44.vercel.app/auth/callback
```

## Local dev

```
http://localhost:5173/login
http://localhost:5173/login/*
http://localhost:5173/register
http://localhost:5173/register/*
http://localhost:5173/onboard
http://localhost:5173/auth/callback
```

Also add your frontend origin under **Authorized domains** if Clerk prompts for it.

## Clerk URL vs keys

| Clerk Dashboard label | Where to set it |
|-----------------------|-----------------|
| Frontend API URL (`https://….clerk.accounts.dev`) | Convex: `CLERK_JWT_ISSUER_DOMAIN` via `npx convex env set` |
| Publishable key (`pk_test_…` / `pk_live_…`) | `VITE_CLERK_PUBLISHABLE_KEY` (frontend), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (backend) |
| Secret key (`sk_…`) | `CLERK_SECRET_KEY` in `backend/.env.local` only |

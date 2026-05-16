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
| `<host>/onboard` | Post-auth onboarding (default redirect after login) |

## Example (production)

```
https://frontend-nu-neon-44.vercel.app/login
https://frontend-nu-neon-44.vercel.app/login/*
https://frontend-nu-neon-44.vercel.app/register
https://frontend-nu-neon-44.vercel.app/register/*
https://frontend-nu-neon-44.vercel.app/onboard
```

## Local dev

```
http://localhost:5173/login
http://localhost:5173/login/*
http://localhost:5173/register
http://localhost:5173/register/*
http://localhost:5173/onboard
```

Also add your frontend origin under **Authorized domains** if Clerk prompts for it.

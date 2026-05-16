# PresenceIQ Avatar SDK — embed on demo sites (Person 3)

Load the backend fingerprint embed first, then the avatar SDK. The SDK listens for `presenceiq:ready`, calls `POST /api/pipeline`, and mounts the Beyond Presence iframe when context is synced.

## Script tags

```html
<div id="presenceiq-avatar"></div>

<script src="{BACKEND_URL}/api/embed/seylan-demo" async></script>
<script
  id="presenceiq-avatar-sdk"
  src="{AVATAR_SDK_URL}/presenceiq-avatar.js"
  async
  data-backend-url="{BACKEND_URL}"
  data-webhook-secret="{BP_WEBHOOK_SECRET}"
></script>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-backend-url` | Yes (prod) | Same as `NEXT_PUBLIC_APP_URL` / backend Vercel URL |
| `data-webhook-secret` | Recommended | Must match `BP_WEBHOOK_SECRET` in `backend/.env.local` for post-call webhook |

If `data-backend-url` is omitted, the build defaults to `http://localhost:3000` (dev only).

## Embed keys

| Site | embedKey |
|------|----------|
| Seylan Bank | `seylan-demo` |
| CloudMetrics | `cloudmetrics-demo` |
| Coral Resort | `coral-demo` |

## Local dev

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — avatar harness
cd avatar && cp .env.example .env.local
npm install && npm run dev
# Open http://localhost:5174
```

## Manual init (optional)

```html
<div id="presenceiq-avatar"></motion>
<script src=".../presenceiq-avatar.js"></script>
<script>
  PresenceIQAvatar.init({ container: document.getElementById("presenceiq-avatar") });
</script>
```

Auto-init runs when `#presenceiq-avatar` exists and the bundle loads.

## Hosting the bundle

After `npm run build`, serve `avatar/dist/presenceiq-avatar.js` from a static URL (CDN, Vercel, or copy into `backend/public/` for same-origin delivery).

## Security note

`data-webhook-secret` is visible in the browser. Acceptable for hackathon demo; for production, proxy post-call through a backend route.

# Deploy frontend to Vercel or Netlify (Person 1 supports Person 3)

Run this when `frontend/` has a Vite app (`package.json` with `npm run build`).

## Vercel

1. Import the same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework: Vite (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`

### Environment variables

| Variable | Value |
|----------|-------|
| `VITE_BACKEND_URL` | Production backend URL (same as `NEXT_PUBLIC_APP_URL`) |
| `VITE_CONVEX_URL` | Same as backend `NEXT_PUBLIC_CONVEX_URL` |

## Netlify

1. Base directory: `frontend`
2. Build: `npm run build`
3. Publish: `dist`
4. Same env vars as above (Vite exposes `VITE_*` only).

## Post-deploy

- [ ] Post **Frontend dashboard** URL in root [README.md](../../README.md)
- [ ] Update [docs/DEVELOPMENT_PLAN.md](../../docs/DEVELOPMENT_PLAN.md) Shared URLs
- [ ] Update [dev.md](../../dev.md) section 3
- [ ] Verify embed script uses production `VITE_BACKEND_URL`

## Demo sites

Each site should include:

```html
<div id="presenceiq-avatar"></div>
<script src="https://YOUR_BACKEND/api/embed/cloudmetrics-demo" async></script>
<script src="/presenceiq-avatar.js"></script>
```

Avatar bundle can be copied from `avatar/demo/presenceiq-avatar.js` after `npm run build` in `avatar/`.

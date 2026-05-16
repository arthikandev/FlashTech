#!/usr/bin/env bash
# Link, sync env, and deploy backend + frontend to Vercel production.
# Optional: VERCEL_SCOPE=your-team-slug (default matches vercel-sync-env.sh).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCOPE="${VERCEL_SCOPE:-sarangans-projects-55d6b0e1}"
VERCEL=(vercel --scope "$SCOPE")

echo "=== Backend ==="
cd "$ROOT/backend"
"${VERCEL[@]}" link --yes 2>/dev/null || "${VERCEL[@]}" link --yes
bash "$ROOT/devops/scripts/vercel-sync-env.sh" backend

# Build avatar bundle before frontend deploy
bash "$ROOT/devops/scripts/build-avatar-bundle.sh"

BACKEND_URL="${NEXT_PUBLIC_APP_URL:-}"
if [[ -z "$BACKEND_URL" && -f .env.local ]]; then
  BACKEND_URL="$(grep '^NEXT_PUBLIC_APP_URL=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "'")"
fi

echo "Deploying backend..."
DEPLOY_OUT="$("${VERCEL[@]}" deploy --prod --yes 2>&1)"
echo "$DEPLOY_OUT"
BACKEND_DEPLOYED="$(echo "$DEPLOY_OUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)" || true
if [[ -n "$BACKEND_DEPLOYED" ]]; then
  printf '%s' "$BACKEND_DEPLOYED" | "${VERCEL[@]}" env add NEXT_PUBLIC_APP_URL production --force --yes 2>/dev/null || true
  echo "NEXT_PUBLIC_APP_URL=$BACKEND_DEPLOYED"
fi

echo "=== Frontend ==="
if [[ ! -f "$ROOT/frontend/.env.local" ]]; then
  cp "$ROOT/frontend/.env.example" "$ROOT/frontend/.env.local"
fi
if [[ -n "${BACKEND_DEPLOYED:-}" ]]; then
  grep -q '^VITE_BACKEND_URL=' "$ROOT/frontend/.env.local" && \
    sed -i.bak "s|^VITE_BACKEND_URL=.*|VITE_BACKEND_URL=${BACKEND_DEPLOYED}|" "$ROOT/frontend/.env.local" || \
    echo "VITE_BACKEND_URL=${BACKEND_DEPLOYED}" >> "$ROOT/frontend/.env.local"
  rm -f "$ROOT/frontend/.env.local.bak"
fi
CONVEX_URL="$(grep '^NEXT_PUBLIC_CONVEX_URL=' "$ROOT/backend/.env.local" | cut -d= -f2-)"
if [[ -n "$CONVEX_URL" ]]; then
  grep -q '^VITE_CONVEX_URL=' "$ROOT/frontend/.env.local" && \
    sed -i.bak "s|^VITE_CONVEX_URL=.*|VITE_CONVEX_URL=${CONVEX_URL}|" "$ROOT/frontend/.env.local" || \
    echo "VITE_CONVEX_URL=${CONVEX_URL}" >> "$ROOT/frontend/.env.local"
  rm -f "$ROOT/frontend/.env.local.bak"
fi
CLERK_PK="$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' "$ROOT/backend/.env.local" | cut -d= -f2-)"
if [[ -n "$CLERK_PK" ]]; then
  grep -q '^VITE_CLERK_PUBLISHABLE_KEY=' "$ROOT/frontend/.env.local" && \
    sed -i.bak "s|^VITE_CLERK_PUBLISHABLE_KEY=.*|VITE_CLERK_PUBLISHABLE_KEY=${CLERK_PK}|" "$ROOT/frontend/.env.local" || \
    echo "VITE_CLERK_PUBLISHABLE_KEY=${CLERK_PK}" >> "$ROOT/frontend/.env.local"
  rm -f "$ROOT/frontend/.env.local.bak"
fi

cd "$ROOT/frontend"
"${VERCEL[@]}" link --yes 2>/dev/null || "${VERCEL[@]}" link --yes
bash "$ROOT/devops/scripts/vercel-sync-env.sh" frontend
FE_OUT="$("${VERCEL[@]}" deploy --prod --yes 2>&1)"
echo "$FE_OUT"
FRONTEND_DEPLOYED="$(echo "$FE_OUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)" || true

echo ""
echo "=== Deploy URLs ==="
echo "Backend:  ${BACKEND_DEPLOYED:-see above}"
echo "Frontend: ${FRONTEND_DEPLOYED:-see above}"
echo "Update README.md Live URLs section with these values."

#!/usr/bin/env bash
# Deploy Convex production (non-interactive). Requires CONVEX_DEPLOY_KEY in backend/.env.local.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/backend"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${CONVEX_DEPLOY_KEY:-}" ]]; then
  echo "Set CONVEX_DEPLOY_KEY in backend/.env.local (Convex Dashboard → Settings → Deploy Key)"
  echo "Then re-run: bash devops/scripts/convex-deploy.sh"
  exit 1
fi

unset CONVEX_DEPLOYMENT
npx convex deploy
npx convex run seed:seedDemo "$@"

echo "Set NEXT_PUBLIC_CONVEX_URL to your prod URL from 'npx convex deploy' output."

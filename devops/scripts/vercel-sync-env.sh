#!/usr/bin/env bash
# Push backend/.env.local or frontend env vars to Vercel (production + preview).
# Usage: bash devops/scripts/vercel-sync-env.sh backend|frontend
set -euo pipefail
TARGET="${1:-backend}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

case "$TARGET" in
  backend) DIR="$ROOT/backend"; ENV_FILE="$ROOT/backend/.env.local" ;;
  frontend)
    DIR="$ROOT/frontend"
    if [[ -f "$ROOT/frontend/.env.local" ]]; then
      ENV_FILE="$ROOT/frontend/.env.local"
    elif [[ -f "$ROOT/frontend/.env.production" ]]; then
      ENV_FILE="$ROOT/frontend/.env.production"
      echo "Using frontend/.env.production (no .env.local)"
    else
      echo "Missing frontend/.env.local or frontend/.env.production"
      exit 1
    fi
    ;;
  *)
    echo "Usage: $0 backend|frontend"
    exit 1
    ;;
esac

if [[ "$TARGET" == "backend" && ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

cd "$DIR"
SCOPE="${VERCEL_SCOPE:-sarangans-projects-55d6b0e1}"
if [[ ! -d .vercel ]]; then
  echo "Linking Vercel project in $DIR ..."
  vercel link --yes --scope "$SCOPE"
fi
VERCEL_ARGS=(--scope "$SCOPE")

SKIP='^(#|CONVEX_DEPLOYMENT=|CONVEX_DEPLOY_KEY=|NEXT_PUBLIC_CONVEX_SITE_URL=)'
sync_env_file() {
  local env_name="$1"
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ $SKIP ]] && continue
    [[ -z "${line// }" ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    [[ -z "$val" || "$val" == *"your-"* || "$val" == *"change-me"* && "$key" != *SECRET* ]] && continue
    echo "  → $key ($env_name)"
    printf '%s' "$val" | vercel env add "$key" "$env_name" --force --yes "${VERCEL_ARGS[@]}" 2>/dev/null || \
      printf '%s' "$val" | vercel env add "$key" "$env_name" --force "${VERCEL_ARGS[@]}" 2>/dev/null || true
  done < "$ENV_FILE"
}

for env_name in production preview; do
  echo "Syncing $TARGET → Vercel $env_name ..."
  sync_env_file "$env_name"
done

echo "Done syncing $TARGET env to Vercel (production + preview). Redeploy the frontend project."

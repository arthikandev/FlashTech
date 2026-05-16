#!/usr/bin/env bash
# Push backend/.env.local or frontend/.env.local vars to Vercel (production).
# Usage: bash devops/scripts/vercel-sync-env.sh backend|frontend
set -euo pipefail
TARGET="${1:-backend}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

case "$TARGET" in
  backend) DIR="$ROOT/backend"; ENV_FILE="$ROOT/backend/.env.local" ;;
  frontend) DIR="$ROOT/frontend"; ENV_FILE="$ROOT/frontend/.env.local" ;;
  *)
    echo "Usage: $0 backend|frontend"
    exit 1
    ;;
esac

if [[ ! -f "$ENV_FILE" ]]; then
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
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ $SKIP ]] && continue
  [[ -z "${line// }" ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  [[ -z "$val" || "$val" == *"your-"* || "$val" == *"change-me"* && "$key" != *SECRET* ]] && continue
  echo "  → $key"
  printf '%s' "$val" | vercel env add "$key" production --force --yes "${VERCEL_ARGS[@]}" 2>/dev/null || \
    printf '%s' "$val" | vercel env add "$key" production --force "${VERCEL_ARGS[@]}" 2>/dev/null || true
done < "$ENV_FILE"

echo "Done syncing $TARGET env to Vercel production."

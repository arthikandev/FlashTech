#!/usr/bin/env bash
# Rebuild presenceiq-avatar.js when full monorepo is present (local / deploy-all).
# On Vercel with Root Directory "frontend", ../devops is omitted — skip and rely on
# committed frontend/public/presenceiq-avatar.js.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
SCRIPT="$REPO_ROOT/devops/scripts/build-avatar-bundle.sh"
if [[ -f "$SCRIPT" ]]; then
  exec bash "$SCRIPT"
fi
echo "Skipping avatar rebuild (monorepo devops/scripts not present in this upload)."
PUBLIC="$ROOT/public/presenceiq-avatar.js"
if [[ ! -f "$PUBLIC" ]]; then
  echo "error: missing $PUBLIC — commit the bundle or deploy from repo root via devops/scripts/build-avatar-bundle.sh." >&2
  exit 1
fi

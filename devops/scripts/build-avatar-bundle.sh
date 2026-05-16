#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/avatar"
npm install --silent 2>/dev/null || npm install
npm run build
cp -f demo/presenceiq-avatar.js "$ROOT/frontend/public/presenceiq-avatar.js"
cp -f demo/presenceiq-avatar.js "$ROOT/backend/public/presenceiq-avatar.js"
echo "Copied presenceiq-avatar.js → frontend/public/ and backend/public/"

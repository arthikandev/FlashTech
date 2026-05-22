#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/avatar"
npm install --silent 2>/dev/null || npm install
npm run build
echo "Built presenceiq-avatar.js → frontend/public/ and backend/public/"

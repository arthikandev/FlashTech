#!/usr/bin/env bash
# End-to-end PresenceIQ outbound-webhook automation flow.
# Requires: backend dev server running (npm run dev) in another terminal.
#
# Run from repo root OR backend/:
#   bash devops/scripts/test-automation-flow.sh
#   npm run test:webhooks   # when cwd is backend/
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$REPO_ROOT/backend/.env.local"

load_env_var() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]]; then
    local line
    line=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -1 || true)
    if [[ -n "$line" ]]; then
      echo "${line#*=}" | sed 's/^["'\'']//;s/["'\'']$//'
      return
    fi
  fi
  echo ""
}

BASE="${PRESENCEIQ_BACKEND_URL:-$(load_env_var NEXT_PUBLIC_APP_URL)}"
BASE="${BASE:-http://localhost:3000}"
SECRET="${INBOUND_WEBHOOK_SECRET:-$(load_env_var INBOUND_WEBHOOK_SECRET)}"
SECRET="${SECRET:-$(load_env_var N8N_WEBHOOK_SECRET)}"
SECRET="${SECRET:-change-me-inbound-secret}"
BP_SECRET="${BP_WEBHOOK_SECRET:-$(load_env_var BP_WEBHOOK_SECRET)}"
BP_SECRET="${BP_SECRET:-change-me-bp-secret}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

curl_ok() {
  local url="$1"
  shift
  local out
  local code
  local body
  out=$(curl -sS -w "\n%{http_code}" "$@" "$url" 2>/dev/null) || return 1
  code=$(echo "$out" | tail -1)
  body=$(echo "$out" | sed '$d')
  if [[ "$code" =~ ^2 ]]; then
    echo "$body"
    return 0
  fi
  echo "$body" >&2
  echo "(HTTP $code)" >&2
  return 1
}

echo "=== PresenceIQ automation webhook integration test ==="
echo "Backend: $BASE"
echo "Env file: $ENV_FILE"
echo ""

echo "0. Preflight — is the dev server running?"
PREFLIGHT_OUT=$(curl -sS -w "\n%{http_code}" "$BASE/api/health" -H "Accept: application/json" 2>/dev/null) || PREFLIGHT_OUT=""
PREFLIGHT_CODE=$(echo "$PREFLIGHT_OUT" | tail -1)
PREFLIGHT_BODY=$(echo "$PREFLIGHT_OUT" | sed '$d')
if [[ ! "$PREFLIGHT_CODE" =~ ^2 ]] || ! echo "$PREFLIGHT_BODY" | grep -q '"status"'; then
  HINT="start the backend first:
  cd $REPO_ROOT/backend
  npx convex dev    # terminal 1
  npm run dev       # terminal 2"
  if [[ "$PREFLIGHT_CODE" == "404" ]] || echo "$PREFLIGHT_BODY" | grep -qi '<html'; then
    HINT="$HINT
  Port $BASE may be another app — try: npm run dev:3001
  Then: PRESENCEIQ_BACKEND_URL=http://localhost:3001 npm run test:webhooks"
  else
    HINT="$HINT
  (or npm run dev:3001 if port 3000 is busy)"
  fi
  fail "Cannot reach PresenceIQ at $BASE/api/health (HTTP ${PREFLIGHT_CODE:-none}) — $HINT"
fi
echo "   OK — backend is up"
echo ""

echo "1. Health"
HEALTH=$(curl_ok "$BASE/api/health" -H "Accept: application/json") || fail "Health check failed"
echo "$HEALTH" | head -c 500
echo -e "\n"

echo "2. Fingerprint (may trigger CRM-fetch webhook if WEBHOOK_CRM_FETCH_TRIGGER is set)"
FP=$(curl_ok "$BASE/api/fingerprint" -X POST \
  -H "Content-Type: application/json" \
  -d '{"embedKey":"seylan-demo","fingerprint":"demo-sarangan-fp","path":"/pricing","language":"en"}') \
  || fail "Fingerprint failed"
echo "$FP" | head -c 500
echo ""

VISITOR_ID=$(echo "$FP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('visitorId',''))" 2>/dev/null || true)
BUSINESS_ID=$(echo "$FP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('businessId',''))" 2>/dev/null || true)

if [[ -z "$VISITOR_ID" || -z "$BUSINESS_ID" ]]; then
  fail "Could not parse visitorId/businessId from fingerprint response"
fi

echo "3. Wait for CRM enrichment"
sleep 1

echo "4. Pipeline"
PIPE=$(curl_ok "$BASE/api/pipeline" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"visitorId\":\"$VISITOR_ID\",\"businessId\":\"$BUSINESS_ID\",\"waitForCrmMs\":800}") \
  || fail "Pipeline failed"
echo "$PIPE" | head -c 800
echo ""

echo "5. Inbound CRM webhook (manual patch test) — POST /api/webhooks/crm-ingest"
CRM_PATCH=$(curl_ok "$BASE/api/webhooks/crm-ingest" -X POST \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $SECRET" \
  -d "{\"visitorId\":\"$VISITOR_ID\",\"crmId\":\"CRM-001\",\"crmData\":{\"name\":\"Sarangan\",\"notes\":\"automation test\"}}") \
  || fail "Inbound CRM webhook failed — check INBOUND_WEBHOOK_SECRET or N8N_WEBHOOK_SECRET in .env.local"
echo "$CRM_PATCH" | head -c 200
echo -e "\n"

echo "6. BeyondPresence session webhook (CRM push + triggers)"
SESSION=$(curl_ok "$BASE/api/webhooks/beyondpresence/session" -X POST \
  -H "Content-Type: application/json" \
  -H "X-BP-Webhook-Secret: $BP_SECRET" \
  -d "{\"visitorId\":\"$VISITOR_ID\",\"businessId\":\"$BUSINESS_ID\",\"transcript\":[{\"role\":\"user\",\"text\":\"Tell me about Platinum\",\"timestamp\":1}],\"outcome\":\"informational\",\"sentimentArc\":[{\"turn\":1,\"score\":0.8}],\"actionItems\":[\"Send brochure\"],\"duration\":120}") \
  || fail "BP session webhook failed — check BP_WEBHOOK_SECRET in .env.local"
echo "$SESSION" | head -c 400
echo -e "\n"

echo "Done."
if [[ ! -f "$ENV_FILE" ]] || (! grep -qE '^(WEBHOOK_CRM_FETCH_TRIGGER|N8N_WEBHOOK_CRM_FETCH)=.+' "$ENV_FILE" 2>/dev/null); then
  echo "Note: CRM-fetch webhook unset — Seylan/demo mock used. Configure WEBHOOK_CRM_FETCH_TRIGGER when ready."
else
  echo "Check your automation runner for executions after fingerprint/pipeline calls."
fi

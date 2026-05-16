#!/usr/bin/env bash
# Protect `main`: require 1 PR review, no force-push, no deletions.
# Requires: admin access on the repo (collaborators with write can't run this).
set -euo pipefail

REPO="${1:-arthikandev/StudyMAT-AI}"
BRANCH="${2:-main}"

gh api -X PUT "repos/${REPO}/branches/${BRANCH}/protection" \
  --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Done. Branch protection enabled on ${REPO}@${BRANCH}"

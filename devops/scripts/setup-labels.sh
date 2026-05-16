#!/usr/bin/env bash
# Create GitHub labels for issue tagging.
# Requires: gh CLI authenticated with write access on the repo.
set -euo pipefail

REPO="${1:-arthikandev/StudyMAT-AI}"

declare -a LABELS=(
  "member-a|c084fd|Frontend Lead"
  "member-b|fbbf24|Backend Lead"
  "member-c|34d399|DB & DevOps Lead"
  "frontend|a5b4fc|Frontend area"
  "backend|fcd34d|Backend area"
  "devops|6ee7b7|DevOps / DB area"
  "setup|e5e7eb|Initial setup"
  "auth|fde68a|Authentication"
  "notes|bfdbfe|Notes feature"
  "ai|f0abfc|AI integration"
  "polish|fde2e4|Polish / final"
  "deploy|cbd5e1|Deployment"
)

for entry in "${LABELS[@]}"; do
  IFS='|' read -r name color desc <<< "$entry"
  gh label create "$name" --color "$color" --description "$desc" --repo "$REPO" --force
done

echo "Done. Labels created on $REPO"

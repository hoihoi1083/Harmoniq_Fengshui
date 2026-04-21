#!/usr/bin/env bash
# Run ON THE SERVER where Next.js listens (e.g. EC2 + PM2), or set BASE_URL to a public HTTPS host.
# Calls POST /api/cron/weekly-emails with a shared secret (never commit the secret).
#
# Env:
#   BASE_URL          — default http://127.0.0.1:3000
#   CRON_SECRET       — preferred; else WEEKLY_CRON_SECRET or EMAIL_TEST_SECRET
#
# Usage:
#   chmod +x scripts/trigger-weekly-emails-cron.sh
#   CRON_SECRET='your-secret' ./scripts/trigger-weekly-emails-cron.sh
#   CRON_SECRET='x' ./scripts/trigger-weekly-emails-cron.sh '{"dryRun":true}'
#   CRON_SECRET='x' ./scripts/trigger-weekly-emails-cron.sh '{"skipAi":true,"limit":5}'

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
SECRET="${CRON_SECRET:-${WEEKLY_CRON_SECRET:-${EMAIL_TEST_SECRET:-}}}"
BODY="${1:-{}}"

if [[ -z "$SECRET" ]]; then
	echo "ERROR: Set CRON_SECRET (or WEEKLY_CRON_SECRET / EMAIL_TEST_SECRET)." >&2
	exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
	echo "ERROR: curl is not installed." >&2
	exit 1
fi

echo "POST ${BASE_URL}/api/cron/weekly-emails"
curl -sS --max-time 0 -X POST "${BASE_URL}/api/cron/weekly-emails" \
	-H "Content-Type: application/json" \
	-H "x-cron-secret: ${SECRET}" \
	-d "${BODY}"
echo ""

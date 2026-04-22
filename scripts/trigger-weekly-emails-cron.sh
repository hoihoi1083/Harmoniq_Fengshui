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
if [[ $# -gt 0 ]]; then
	BODY="$1"
else
	BODY='{}'
fi

if [[ -z "$SECRET" ]]; then
	echo "ERROR: Set CRON_SECRET (or WEEKLY_CRON_SECRET / EMAIL_TEST_SECRET)." >&2
	exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
	echo "ERROR: curl is not installed." >&2
	exit 1
fi

echo "POST ${BASE_URL}/api/cron/weekly-emails"
echo "Triggered at: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Payload: ${BODY}"

# Some hosts may kill curl intermittently; prefer python urllib for stability.
if command -v python3 >/dev/null 2>&1; then
	BASE_URL="$BASE_URL" SECRET="$SECRET" BODY="$BODY" python3 - <<'PY'
import json
import os
import sys
import urllib.request

base_url = os.environ["BASE_URL"].rstrip("/")
secret = os.environ["SECRET"]
body_raw = os.environ.get("BODY", "{}")
url = f"{base_url}/api/cron/weekly-emails"

try:
    payload = json.loads(body_raw)
    data = json.dumps(payload).encode("utf-8")
except Exception:
    print(f"ERROR: BODY is not valid JSON: {body_raw!r}", file=sys.stderr)
    sys.exit(1)
req = urllib.request.Request(
    url,
    data=data,
    method="POST",
    headers={
        "Content-Type": "application/json",
        "x-cron-secret": secret,
    },
)

try:
    with urllib.request.urlopen(req, timeout=300) as resp:
        text = resp.read().decode("utf-8", errors="replace")
        print(text)
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")
    print(body)
    sys.exit(1)
except Exception as e:
    print(f"ERROR: request failed: {e}", file=sys.stderr)
    sys.exit(1)
PY
else
	curl -4 -sS --max-time 300 -X POST "${BASE_URL}/api/cron/weekly-emails" \
		-H "Content-Type: application/json" \
		-H "x-cron-secret: ${SECRET}" \
		-d "${BODY}"
	echo ""
fi

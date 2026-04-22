#!/usr/bin/env bash
# Wrapper for server cron: reads CRON_SECRET from .env safely, then triggers weekly emails.
#
# Usage:
#   chmod +x scripts/run-weekly-cron.sh
#   ./scripts/run-weekly-cron.sh
#   ./scripts/run-weekly-cron.sh '{"dryRun":true,"limit":10}'
#
# Env overrides:
#   APP_DIR   - project root (default: parent of this script)
#   BASE_URL  - API base URL (default: http://<private-ip>:3000)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
ENV_FILE="$APP_DIR/.env"
TRIGGER_SCRIPT="$APP_DIR/scripts/trigger-weekly-emails-cron.sh"
if [[ $# -gt 0 ]]; then
	PAYLOAD="$1"
else
	PAYLOAD='{"dryRun":false,"limit":200}'
fi

if [[ ! -f "$ENV_FILE" ]]; then
	echo "ERROR: .env not found at $ENV_FILE" >&2
	exit 1
fi

if [[ ! -x "$TRIGGER_SCRIPT" ]]; then
	echo "ERROR: trigger script is missing/executable bit not set: $TRIGGER_SCRIPT" >&2
	exit 1
fi

# Read CRON_SECRET only (avoid sourcing whole .env with special chars like '&').
CRON_SECRET_VALUE="$(
	awk -F= '/^[[:space:]]*CRON_SECRET=/{sub(/^[[:space:]]*CRON_SECRET=/,""); print; exit}' "$ENV_FILE"
)"

if [[ -z "${CRON_SECRET_VALUE:-}" ]]; then
	echo "ERROR: CRON_SECRET missing in $ENV_FILE" >&2
	exit 1
fi

if [[ -z "${BASE_URL:-}" ]]; then
	PRIVATE_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
	if [[ -n "$PRIVATE_IP" ]]; then
		BASE_URL="http://${PRIVATE_IP}:3000"
	else
		BASE_URL="http://127.0.0.1:3000"
	fi
fi

echo "Running weekly cron wrapper"
echo "Base URL: $BASE_URL"
echo "Wrapper payload: $PAYLOAD"

BASE_URL="$BASE_URL" CRON_SECRET="$CRON_SECRET_VALUE" "$TRIGGER_SCRIPT" "$PAYLOAD"

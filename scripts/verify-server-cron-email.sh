#!/usr/bin/env bash
# Run ON THE PRODUCTION / STAGING SERVER (SSH), not on your laptop.
# Verifies: (1) Next app responds on localhost, (2) Resend alert email works.
# Cron itself must be checked separately — see printed instructions below.
#
# Usage:
#   chmod +x scripts/verify-server-cron-email.sh
#   ./scripts/verify-server-cron-email.sh
#   BASE_URL=http://127.0.0.1:3000 ./scripts/verify-server-cron-email.sh

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
ALERT_PATH="/api/send-alert"

echo "=== HarmoniqFengShui: server email + HTTP smoke test ==="
echo "Target: ${BASE_URL}"
echo ""

if ! command -v curl >/dev/null 2>&1; then
	echo "ERROR: curl is not installed."
	exit 1
fi

echo "1) GET / (or any public page) — expect HTTP 200"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "${BASE_URL}/" || echo "000")
echo "    HTTP ${code}"
if [[ "$code" != "200" && "$code" != "307" && "$code" != "302" ]]; then
	echo "    WARN: unexpected code (is Next.js running on this port?)"
fi
echo ""

echo "2) POST ${ALERT_PATH} — Resend alert (same as monitor-health.sh)"
resp=$(curl -s -w "\n__HTTP__%{http_code}" --max-time 30 -X POST "${BASE_URL}${ALERT_PATH}" \
	-H "Content-Type: application/json" \
	-d '{"subject":"Cron/email verify script","message":"If you receive this, Resend + localhost route work on this server."}' || true)

http="${resp##*$'\n'__HTTP__}"
body="${resp%$'\n'__HTTP__*}"
echo "    HTTP ${http}"
echo "    Body: ${body}"
if echo "$body" | grep -q '"success":true' && echo "$body" | grep -q '"id":"'; then
	echo "    OK: send-alert sent (Resend id present). Check inbox: hoihoi1083@gmail.com"
elif echo "$body" | grep -q '"success":true'; then
	echo "    FAIL: send-alert returned success but no Resend id — RESEND_API_KEY may be invalid."
	exit 1
else
	echo "    FAIL: fix RESEND_API_KEY / app logs / pm2 before relying on cron email."
	exit 1
fi
echo ""

echo "3) Optional — weekly test route (only if you use EMAIL_TEST_SECRET on this host)"
if [[ -n "${EMAIL_TEST_SECRET:-}" ]]; then
	wresp=$(curl -s --max-time 120 -X POST "${BASE_URL}/api/email/test-weekly" \
		-H "Content-Type: application/json" \
		-H "x-email-test-secret: ${EMAIL_TEST_SECRET}" \
		-d '{"to":"hoihoi1083@gmail.com","skipAi":true}' || true)
	echo "    ${wresp:0:200}..."
else
	echo "    Skipped (set EMAIL_TEST_SECRET in the shell to test test-weekly)."
fi
echo ""

echo "=== Cron smoke test (manual) ==="
echo "Cron is independent of Node: use these on the SAME machine where crontab will run."
echo ""
echo "  A) Is cron running? (Amazon Linux / systemd)"
echo "     sudo systemctl status crond   # or: cron"
echo ""
echo "  B) One-off proof cron fires (runs every 2 minutes, logs to /tmp)"
echo "     (crontab -l 2>/dev/null; echo '*/2 * * * * date >> /tmp/cron-smoke-test.log 2>&1') | crontab -"
echo "     sleep 130 && tail -5 /tmp/cron-smoke-test.log"
echo "     Then remove the test line: crontab -e"
echo ""
echo "  C) See existing jobs"
echo "     crontab -l"
echo ""
echo "Done."

#!/bin/bash
# Run on your Mac to check if deployment is live. Usage: ./scripts/check-deployment-status.sh

set -e
HOST="${1:-fs}"

echo "Checking deployment status (SSH host: $HOST)..."
echo ""

# Run all checks in one SSH session so we only connect once
ssh -o ConnectTimeout=10 "$HOST" 'bash -s' << 'REMOTE'
echo "=== PM2 status ==="
pm2 status 2>/dev/null || echo "(pm2 not found or no apps)"
echo ""
echo "=== App responding on port 3000? ==="
PRIVATE_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "$PRIVATE_IP" ]; then
  BASE_URL="http://${PRIVATE_IP}:3000"
else
  BASE_URL="http://127.0.0.1:3000"
fi

check_http() {
  local url="$1"
  if command -v python3 >/dev/null 2>&1; then
    URL="$url" python3 - <<'PY'
import os
import urllib.request

url = os.environ["URL"]
code = 0
try:
    with urllib.request.urlopen(url, timeout=4) as resp:
        code = resp.getcode()
except Exception:
    code = 0
print(code)
PY
  else
    curl -4 -s -o /dev/null -w "%{http_code}" --connect-timeout 4 "$url" 2>/dev/null || echo "000"
  fi
}

CODE=$(check_http "$BASE_URL")
if [ "$CODE" = "200" ] || [ "$CODE" = "301" ] || [ "$CODE" = "302" ] || [ "$CODE" = "307" ]; then
  echo "Yes - ${BASE_URL} HTTP $CODE"
  echo ""
  echo "✅ Deployment appears LIVE. Site should be up."
else
  FALLBACK_URL="http://127.0.0.1:3000"
  FALLBACK_CODE=$(check_http "$FALLBACK_URL")
  if [ "$FALLBACK_CODE" = "200" ] || [ "$FALLBACK_CODE" = "301" ] || [ "$FALLBACK_CODE" = "302" ] || [ "$FALLBACK_CODE" = "307" ]; then
    echo "Yes - ${FALLBACK_URL} HTTP $FALLBACK_CODE"
    echo ""
    echo "✅ Deployment appears LIVE. Site should be up."
  else
    echo "No - ${BASE_URL} HTTP $CODE"
    echo "No - ${FALLBACK_URL} HTTP $FALLBACK_CODE"
    echo ""
    echo "❌ App not responding. Deploy may still be running or have failed."
  fi
fi
echo ""
echo "=== Last 3 lines of PM2 out log (if any) ==="
tail -3 ~/fengshui-layout/logs/out-0.log 2>/dev/null || echo "(no log)"
REMOTE

echo ""
echo "Done. If you see 'Deployment appears LIVE' above, open https://www.harmoniqfengshui.com"

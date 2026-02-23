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
CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:3000 2>/dev/null || echo "000")
if [ "$CODE" = "200" ] || [ "$CODE" = "301" ] || [ "$CODE" = "302" ]; then
  echo "Yes - HTTP $CODE"
  echo ""
  echo "✅ Deployment appears LIVE. Site should be up."
else
  echo "No - HTTP $CODE (or connection failed)"
  echo ""
  echo "❌ App not responding. Deploy may still be running or have failed."
fi
echo ""
echo "=== Last 3 lines of PM2 out log (if any) ==="
tail -3 ~/fengshui-layout/logs/out-0.log 2>/dev/null || echo "(no log)"
REMOTE

echo ""
echo "Done. If you see 'Deployment appears LIVE' above, open https://www.harmoniqfengshui.com"

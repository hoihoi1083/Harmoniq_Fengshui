#!/bin/bash
# AWS server readiness check for FengShuiLayout deploy (PM2 + rsync flow per DEPLOYMENT_GUIDE / complete-deployment.sh)
# Run on EC2 via SSH:  ssh fs 'bash -s' < scripts/aws-server-readiness-check.sh
# Or copy to server:   scp scripts/aws-server-readiness-check.sh fs:~/ && ssh fs 'chmod +x aws-server-readiness-check.sh && ./aws-server-readiness-check.sh'

set -e
REPORT=()
fail() { REPORT+=("FAIL: $1"); }
ok()   { REPORT+=("OK:   $1"); }
warn() { REPORT+=("WARN: $1"); }

# Same path as complete-deployment.sh and DEPLOYMENT_GUIDE
DEPLOY_DIR="/home/ec2-user/fengshui-layout"

echo "=============================================="
echo "  FengShuiLayout AWS server readiness check"
echo "  (PM2 + rsync deploy: $DEPLOY_DIR)"
echo "=============================================="
echo ""

# 1. Disk space (deploy moves .next to .next.backup then builds, so peak need is ~1GB for new .next)
echo "[1] Disk space"
AVAIL_GB=$(df -BG / | awk 'NR==2 {print $4}' | tr -d 'G' 2>/dev/null || echo "0")
AVAIL_MB=$(df -m / | awk 'NR==2 {print $4}' 2>/dev/null || echo "0")
if [ -n "$AVAIL_MB" ] && [ "$AVAIL_MB" -ge 850 ]; then
  ok "At least ~850MB free on / (found ${AVAIL_MB}MB). Enough for deploy (script moves .next then builds)."
elif [ -n "$AVAIL_GB" ] && [ "$AVAIL_GB" -ge 1 ]; then
  ok "At least 1GB free on / (found ${AVAIL_GB}GB)"
else
  fail "Low disk space on / (found ${AVAIL_MB:-${AVAIL_GB:-?}}MB). Need >= 900MB for build. Free space: delete xmrig*/logs, trim logs/."
fi
echo ""

# 2. Node.js 18+
echo "[2] Node.js"
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v 2>/dev/null || true)
  NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
  if [ -n "$NODE_MAJOR" ] && [ "$NODE_MAJOR" -ge 18 ]; then
    ok "Node.js $NODE_VER (18+ required)"
  else
    warn "Node.js $NODE_VER (18+ recommended; current may work)"
  fi
else
  fail "Node.js not installed. Install Node 18+ (e.g. nvm install 18)"
fi
echo ""

# 3. PM2
echo "[3] PM2"
if command -v pm2 >/dev/null 2>&1; then
  ok "PM2 installed: $(pm2 -v 2>/dev/null || echo 'present')"
else
  fail "PM2 not installed. Install: npm install -g pm2"
fi
echo ""

# 4. Deploy directory
echo "[4] Deploy directory: $DEPLOY_DIR"
if [ -d "$DEPLOY_DIR" ]; then
  ok "Directory exists"
  if [ -f "$DEPLOY_DIR/package.json" ]; then
    ok "package.json present"
  else
    warn "No package.json (deploy will rsync it from local)"
  fi
  if [ -f "$DEPLOY_DIR/ecosystem.config.json" ]; then
    ok "ecosystem.config.json present"
  else
    warn "No ecosystem.config.json (deploy may overwrite; script expects it on server or in backup)"
  fi
else
  fail "Directory does not exist. Create: sudo mkdir -p $DEPLOY_DIR && sudo chown ec2-user $DEPLOY_DIR"
fi
echo ""

# 5. Port 3000
echo "[5] Port 3000"
if command -v ss >/dev/null 2>&1; then
  IN_USE=$(ss -tlnp 2>/dev/null | grep -c ':3000 ' || true)
elif command -v netstat >/dev/null 2>&1; then
  IN_USE=$(netstat -tlnp 2>/dev/null | grep -c ':3000 ' || true)
else
  IN_USE=$(lsof -i :3000 2>/dev/null | wc -l || true)
fi
if [ "${IN_USE:-0}" -eq 0 ]; then
  ok "Port 3000 is free"
else
  warn "Port 3000 in use (deploy stops PM2 then restarts; OK if current app)"
fi
echo ""

# 6. Env / config
echo "[6] Environment and config"
if [ -f "$DEPLOY_DIR/.env.production" ] || [ -f "$DEPLOY_DIR/.env" ]; then
  ok "Found .env or .env.production (required for NEXTAUTH_*, MONGODB_URI, STRIPE_*, etc.)"
else
  fail "No .env or .env.production in $DEPLOY_DIR. Copy from env-template-aws.env and fill values."
fi
echo ""

# 7. npm (for build on server)
echo "[7] npm"
if command -v npm >/dev/null 2>&1; then
  ok "npm installed: $(npm -v 2>/dev/null || true)"
else
  fail "npm not found (required for npm run build on server)"
fi
echo ""

# Summary
echo "=============================================="
echo "  Summary"
echo "=============================================="
for line in "${REPORT[@]}"; do echo "$line"; done
echo ""

FAIL_COUNT=$(printf '%s\n' "${REPORT[@]}" | grep -c "FAIL:" || true)
if [ "${FAIL_COUNT:-0}" -gt 0 ]; then
  echo "Fix FAIL items before deploying."
  exit 1
fi
echo "Server is ready for deploy (./complete-deployment.sh or ./secure-deployment.sh). Address WARN items if needed."
exit 0

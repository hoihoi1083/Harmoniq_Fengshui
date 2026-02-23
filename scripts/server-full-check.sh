#!/bin/bash
# Server health + security check. Run on server or: ssh fs 'bash -s' < scripts/server-full-check.sh
# Uses server paths; safe to run from local via ssh fs 'bash -s' < this_file

set -e
PROJECT_DIR="${FENGSHUI_LAYOUT:-/home/ec2-user/fengshui-layout}"
REPORT="/tmp/server-check-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee "$REPORT") 2>&1

echo "=============================================="
echo "SERVER FULL CHECK - $(date)"
echo "=============================================="

echo ""
echo "=== 1. DISK SPACE ==="
df -h /
df -h /home 2>/dev/null || true
echo ""
echo "Largest dirs under $PROJECT_DIR (top 5):"
du -sh "$PROJECT_DIR"/*/ 2>/dev/null | sort -hr | head -5 || true

echo ""
echo "=== 2. MEMORY ==="
free -h
echo ""
echo "Top 5 memory-consuming processes:"
ps aux --sort=-%mem | head -6

echo ""
echo "=== 3. PM2 & APP STATUS ==="
pm2 list 2>/dev/null || echo "(pm2 not running or not in PATH)"
echo ""
echo "Local app response:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 2>/dev/null || echo "curl failed"

echo ""
echo "=== 4. MALWARE CHECK ==="
echo "4a. Known miner/malware paths in project dir:"
for name in xmrig xmrig-6.21.0 xmrig.tar.gz linux_amd64 lrt pulseadio .pulseadio scanner_linux mist bbs nul; do
    if [ -e "$PROJECT_DIR/$name" ]; then
        echo "  FOUND: $PROJECT_DIR/$name"
        ls -la "$PROJECT_DIR/$name" 2>/dev/null
    fi
done
find "$PROJECT_DIR" -maxdepth 2 -name 'xmrig*' 2>/dev/null | while read -r f; do echo "  FOUND: $f"; done
echo "4b. Known malware in home dir:"
for name in .pulseadio pulseadio; do
    if [ -e "$HOME/$name" ]; then
        echo "  FOUND: $HOME/$name"
        ls -la "$HOME/$name" 2>/dev/null
    fi
done
echo "4c. Suspicious processes (miners / high CPU):"
ps aux | grep -iE 'xmrig|cpuminer|minerd|stratum|pulseadio|cryptonight' | grep -v grep || echo "  (none found)"
echo "4d. Hugepages (often used by miners):"
sysctl vm.nr_hugepages 2>/dev/null || echo "  (cannot read)"
echo "4e. Listening ports (first 20):"
ss -tlnp 2>/dev/null | head -20 || netstat -tlnp 2>/dev/null | head -20 || true

echo ""
echo "=== 5. CRONTAB (look for suspicious) ==="
crontab -l 2>/dev/null || echo "(no crontab)"
echo ""
echo "Suspicious cron patterns (wget/curl to .sh, miner names; exclude our scripts):"
crontab -l 2>/dev/null | grep -v '^#' | grep -v '^$' | while read -r line; do
    # Skip known-good project scripts
    echo "$line" | grep -qE 'detect-miners|monitor-health|file-integrity|security-audit|pm2 resurrect' && continue
    if echo "$line" | grep -iE 'wget.*\.sh|curl.*\.sh|xmrig|miner|pulseadio|/tmp/.*\.sh|\.hidden'; then
        echo "  REVIEW: $line"
    fi
done || true

echo ""
echo "=== 6. RECENT LOG (detect-miners) ==="
if [ -f /home/ec2-user/miner-detection.log ]; then
    tail -20 /home/ec2-user/miner-detection.log
else
    echo "  (no miner-detection.log)"
fi

echo ""
echo "=== 7. FILE LOCKS (protected files) ==="
for f in package.json ecosystem.config.json next.config.js .env.production; do
    if [ -f "$PROJECT_DIR/$f" ]; then
        attrs=$(lsattr "$PROJECT_DIR/$f" 2>/dev/null | awk '{print $1}')
        echo "  $f: $attrs"
    fi
done

echo ""
echo "=============================================="
echo "REPORT SAVED: $REPORT"
echo "=============================================="

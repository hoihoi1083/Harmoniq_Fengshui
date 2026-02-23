#!/bin/bash
# Free disk space on EC2 deploy server (run ON the server, or via: ssh fs 'bash -s' < scripts/server-free-disk-space.sh)
# Run from project root on server: cd /home/ec2-user/fengshui-layout && bash server-free-disk-space.sh
# Or from local: ssh fs 'cd fengshui-layout && bash -s' < scripts/server-free-disk-space.sh

set -e
cd /home/ec2-user/fengshui-layout 2>/dev/null || cd ~/fengshui-layout || { echo "Run from fengshui-layout dir"; exit 1; }

echo "=== Before ==="
df -h / | grep -E 'Filesystem|/'

echo ""
echo "--- 1. Remove malware / suspicious files (xmrig = crypto miner) ---"
rm -rf xmrig-6.21.0 xmrig.tar.gz xmrig-auto.tar.gz 2>/dev/null && echo "Removed xmrig*" || true
rm -f linux_amd64 lrt scanner_linux mist bbs b nul 2>/dev/null || true

echo ""
echo "--- 2. Trim large logs (keep last 5000 lines each) ---"
for f in logs/security-audit.log logs/combined-1.log logs/err-1.log logs/err-0.log; do
  if [ -f "$f" ] && [ "$(stat -c%s "$f" 2>/dev/null)" -gt 10485760 ]; then
    tail -5000 "$f" > "$f.tmp" && mv "$f.tmp" "$f" && echo "Trimmed $f" || true
  fi
done

echo ""
echo "--- 3. Optional: clear PM2 in-memory logs (does not delete log files) ---"
pm2 flush 2>/dev/null && echo "PM2 logs flushed" || true

echo ""
echo "--- 4. Optional: to free ~1GB, remove .next.backup on server: rm -rf .next.backup ---"

echo ""
echo "=== After ==="
df -h / | grep -E 'Filesystem|/'

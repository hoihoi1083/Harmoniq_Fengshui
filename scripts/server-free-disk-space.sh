#!/bin/bash
# Free disk space on EC2 deploy server (run ON the server, or via: ssh fs 'bash -s' < scripts/server-free-disk-space.sh)
# Run from project root on server: cd /home/ec2-user/fengshui-layout && bash server-free-disk-space.sh
# Or from local: ssh fs 'cd fengshui-layout && bash -s' < scripts/server-free-disk-space.sh

set -e
cd /home/ec2-user/fengshui-layout 2>/dev/null || cd ~/fengshui-layout || { echo "Run from fengshui-layout dir"; exit 1; }

echo "=== Before ==="
df -h /

echo ""
echo "--- 1. Remove malware / suspicious files (xmrig = crypto miner) ---"
rm -rf xmrig-6.21.0 xmrig.tar.gz xmrig-auto.tar.gz 2>/dev/null && echo "Removed xmrig*" || true
rm -f linux_amd64 lrt scanner_linux mist bbs b nul 2>/dev/null || true

echo ""
echo "--- 2. Trim large logs under logs/ (keep last 5000 lines if file > 10MB) ---"
if [ -d logs ]; then
  find logs -maxdepth 1 -type f -name '*.log' 2>/dev/null | while read -r f; do
    sz=$(stat -c%s "$f" 2>/dev/null || echo 0)
    if [ "$sz" -gt 10485760 ]; then
      tail -5000 "$f" > "$f.tmp" && mv "$f.tmp" "$f" && echo "Trimmed $f" || true
    fi
  done
fi

echo ""
echo "--- 3. Remove old rotated PM2 / app log files (optional) ---"
rm -f logs/*.log.old logs/*.log.*.gz 2>/dev/null && echo "Removed old rotated logs in logs/" || true

echo ""
echo "--- 4. PM2 flush (clears in-memory buffers; use with log rotation) ---"
pm2 flush 2>/dev/null && echo "PM2 logs flushed" || true

echo ""
echo "--- 5. System journal (optional, frees space if journal is huge) ---"
if command -v journalctl >/dev/null 2>&1; then
  sudo journalctl --vacuum-time=7d 2>/dev/null && echo "Journal vacuumed to 7 days" || echo "(journalctl vacuum skipped or needs sudo)"
fi

echo ""
echo "--- 6. Large deploy backup: rm -rf .next.backup (only if you don't need rollback) ---"
if [ -d .next.backup ]; then
  du -sh .next.backup 2>/dev/null || true
  echo "To remove: rm -rf .next.backup   # frees ~1GB+ depending on build size"
fi

echo ""
echo "=== After ==="
df -h /

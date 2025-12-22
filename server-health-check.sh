#!/bin/bash
# Server Health and Security Check Script
# Run this weekly to check for malware and system health

echo "🔍 Server Health & Security Check"
echo "=================================="
echo "Date: $(date)"
echo ""

# 1. Check for crypto miners
echo "1️⃣ Checking for crypto miners..."
MINERS=$(ps aux | grep -iE 'xmrig|cpuminer|monero|kinsing' | grep -v grep)
if [ -z "$MINERS" ]; then
    echo "   ✅ No crypto miners detected"
else
    echo "   🚨 ALERT: Crypto miners found!"
    echo "$MINERS"
fi
echo ""

# 2. Check memory usage
echo "2️⃣ Memory Status:"
free -h | grep -E 'Mem|Swap'
MEM_USED=$(free | grep Mem | awk '{print ($3/$2) * 100.0}' | cut -d. -f1)
if [ "$MEM_USED" -gt 85 ]; then
    echo "   ⚠️  WARNING: Memory usage at ${MEM_USED}%"
else
    echo "   ✅ Memory healthy (${MEM_USED}% used)"
fi
echo ""

# 3. Check disk space
echo "3️⃣ Disk Space:"
df -h / | tail -1
DISK_USED=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USED" -gt 90 ]; then
    echo "   🚨 ALERT: Disk space critical (${DISK_USED}%)"
elif [ "$DISK_USED" -gt 80 ]; then
    echo "   ⚠️  WARNING: Disk space high (${DISK_USED}%)"
else
    echo "   ✅ Disk space healthy (${DISK_USED}% used)"
fi
echo ""

# 4. Check CPU usage
echo "4️⃣ CPU Load:"
uptime
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
LOAD_INT=$(echo "$LOAD * 100" | bc | cut -d. -f1)
if [ "$LOAD_INT" -gt 200 ]; then
    echo "   🚨 ALERT: High CPU load ($LOAD)"
else
    echo "   ✅ CPU load normal ($LOAD)"
fi
echo ""

# 5. Check security services status
echo "5️⃣ Security Services Status..."
FAIL2BAN=$(sudo systemctl is-active fail2ban 2>/dev/null)
FIREWALLD=$(sudo systemctl is-active firewalld 2>/dev/null)
if [ "$FAIL2BAN" = "active" ]; then
    echo "   ✅ Fail2ban: Active"
else
    echo "   🚨 ALERT: Fail2ban not running!"
fi
if [ "$FIREWALLD" = "active" ]; then
    echo "   ✅ Firewalld: Active"
else
    echo "   🚨 ALERT: Firewalld not running!"
fi
echo ""

# 6. Check for suspicious systemd services
echo "6️⃣ Checking systemd services..."
SUSPICIOUS=$(systemctl list-units --all | grep -iE 'miner|xmrig|crypto|ocean' | grep -v 'miner-detection')
if [ -z "$SUSPICIOUS" ]; then
    echo "   ✅ No suspicious services"
else
    echo "   🚨 ALERT: Suspicious services found!"
    echo "$SUSPICIOUS"
fi
echo ""

# 6. Check for suspicious systemd services
echo "6️⃣ Checking systemd services..."
SUSPICIOUS=$(systemctl list-units --all | grep -iE 'miner|xmrig|crypto|ocean' | grep -v 'miner-detection')
if [ -z "$SUSPICIOUS" ]; then
    echo "   ✅ No suspicious services"
else
    echo "   🚨 ALERT: Suspicious services found!"
    echo "$SUSPICIOUS"
fi
echo ""

# 7. Check hugepages (crypto miner trick)
echo "7️⃣ Checking hugepages allocation..."
HUGEPAGES=$(sysctl vm.nr_hugepages | awk '{print $3}')
if [ "$HUGEPAGES" -gt 0 ]; then
    echo "   🚨 ALERT: Hugepages allocated: $HUGEPAGES (crypto miner indicator!)"
else
    echo "   ✅ No hugepages allocation"
fi
echo ""

# 8. Check cron monitoring
echo "8️⃣ Checking automated monitoring..."
CRON_CHECK=$(crontab -l 2>/dev/null | grep -c detect-miners)
if [ "$CRON_CHECK" -gt 0 ]; then
    echo "   ✅ Miner detection cron job active"
    crontab -l | grep detect-miners
else
    echo "   🚨 ALERT: Miner detection cron job not found!"
fi
echo ""

# 9. Check mining port blocks
echo "9️⃣ Checking firewall rules..."
BLOCKED_PORTS=$(sudo firewall-cmd --list-rich-rules 2>/dev/null | grep -c "reject")
if [ "$BLOCKED_PORTS" -ge 7 ]; then
    echo "   ✅ Mining ports blocked ($BLOCKED_PORTS rules active)"
else
    echo "   ⚠️  WARNING: Mining port blocks incomplete ($BLOCKED_PORTS/7)"
fi
echo ""

# 10. Check /tmp noexec mount
echo "🔟 Checking /tmp security..."
TMP_NOEXEC=$(mount | grep "/tmp" | grep -c "noexec")
if [ "$TMP_NOEXEC" -gt 0 ]; then
    echo "   ✅ /tmp mounted with noexec"
else
    echo "   ⚠️  WARNING: /tmp not mounted with noexec"
fi
echo ""

# 11. Check hugepages (crypto miner trick)
echo "1️⃣1️⃣ Checking network connectivity..."
HTTP_TEST=$(timeout 3 curl -s -o /dev/null -w "%{http_code}" http://api.deepseek.com 2>/dev/null || echo "timeout")
HTTPS_TEST=$(timeout 3 curl -s -o /dev/null -w "%{http_code}" https://api.deepseek.com 2>/dev/null || echo "timeout")
if [ "$HTTP_TEST" != "timeout" ] && [ "$HTTPS_TEST" != "timeout" ]; then
    echo "   ✅ Outbound connectivity working (HTTP: $HTTP_TEST, HTTPS: $HTTPS_TEST)"
else
    echo "   🚨 ALERT: Outbound connectivity blocked!"
fi
echo ""

# 12. Check PM2 status
echo "1️⃣2️⃣ Application Status:"
pm2 list | grep -E 'online|status'
PM2_ERRORS=$(pm2 list | grep -c 'errored\|stopped')
if [ "$PM2_ERRORS" -gt 0 ]; then
    echo "   ⚠️  WARNING: $PM2_ERRORS PM2 processes not running"
else
    echo "   ✅ All apps running"
fi
echo ""

# 13. Check for failed SSH login attempts
echo "1️⃣3️⃣ Recent failed SSH logins (last 24 hours):"
FAILED_LOGINS=$(sudo journalctl -u sshd --since "24 hours ago" | grep -c "Failed password")
echo "   Failed attempts: $FAILED_LOGINS"
if [ "$FAILED_LOGINS" -gt 50 ]; then
    echo "   🚨 ALERT: High number of failed SSH attempts!"
elif [ "$FAILED_LOGINS" -gt 10 ]; then
    echo "   ⚠️  WARNING: Moderate failed SSH attempts"
else
    echo "   ✅ Normal SSH activity"
fi
echo ""

# 14. Check log sizes
echo "1️⃣4️⃣ Log directory size:"
LOG_SIZE=$(du -sh ~/fengshui-layout/logs 2>/dev/null | awk '{print $1}')
echo "   Current size: $LOG_SIZE"
echo ""

# 15. Check website accessibility & response time
echo "1️⃣5️⃣ Website Health Check:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null)
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}s" https://www.harmoniqfengshui.com 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Website responding (HTTP $RESPONSE)"
    echo "   ⏱️  Response time: $RESPONSE_TIME"
else
    echo "   🚨 ALERT: Website not responding (HTTP $RESPONSE)"
fi
echo ""

# Summary
echo "=================================="
echo "✅ Health check complete!"
echo "Run this script weekly: ./server-health-check.sh"
echo ""

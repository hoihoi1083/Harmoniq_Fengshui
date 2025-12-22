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

# 6. Check hugepages (crypto miner trick)
echo "6️⃣ Checking hugepages allocation..."
HUGEPAGES=$(sysctl vm.nr_hugepages | awk '{print $3}')
if [ "$HUGEPAGES" -gt 0 ]; then
    echo "   🚨 ALERT: Hugepages allocated: $HUGEPAGES (crypto miner indicator!)"
else
    echo "   ✅ No hugepages allocation"
fi
echo ""

# 7. Check PM2 status
echo "7️⃣ Application Status:"
pm2 list | grep -E 'online|status'
PM2_ERRORS=$(pm2 list | grep -c 'errored\|stopped')
if [ "$PM2_ERRORS" -gt 0 ]; then
    echo "   ⚠️  WARNING: $PM2_ERRORS PM2 processes not running"
else
    echo "   ✅ All apps running"
fi
echo ""

# 8. Check for failed SSH login attempts
echo "8️⃣ Recent failed SSH logins (last 24 hours):"
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

# 9. Check log sizes
echo "9️⃣ Log directory size:"
LOG_SIZE=$(du -sh ~/fengshui-layout/logs 2>/dev/null | awk '{print $1}')
echo "   Current size: $LOG_SIZE"
echo ""

# 10. Check website accessibility
echo "🔟 Website Health Check:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Website responding (HTTP $RESPONSE)"
else
    echo "   🚨 ALERT: Website not responding (HTTP $RESPONSE)"
fi
echo ""

# Summary
echo "=================================="
echo "✅ Health check complete!"
echo "Run this script weekly: ./server-health-check.sh"
echo ""

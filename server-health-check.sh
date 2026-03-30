#!/bin/bash
# Server Health and Security Check Script
# Run this weekly to check for malware and system health

# Track critical alerts
CRITICAL_ALERTS=0
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔍 Server Health & Security Check"
echo "=================================="
echo "Date: $(date)"
echo ""

# 1. Check for crypto miners (COMPREHENSIVE - catches hidden & disguised miners)
echo "1️⃣ Checking for crypto miners..."
# Check for known miner names (including n0de, xm64, etc.)
MINERS=$(ps aux | grep -iE 'xmrig|cpuminer|monero|kinsing|n0de|xm64|minergate|stratum' | grep -v grep)
# Check for processes connecting to common mining ports (including 80, 443 disguise)
MINING_PORTS=$(sudo netstat -antp 2>/dev/null | grep ESTABLISHED | grep -E ':3333|:4444|:5555|:7777|:8888|:9999|:14433|:14444|:30002' | grep -v '127.0.0.1')
# Check for suspicious executables in tmp AND hidden user directories
SUSPICIOUS_BINS=$(find /tmp /var/tmp /dev/shm ~/.cache-* ~/.local/share/.wd* ~/.local/share/.bd* ~/.config/.wd* ~/.config/.bd* -type f -executable 2>/dev/null | grep -vE 'systemd|yum|dnf|gpg|spotify|google|microsoft|vscode' | head -20)
# Check for disguised process names (gvfs-*, worker-*, daemon-*, etc.)
DISGUISED=$(ps aux | grep -vE '(grep|ps aux)' | grep -E '\.gvfs-[0-9]|\.worker-|\.config-[0-9]|\.daemon-|\.run-|\.pd_|\.helper-|cache.*worker' | head -5)
# Check for hidden malware directories
HIDDEN_DIRS=$(find ~ -maxdepth 2 -type d -name '.cache-*' -o -name '.*worker*' -o -name '.*miner*' 2>/dev/null)
# Check for multiple watchdog processes (5+ similar named processes)
WATCHDOGS=$(ps aux | awk '{print $11}' | grep -E '^\..*-[0-9a-f]{6}$' | sort | uniq -c | awk '$1 >= 5 {print $2}')

if [ -z "$MINERS" ] && [ -z "$MINING_PORTS" ] && [ -z "$SUSPICIOUS_BINS" ] && [ -z "$DISGUISED" ] && [ -z "$HIDDEN_DIRS" ] && [ -z "$WATCHDOGS" ]; then
    echo "   ✅ No crypto miners detected"
else
    echo "   🚨 ALERT: Crypto miners found!"
    [ -n "$MINERS" ] && echo "   Known miners: $MINERS"
    [ -n "$MINING_PORTS" ] && echo "   Mining connections: $MINING_PORTS"
    [ -n "$SUSPICIOUS_BINS" ] && echo "   Suspicious binaries: $SUSPICIOUS_BINS"
    [ -n "$DISGUISED" ] && echo "   Disguised processes: $DISGUISED"
    [ -n "$HIDDEN_DIRS" ] && echo "   Hidden directories: $HIDDEN_DIRS"
    [ -n "$WATCHDOGS" ] && echo "   Watchdog processes: $WATCHDOGS"
    CRITICAL_ALERTS=$((CRITICAL_ALERTS + 1))
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

# 3. Check disk space (avoid df|tail pipe — can show "broken pipe" / SIGPIPE under I/O pressure)
echo "3️⃣ Disk Space:"
df -h /
DISK_USED=$(df -P / 2>/dev/null | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
case "$DISK_USED" in ''|*[!0-9]*) DISK_USED=0 ;; esac
if [ "$DISK_USED" -gt 90 ]; then
    echo "   🚨 ALERT: Disk space critical (${DISK_USED}%)"
elif [ "$DISK_USED" -gt 80 ]; then
    echo "   ⚠️  WARNING: Disk space high (${DISK_USED}%)"
else
    echo "   ✅ Disk space healthy (${DISK_USED}% used)"
fi
echo ""

# 4. Check CPU usage (including nice/stealth miners)
echo "4️⃣ CPU Load:"
uptime
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
LOAD_INT=$(echo "$LOAD * 100" | bc | cut -d. -f1)
if [ "$LOAD_INT" -gt 200 ]; then
    echo "   🚨 ALERT: High CPU load ($LOAD)"
else
    echo "   ✅ CPU load normal ($LOAD)"
fi

# Check for high 'nice' CPU usage (miner stealth tactic)
if command -v mpstat >/dev/null 2>&1; then
    NICE_CPU=$(mpstat 1 1 | tail -1 | awk '{print $4}' | cut -d. -f1)
    if [ "$NICE_CPU" -gt 30 ]; then
        echo "   🚨 ALERT: High 'nice' CPU usage: ${NICE_CPU}% (stealth miner indicator!)"
        CRITICAL_ALERTS=$((CRITICAL_ALERTS + 1))
    fi
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

# 8. Check cron monitoring + malicious cron jobs
echo "8️⃣ Checking automated monitoring & malicious cron..."
HEALTH_CHECK=$(crontab -l 2>/dev/null | grep -c "monitor-health.sh")
INTEGRITY_CHECK=$(crontab -l 2>/dev/null | grep -c "file-integrity-monitor.sh")
SECURITY_AUDIT=$(crontab -l 2>/dev/null | grep -c "security-audit.sh")

if [ "$HEALTH_CHECK" -gt 0 ] && [ "$INTEGRITY_CHECK" -gt 0 ] && [ "$SECURITY_AUDIT" -gt 0 ]; then
    echo "   ✅ All monitoring cron jobs active"
    echo "      - Health check: Every 5 minutes"
    echo "      - Integrity monitor: Daily at 2 AM"
    echo "      - Security audit: Weekly Sunday 3 AM"
else
    echo "   ⚠️  WARNING: Some monitoring cron jobs missing!"
    [ "$HEALTH_CHECK" -eq 0 ] && echo "      ❌ Health check cron not found"
    [ "$INTEGRITY_CHECK" -eq 0 ] && echo "      ❌ Integrity monitor cron not found"
    [ "$SECURITY_AUDIT" -eq 0 ] && echo "      ❌ Security audit cron not found"
fi

# Check for malicious cron entries (exclude our own security scripts: monitor-health, file-integrity, security-audit, detect-miners)
MALICIOUS_CRON=$(crontab -l 2>/dev/null | grep -vE '^#|monitor-health|file-integrity|security-audit|detect-miners' | grep -iE 'cache|worker|miner|\.gvfs|\.pd_|curl.*sh|wget.*sh|/tmp/|/var/tmp/' | head -5)
if [ -n "$MALICIOUS_CRON" ]; then
    echo "   🚨 ALERT: Suspicious cron entries detected!"
    echo "$MALICIOUS_CRON" | sed 's/^/      /'
    CRITICAL_ALERTS=$((CRITICAL_ALERTS + 1))
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
# Test local API health endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
# Test public website (accept 200, 301, 302, 307 as healthy)
PUBLIC_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://www.harmoniqfengshui.com 2>/dev/null || echo "000")
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}s" https://www.harmoniqfengshui.com 2>/dev/null || echo "N/A")

# Check if local API is responding
if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Local API responding (HTTP $RESPONSE)"
else
    echo "   ⚠️  Local API status: HTTP $RESPONSE"
fi

# Check if public website is responding (redirects are OK)
if [[ "$PUBLIC_RESPONSE" =~ ^(200|301|302|307)$ ]]; then
    echo "   ✅ Public website responding (HTTP $PUBLIC_RESPONSE)"
    echo "   ⏱️  Response time: $RESPONSE_TIME"
else
    echo "   🚨 ALERT: Public website not responding (HTTP $PUBLIC_RESPONSE)"
fi
echo ""

# 16. Check file integrity
echo "1️⃣6️⃣ File Integrity Check:"
if [ -f "$HOME/fengshui-layout/.file-checksums" ]; then
    CONFIG_SIZE=$(stat -c%s "$HOME/fengshui-layout/next.config.js" 2>/dev/null || stat -f%z "$HOME/fengshui-layout/next.config.js" 2>/dev/null)
    if [ "$CONFIG_SIZE" -gt 5000 ]; then
        echo "   🚨 ALERT: next.config.js is suspiciously large ($CONFIG_SIZE bytes)!"
        echo "   Run: ./file-integrity-monitor.sh"
    else
        echo "   ✅ Config files normal size ($CONFIG_SIZE bytes)"
    fi
    
    # Check for recent integrity alerts
    if [ -f "$HOME/fengshui-layout/logs/integrity-alerts.log" ]; then
        RECENT_ALERTS=$(tail -5 "$HOME/fengshui-layout/logs/integrity-alerts.log" 2>/dev/null | wc -l)
        if [ "$RECENT_ALERTS" -gt 0 ]; then
            echo "   ⚠️  $RECENT_ALERTS recent integrity alerts"
            echo "   Review: tail $HOME/fengshui-layout/logs/integrity-alerts.log"
        fi
    fi
else
    echo "   ℹ️  File integrity monitoring not initialized"
    echo "   Run: ./file-integrity-monitor.sh"
fi
echo ""

# 17. Quick malware scan
echo "1️⃣7️⃣ Quick Malware Scan:"
OBFUSCATED=$(grep -l "_0x[0-9a-f]\{6\}" "$HOME/fengshui-layout/next.config.js" "$HOME/fengshui-layout/server.js" 2>/dev/null)
if [ -n "$OBFUSCATED" ]; then
    echo "   🚨 CRITICAL: Obfuscated code detected in config files!"
    echo "$OBFUSCATED" | sed 's/^/      /'
    echo "   IMMEDIATE ACTION REQUIRED!"
else
    echo "   ✅ No obfuscated code in config files"
fi
echo ""

# 18. Check shell startup file tampering
echo "1️⃣8️⃣ Shell Startup File Integrity:"
STARTUP_MALWARE=$(grep -H -E 'cache-d50bfb|worker-1f2fd4|\.gvfs-|\.pd_|curl.*\|.*sh|wget.*\|.*sh' ~/.bashrc ~/.bash_profile ~/.profile 2>/dev/null)
if [ -n "$STARTUP_MALWARE" ]; then
    echo "   🚨 CRITICAL: Malware detected in shell startup files!"
    echo "$STARTUP_MALWARE" | sed 's/^/      /'
    CRITICAL_ALERTS=$((CRITICAL_ALERTS + 1))
else
    echo "   ✅ Shell startup files clean"
fi
echo ""

# 19. Check for malware backup copies
echo "1️⃣9️⃣ Checking for malware backups:"
BACKUPS=$(find ~/.local/share ~/.config -type f -name '.wd_*' -o -name '.bd_*' 2>/dev/null | grep -vE 'node_modules|pnpm|fnm|npm' | head -10)
if [ -n "$BACKUPS" ]; then
    echo "   🚨 ALERT: Suspicious backup files found!"
    echo "$BACKUPS" | sed 's/^/      /'
    CRITICAL_ALERTS=$((CRITICAL_ALERTS + 1))
else
    echo "   ✅ No suspicious backups detected"
fi
echo ""

# Summary
echo "=================================="
echo "✅ Health check complete!"
echo ""

# Send critical alerts via email
if [ $CRITICAL_ALERTS -gt 0 ]; then
    if [ -f "$SCRIPT_DIR/send-alert-email.sh" ]; then
        ALERT_MSG="Critical Server Health Issues!

Server: $(hostname)
Critical alerts: $CRITICAL_ALERTS

Issues may include:
- PM2 processes down
- High memory usage (>90%)
- Crypto miners detected
- Suspicious services running
- Config file tampering

Check logs: ssh fs 'tail -100 ~/fengshui-layout/logs/health-check.log'"
        bash "$SCRIPT_DIR/send-alert-email.sh" "🚨 Critical Server Health Alert" "$ALERT_MSG"
    fi
fi

echo "📋 Available Security Tools:"
echo "   ./file-integrity-monitor.sh  - Monitor file changes (run daily)"
echo "   ./security-audit.sh          - Scan for malware (run weekly)"
echo "   ./pre-deployment-check.sh    - Check before deploying"
echo ""

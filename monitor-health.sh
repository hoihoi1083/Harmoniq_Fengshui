#!/bin/bash
# Website Health Monitor
# Run this script with cron to check website health

WEBSITE="https://www.harmoniqfengshui.com"
EMAIL="your-email@example.com"  # Change this to your email
LOG_FILE="/home/ec2-user/fengshui-layout/health-check.log"
NTFY_TOPIC="harmoniq-fengshui-alerts-d1747d49"

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Check if website is responding
response=$(curl -L -s -o /dev/null -w "%{http_code}" --max-time 10 "$WEBSITE")

# Check CPU usage (warn if user processes exceed 80%)
cpu_usage=$(ps aux --no-headers | awk '{if ($1 != "root") sum += $3} END {print sum}')
cpu_alert=""
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    cpu_alert="⚠️ High CPU: ${cpu_usage}%"
    echo "[$timestamp] $cpu_alert" >> "$LOG_FILE"
    curl -s -d "$cpu_alert" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1
fi

# Check for suspicious processes (crypto miners)
suspicious=$(ps aux | grep -vE "(grep|ps aux)" | grep -iE "(xmrig|cpuminer|stratum|mine|gvfs-[0-9]|\.cache.*worker)" | head -5)
if [ -n "$suspicious" ]; then
    echo "[$timestamp] 🚨 SUSPICIOUS PROCESS DETECTED!" >> "$LOG_FILE"
    echo "$suspicious" >> "$LOG_FILE"
    curl -s -d "🚨 Suspicious process detected on server" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1
fi

# Check for unauthorized cron jobs
malicious_cron=$(crontab -l 2>/dev/null | grep -vE "^#|monitor-health|file-integrity|security-audit" | grep -E "cache|worker|miner" || echo "")
if [ -n "$malicious_cron" ]; then
    echo "[$timestamp] 🚨 MALICIOUS CRON DETECTED: $malicious_cron" >> "$LOG_FILE"
    curl -s -d "🚨 Malicious cron job detected" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1
fi

if [ "$response" != "200" ]; then
    echo "[$timestamp] ❌ Website DOWN! HTTP Status: $response" >> "$LOG_FILE"
    curl -s -d "❌ Website DOWN! HTTP Status: $response" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1
    exit 1
else
    echo "[$timestamp] ✅ Website OK (HTTP $response) $cpu_alert" >> "$LOG_FILE"
    exit 0
fi

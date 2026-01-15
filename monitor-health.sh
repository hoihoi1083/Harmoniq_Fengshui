#!/bin/bash
# Website Health Monitor
# Run this script with cron to check website health

WEBSITE="https://www.harmoniqfengshui.com"
EMAIL="hoihoi1083@gmail.com"
LOG_FILE="/home/ec2-user/fengshui-layout/health-check.log"
API_ALERT="http://localhost:3000/api/send-alert"

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Function to send alert email via API (same mechanism as shopping emails)
send_alert() {
    local subject="$1"
    local message="$2"
    local priority="${3:-false}"
    
    curl -s -X POST "$API_ALERT" \
        -H "Content-Type: application/json" \
        -d "{\"subject\":\"$subject\",\"message\":\"$message\",\"priority\":$priority}" \
        --max-time 5 >/dev/null 2>&1 || true
}

# Check if website is responding (accept 200, 301, 302, 307 as healthy)
response=$(curl -L -s -o /dev/null -w "%{http_code}" --max-time 10 "$WEBSITE" 2>/dev/null || echo "000")

# Check CPU usage (warn if user processes exceed 80%)
cpu_usage=$(ps aux --no-headers | awk '{if ($1 != "root") sum += $3} END {print sum}')
cpu_alert=""
if (( $(echo "$cpu_usage > 80" | bc -l 2>/dev/null || echo 0) )); then
    cpu_alert="⚠️ High CPU: ${cpu_usage}%"
    echo "[$timestamp] $cpu_alert" >> "$LOG_FILE"
    send_alert "High CPU Usage Warning" "CPU usage by user processes: ${cpu_usage}%\nTimestamp: $timestamp" false
fi

# Check for suspicious processes (crypto miners)
suspicious=$(ps aux | grep -vE "(grep|ps aux)" | grep -iE "(xmrig|cpuminer|stratum|mine|gvfs-[0-9]|\.cache.*worker)" | head -5)
if [ -n "$suspicious" ]; then
    echo "[$timestamp] 🚨 SUSPICIOUS PROCESS DETECTED!" >> "$LOG_FILE"
    echo "$suspicious" >> "$LOG_FILE"
    send_alert "SECURITY ALERT: Suspicious Process" "Suspicious process detected:\n\n$suspicious\n\nTimestamp: $timestamp" true
fi

# Check for unauthorized cron jobs
malicious_cron=$(crontab -l 2>/dev/null | grep -vE "^#|monitor-health|file-integrity|security-audit" | grep -E "cache|worker|miner" || echo "")
if [ -n "$malicious_cron" ]; then
    echo "[$timestamp] 🚨 MALICIOUS CRON DETECTED: $malicious_cron" >> "$LOG_FILE"
    send_alert "SECURITY ALERT: Malicious Cron Job" "Unauthorized cron job detected:\n\n$malicious_cron\n\nTimestamp: $timestamp" true
fi

# Check if website is healthy (accept redirects as OK)
if [[ "$response" =~ ^(200|301|302|307)$ ]]; then
    echo "[$timestamp] ✅ Website OK (HTTP $response) $cpu_alert" >> "$LOG_FILE"
    exit 0
else
    echo "[$timestamp] ❌ Website DOWN! HTTP Status: $response" >> "$LOG_FILE"
    send_alert "Website DOWN" "Website is not responding!\n\nHTTP Status: $response\nURL: $WEBSITE\nTimestamp: $timestamp" true
    exit 1
fi

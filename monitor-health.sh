#!/bin/bash
# Website Health Monitor
# Run this script with cron to check website health

WEBSITE="https://www.harmoniqfengshui.com"
EMAIL="hoihoi1083@gmail.com"
LOG_FILE="/home/ec2-user/fengshui-layout/health-check.log"
API_ALERT="http://127.0.0.1:3000/api/send-alert"
LOCAL_HEALTH_URL="http://127.0.0.1:3000/api/health"
STATE_FILE="/home/ec2-user/fengshui-layout/health-check.state"
PUBLIC_RETRIES=3
CONNECT_TIMEOUT=5
MAX_TIME=15
COOLDOWN_SECONDS=1800

timestamp=$(date '+%Y-%m-%d %H:%M:%S')
epoch_now=$(date +%s)

# Load previous state (if any)
fail_count=0
last_alert_ts=0
if [ -f "$STATE_FILE" ]; then
    # shellcheck disable=SC1090
    source "$STATE_FILE" 2>/dev/null || true
fi

save_state() {
    cat > "$STATE_FILE" <<EOF
fail_count=$fail_count
last_alert_ts=$last_alert_ts
EOF
}

# Function to send alert email via API (same mechanism as shopping emails)
send_alert() {
    local subject="$1"
    local message="$2"
    local priority="${3:-false}"
    
    curl -4 -s -X POST "$API_ALERT" \
        -H "Content-Type: application/json" \
        -d "{\"subject\":\"$subject\",\"message\":\"$message\",\"priority\":$priority}" \
        --max-time 5 >/dev/null 2>&1 || true
}

# Check local app route first (helps distinguish internet jitter vs real app down)
local_response=$(curl -4 -s -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 8 "$LOCAL_HEALTH_URL" 2>/dev/null || echo "000")

# Check public website with retries (accept 200, 301, 302, 307 as healthy)
response="000"
attempt=1
while [ $attempt -le $PUBLIC_RETRIES ]; do
    code=$(curl -L -s -o /dev/null -w "%{http_code}" \
        --connect-timeout "$CONNECT_TIMEOUT" \
        --max-time "$MAX_TIME" \
        --retry 0 \
        --ipv4 \
        "$WEBSITE" 2>/dev/null || echo "000")

    if [[ "$code" =~ ^(200|301|302|307)$ ]]; then
        response="$code"
        break
    fi

    response="$code"
    attempt=$((attempt + 1))
    [ $attempt -le $PUBLIC_RETRIES ] && sleep 3
done

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
malicious_cron=$(crontab -l 2>/dev/null | grep -vE "^#|monitor-health|file-integrity|security-audit|detect-miners" | grep -E "cache|worker|miner" || echo "")
if [ -n "$malicious_cron" ]; then
    echo "[$timestamp] 🚨 MALICIOUS CRON DETECTED: $malicious_cron" >> "$LOG_FILE"
    send_alert "SECURITY ALERT: Malicious Cron Job" "Unauthorized cron job detected:\n\n$malicious_cron\n\nTimestamp: $timestamp" true
fi

# Check if website is healthy (accept redirects as OK)
if [[ "$response" =~ ^(200|301|302|307)$ ]]; then
    fail_count=0
    save_state
    echo "[$timestamp] ✅ Website OK (HTTP $response) $cpu_alert" >> "$LOG_FILE"
    exit 0
else
    fail_count=$((fail_count + 1))
    save_state

    echo "[$timestamp] ❌ Website check failed (HTTP $response), fail_count=$fail_count, local_api=$local_response" >> "$LOG_FILE"

    # Require at least 2 consecutive failed runs before DOWN alert.
    if [ "$fail_count" -lt 2 ]; then
        exit 1
    fi

    # Cooldown to avoid repeated email spam.
    if [ $((epoch_now - last_alert_ts)) -lt $COOLDOWN_SECONDS ]; then
        exit 1
    fi

    # If local API works but public URL fails, this is likely DNS/TLS/network edge issue.
    if [[ "$local_response" =~ ^(200|301|302|307)$ ]]; then
        send_alert "Website Public Check Unstable" "Public URL check failed but local API is reachable.\n\nPublic HTTP: $response\nLocal API HTTP: $local_response\nURL: $WEBSITE\nTimestamp: $timestamp\nNote: likely transient DNS/TLS/network issue from server side." false
    else
        send_alert "Website DOWN" "Website is not responding!\n\nHTTP Status: $response\nLocal API: $local_response\nURL: $WEBSITE\nTimestamp: $timestamp" true
    fi

    last_alert_ts=$epoch_now
    save_state
    exit 1
fi

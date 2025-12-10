#!/bin/bash
# Website Health Monitor
# Run this script with cron to check website health

WEBSITE="https://www.harmoniqfengshui.com"
EMAIL="your-email@example.com"  # Change this to your email
LOG_FILE="/home/ec2-user/fengshui-layout/health-check.log"

# Check if website is responding
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$WEBSITE")

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$response" != "200" ]; then
    echo "[$timestamp] ❌ Website DOWN! HTTP Status: $response" >> "$LOG_FILE"
    
    # Send email alert (requires mailx or sendmail configured)
    # echo "Website $WEBSITE is down! HTTP Status: $response" | mail -s "🚨 Website Alert" "$EMAIL"
    
    # Or use curl to call a webhook (Slack, Discord, etc.)
    # curl -X POST "YOUR_WEBHOOK_URL" -d "{\"text\":\"Website is down!\"}"
    
    exit 1
else
    echo "[$timestamp] ✅ Website OK (HTTP $response)" >> "$LOG_FILE"
    exit 0
fi

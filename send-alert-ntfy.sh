#!/bin/bash
# Email Alert System using ntfy.sh (free push notification service)
# Works around AWS EC2 SMTP restrictions

ALERT_EMAIL="hoihoi1083@gmail.com"
SUBJECT="$1"
MESSAGE="$2"
SERVER_NAME=$(hostname)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')

# Use ntfy.sh - free push notification service
# You can receive notifications via:
# 1. Mobile app (search "ntfy" in app store)
# 2. Email (subscribe to topic via email)
# 3. Web browser (https://ntfy.sh/harmoniq-fengshui-alerts)

NTFY_TOPIC="harmoniq-fengshui-alerts-$(echo $SERVER_NAME | md5sum | cut -c1-8)"

# Send to ntfy.sh
curl -H "Title: [$SERVER_NAME] $SUBJECT" \
     -H "Priority: high" \
     -H "Tags: warning,rotating_light" \
     -H "Email: $ALERT_EMAIL" \
     -d "$MESSAGE

Server: $SERVER_NAME
Time: $TIMESTAMP

View logs:
ssh fs 'tail -100 ~/fengshui-layout/logs/health-check.log'" \
     https://ntfy.sh/$NTFY_TOPIC 2>&1

# Also log locally
LOG_FILE=~/fengshui-layout/logs/email-alerts.log
mkdir -p ~/fengshui-layout/logs
echo "========================================" >> "$LOG_FILE"
echo "[$TIMESTAMP] Alert: $SUBJECT" >> "$LOG_FILE"
echo "$MESSAGE" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

echo ""
echo "✓ Alert sent via ntfy.sh push notification"
echo "✓ Alert logged to: $LOG_FILE"
echo ""
echo "📱 To receive alerts on your phone:"
echo "   1. Install 'ntfy' app from App Store/Play Store"
echo "   2. Subscribe to topic: $NTFY_TOPIC"
echo ""
echo "📧 To receive via email:"
echo "   Visit: https://ntfy.sh/$NTFY_TOPIC"
echo "   Click 'Subscribe' and enter: $ALERT_EMAIL"

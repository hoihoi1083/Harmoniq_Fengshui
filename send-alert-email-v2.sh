#!/bin/bash
# Enhanced Email Alert System using Multiple Methods
# Tries multiple delivery methods to ensure alerts reach you

ALERT_EMAIL="hoihoi1083@gmail.com"
SUBJECT="$1"
MESSAGE="$2"
SERVER_NAME=$(hostname)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')

# Create email body
EMAIL_BODY="
========================================
🚨 FENG SHUI LAYOUT SECURITY ALERT
========================================

Server: $SERVER_NAME
Time: $TIMESTAMP

$MESSAGE

========================================
Action Required: Please review the logs immediately

View logs:
- ssh fs 'tail -100 ~/fengshui-layout/logs/integrity-alerts.log'
- ssh fs 'tail -100 ~/fengshui-layout/logs/security-audit.log'
- ssh fs 'tail -100 ~/fengshui-layout/logs/health-check.log'

========================================
"

# Method 1: Try mailx (simple, often works)
send_via_mailx() {
    if command -v mail &> /dev/null; then
        echo "$EMAIL_BODY" | mail -s "[$SERVER_NAME] $SUBJECT" "$ALERT_EMAIL" 2>/dev/null
        return $?
    fi
    return 1
}

# Method 2: Try using Gmail SMTP via mailx with credentials
send_via_smtp() {
    if command -v mail &> /dev/null; then
        # This would require SMTP configuration in /etc/mail.rc
        echo "$EMAIL_BODY" | mail -v -s "[$SERVER_NAME] $SUBJECT" "$ALERT_EMAIL" 2>&1 | tee -a ~/fengshui-layout/logs/email-debug.log
        return $?
    fi
    return 1
}

# Method 3: Use a simple email API (mailgun, sendgrid, etc.)
# This requires API key - placeholder for future
send_via_api() {
    # You would set up an API key here
    # curl -s --user "api:YOUR_API_KEY" \
    #   https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
    #   -F from="alerts@harmoniqfengshui.online" \
    #   -F to="$ALERT_EMAIL" \
    #   -F subject="[$SERVER_NAME] $SUBJECT" \
    #   -F text="$EMAIL_BODY"
    return 1
}

# Method 4: Log to file as fallback (always works)
log_to_file() {
    LOG_FILE=~/fengshui-layout/logs/email-alerts.log
    mkdir -p ~/fengshui-layout/logs
    echo "========================================" >> "$LOG_FILE"
    echo "[$TIMESTAMP] ALERT NOT EMAILED (delivery failed)" >> "$LOG_FILE"
    echo "Subject: $SUBJECT" >> "$LOG_FILE"
    echo "$MESSAGE" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    return 0
}

# Try methods in order
echo "Attempting to send alert: $SUBJECT"

if send_via_mailx; then
    echo "✓ Alert sent via mailx"
    exit 0
elif send_via_smtp; then
    echo "✓ Alert sent via SMTP"
    exit 0
elif send_via_api; then
    echo "✓ Alert sent via API"
    exit 0
else
    echo "⚠️  Email delivery failed - logged to file instead"
    log_to_file
    echo "   Check: ~/fengshui-layout/logs/email-alerts.log"
    echo ""
    echo "To fix email delivery, you need to configure AWS SES or use an SMTP relay."
    echo "For now, alerts are logged to: ~/fengshui-layout/logs/email-alerts.log"
fi

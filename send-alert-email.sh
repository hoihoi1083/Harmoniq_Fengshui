#!/bin/bash
# Email Alert System for Security Monitoring
# Sends critical alerts to admin email

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

# Send email using mail command (requires mailutils)
if command -v mail &> /dev/null; then
    echo "$EMAIL_BODY" | mail -s "[$SERVER_NAME] $SUBJECT" "$ALERT_EMAIL"
    echo "✓ Alert email sent to $ALERT_EMAIL"
elif command -v sendmail &> /dev/null; then
    {
        echo "To: $ALERT_EMAIL"
        echo "Subject: [$SERVER_NAME] $SUBJECT"
        echo "Content-Type: text/plain; charset=UTF-8"
        echo ""
        echo "$EMAIL_BODY"
    } | sendmail -t
    echo "✓ Alert email sent to $ALERT_EMAIL (via sendmail)"
else
    # Fallback: Log to file if no email command available
    echo "[$(date)] FAILED TO SEND EMAIL - No mail command available" >> ~/fengshui-layout/logs/email-failures.log
    echo "⚠️  Email not sent - mail command not available"
    echo "   Install with: sudo yum install mailx -y"
fi
